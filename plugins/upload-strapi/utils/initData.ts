import { IPluginData } from "@dashin-dev/dashin"

export default {
  plugin: "strapi-upload",
  data: [
    {
      id: "bunadmin_upload_strapi_files",
      group: "upload-strapi",
      name: "files",
      label: "Files",
      team: "bunadmin",
      customized: true,
      icon_type: "eva",
      icon: "cloud-upload-outline",
      rank: "100",
      role: process.env.VITE_UPLOAD_STRAPI_ROLE
    }
  ] as IPluginData[]
}
