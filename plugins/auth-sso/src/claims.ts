import { ClaimsMappingConfig, IdpType, SsoUser } from "./types"

export const DEFAULT_PRESET_MAPPINGS: Record<IdpType, ClaimsMappingConfig> = {
  okta: {
    idKey: "sub",
    emailKey: "email",
    nameKey: "name",
    roleKey: "groups",
    defaultRole: "viewer",
  },
  "azure-ad": {
    idKey: "oid",
    emailKey: "preferred_username",
    nameKey: "name",
    roleKey: "roles",
    tenantIdKey: "tid",
    defaultRole: "viewer",
  },
  google: {
    idKey: "sub",
    emailKey: "email",
    nameKey: "name",
    avatarKey: "picture",
    defaultRole: "viewer",
  },
  keycloak: {
    idKey: "sub",
    emailKey: "email",
    nameKey: "preferred_username",
    roleKey: "realm_access.roles",
    defaultRole: "viewer",
  },
  oidc: {
    idKey: "sub",
    emailKey: "email",
    nameKey: "name",
    roleKey: "role",
    defaultRole: "viewer",
  },
  saml: {
    idKey: "nameID",
    emailKey: "email",
    nameKey: "displayName",
    roleKey: "groups",
    defaultRole: "viewer",
  },
  custom: {
    idKey: "id",
    emailKey: "email",
    nameKey: "name",
    defaultRole: "viewer",
  },
}

function getNestedValue(obj: Record<string, any>, pathStr?: string): any {
  if (!pathStr || !obj) return undefined
  const parts = pathStr.split(".")
  let current: any = obj
  for (const part of parts) {
    if (current == null) return undefined
    current = current[part]
  }
  return current
}

export function mapClaimsToUser(
  rawClaims: Record<string, any>,
  customMapping?: ClaimsMappingConfig,
  providerType: IdpType = "oidc"
): SsoUser {
  const preset = DEFAULT_PRESET_MAPPINGS[providerType] || DEFAULT_PRESET_MAPPINGS.oidc
  const mapping: ClaimsMappingConfig = {
    ...preset,
    ...customMapping,
    roleMapping: {
      ...(preset.roleMapping || {}),
      ...(customMapping?.roleMapping || {}),
    },
  }

  const id =
    getNestedValue(rawClaims, mapping.idKey) ||
    rawClaims.sub ||
    rawClaims.id ||
    rawClaims.oid ||
    rawClaims.nameID ||
    "unknown_id"

  const email =
    getNestedValue(rawClaims, mapping.emailKey) ||
    rawClaims.email ||
    rawClaims.upn ||
    rawClaims.preferred_username ||
    ""

  const name =
    getNestedValue(rawClaims, mapping.nameKey) ||
    rawClaims.name ||
    rawClaims.displayName ||
    rawClaims.given_name ||
    email.split("@")[0] ||
    "SSO User"

  const avatar = getNestedValue(rawClaims, mapping.avatarKey) || rawClaims.picture || rawClaims.avatar_url
  const tenantId = getNestedValue(rawClaims, mapping.tenantIdKey) || rawClaims.tid || rawClaims.org_id

  // Extract roles
  let rawRoles: any = mapping.roleKey ? getNestedValue(rawClaims, mapping.roleKey) : undefined
  if (!rawRoles && rawClaims.roles) rawRoles = rawClaims.roles
  if (!rawRoles && rawClaims.groups) rawRoles = rawClaims.groups

  let rolesArray: string[] = []
  if (Array.isArray(rawRoles)) {
    rolesArray = rawRoles.map(r => String(r))
  } else if (typeof rawRoles === "string") {
    rolesArray = [rawRoles]
  }

  // Determine primary role based on roleMapping or defaultRole
  let primaryRole = mapping.defaultRole || "viewer"
  const hasConfiguredMapping = mapping.roleMapping && Object.keys(mapping.roleMapping).length > 0
  if (hasConfiguredMapping && rolesArray.length > 0) {
    for (const r of rolesArray) {
      if (mapping.roleMapping![r]) {
        primaryRole = mapping.roleMapping![r]
        break
      }
    }
  } else if (rolesArray.length > 0) {
    primaryRole = rolesArray[0]
  }

  let user: SsoUser = {
    id: String(id),
    email: String(email),
    name: String(name),
    avatar: avatar ? String(avatar) : undefined,
    role: primaryRole,
    roles: rolesArray,
    tenantId: tenantId ? String(tenantId) : undefined,
    rawClaims,
  }

  if (mapping.transform) {
    const transformed = mapping.transform(rawClaims)
    user = { ...user, ...transformed }
  }

  return user
}
