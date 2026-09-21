/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend, RequestOptionsInit } from "umi-request"
import { ENV } from "../config"

let codeMessage: { [key: number]: string } = {
  200: "The server returned the requested data successfully.",
  201: "Create or modify data successfully.",
  202: "A request has entered the background queue (asynchronous task).",
  204: "Delete data successfully.",
  400: "There is an error in the request, and the server did not create or modify any data.",
  401: "The user does not have permission (the token, user name, password is wrong).",
  403: "The user is authorized, but access is forbidden.",
  404: "The request is for a record that does not exist, and the server is not operating.",
  406: "The requested format is not available.",
  410: "The requested resource is permanently deleted and will no longer be available.",
  422: "Validation error occurred when creating an object.",
  500: "An error occurred in the server, please check the server.",
  502: "Gateway error.",
  503: "The service is unavailable. The server is temporarily overloaded or maintained.",
  504: "Gateway timed out."
}
if (ENV.I18N_CODE === "zh")
  codeMessage = {
    200: "服务器成功返回请求的数据。",
    201: "新建或修改数据成功。",
    202: "一个请求已经进入后台排队（异步任务）。",
    204: "删除数据成功。",
    400: "发出的请求有错误，服务器没有进行新建或修改数据的操作。",
    401: "用户没有权限（令牌、用户名、密码错误）。",
    403: "用户得到授权，但是访问是被禁止的。",
    404: "发出的请求针对的是不存在的记录，服务器没有进行操作。",
    406: "请求的格式不可得。",
    410: "请求的资源被永久删除，且不会再得到的。",
    422: "当创建一个对象时，发生一个验证错误。",
    500: "服务器发生错误，请检查服务器。",
    502: "网关错误。",
    503: "服务不可用，服务器暂时过载或维护。",
    504: "网关超时。"
  }

export interface ErrorResponse {
  error: {
    description?: string
    message?: string
  } | string
  status?: number
  data?: any
  response?: Response
}

export interface RequestErrorDetails {
  status?: number
  url?: string
  data?: any
  response?: Response
  message: string
  description?: string
  code?: number | string
}

export class RequestError extends Error implements RequestErrorDetails {
  readonly isDashinRequestError = true
  status?: number
  url?: string
  data?: any
  response?: Response
  description?: string
  code?: number | string

  constructor(details: RequestErrorDetails) {
    super(details.message)
    this.name = "RequestError"
    this.status = details.status
    this.url = details.url
    this.data = details.data
    this.response = details.response
    this.description = details.description
    this.code = details.code || details.status
    Object.setPrototypeOf(this, RequestError.prototype)
  }
}

export interface RequestOptionsInitWithLegacy extends RequestOptionsInit {
  legacyResolveError?: boolean
  /**
   * Opt-in business error validator for APIs that return HTTP 200 with business errors
   * (e.g. GraphQL, D1 Worker, Payload mutations).
   * Can be `true` (standard check: errors non-empty array, success: false, ok: false)
   * or a custom discriminator function: `(data: any) => string | boolean | undefined | null`.
   * A non-empty string is the failure reason, `true` means a failure was detected,
   * and `false` / `undefined` / `null` mean no business error.
   * Defaults to `false` so normal document payloads (GET / data queries) are never misjudged.
   */
  checkBusinessErrors?: boolean | ((data: any) => string | boolean | undefined | null)
}

/**
 * 异常处理程序
 */
export const errorHandler = (error: any): ErrorResponse => {
  console.warn(error)
  if (error?.isDashinRequestError) {
    if (error?.request?.options?.legacyResolveError) {
      return ({ error: error.message, status: error.status, data: error.data, response: error.response } as unknown) as ErrorResponse
    }
    throw error
  }

  const { response } = error || {}
  let normalizedError: RequestError

  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText || "Request failed"
    const { status, url } = response

    console.error({
      message: `request error ${status}: ${url}`,
      description: errorText
    })

    const payloadMsg =
      error.data?.errors?.[0]?.data?.errors?.[0]?.message ||
      error.data?.errors?.[0]?.message ||
      error.data?.message ||
      (typeof error.data === "string" ? error.data : "")

    if (error?.request?.options?.legacyResolveError) {
      return ({ error: errorText, status, data: error.data, response } as unknown) as ErrorResponse
    }

    normalizedError = new RequestError({
      message: payloadMsg || errorText,
      description: errorText,
      status,
      url,
      data: error.data,
      response
    })
  } else {
    const isTimeout =
      error?.type === "Timeout" ||
      error?.name === "TimeoutError" ||
      /timeout/i.test(error?.message || "")
    const url =
      error?.request?.url ||
      error?.config?.url ||
      error?.url ||
      error?.request?.options?.url ||
      ""
    const errorMsg = {
      description: isTimeout
        ? (ENV.I18N_CODE === "zh" ? "请求超时，请检查网络后重试" : "Request timed out, please check your network and try again.")
        : (ENV.I18N_CODE === "zh" ? "您的网络发生异常，无法连接服务器" : "Network error, cannot connect to server."),
      message: isTimeout
        ? (ENV.I18N_CODE === "zh" ? `请求超时${url ? `: ${url}` : ""}` : `Request Timeout${url ? `: ${url}` : ""}`)
        : (ENV.I18N_CODE === "zh" ? "网络异常" : "Network Error")
    }
    console.error(errorMsg)

    if (error?.request?.options?.legacyResolveError) {
      return { error: errorMsg, status: isTimeout ? 504 : undefined, url } as ErrorResponse
    }

    normalizedError = new RequestError({
      message: isTimeout ? errorMsg.message : (error?.message || errorMsg.message),
      description: errorMsg.description,
      status: isTimeout ? 504 : undefined,
      url,
      data: error?.data,
      response: undefined
    })
  }

  throw normalizedError
}

/**
 * 配置request请求时的默认参数
 */
const request = extend({
  errorHandler, // 默认错误处理
  credentials: "same-origin", // 默认请求是否带上cookie
  prefix: ENV.MAIN_URL,
  timeout: 6000, // ms
  redirect: "follow",
  headers: {
    "Content-Type": "application/json"
  }
})

// Middleware to detect HTTP 200 with business errors (e.g. GraphQL or Payload errors in 200 OK)
request.use(async (ctx, next) => {
  await next()
  const res = ctx.res
  let data = res
  let response = (ctx as any).response

  // Support getResponse: true -> ctx.res is { data, response }
  if (res && typeof res === "object" && "data" in res && "response" in res) {
    data = res.data
    response = res.response
  }

  const options = (ctx.req?.options as RequestOptionsInitWithLegacy) || {}
  const checkOption = options.checkBusinessErrors

  // Only check business errors when explicitly opted in (checkBusinessErrors: true or custom fn)
  if (checkOption && data && typeof data === "object") {
    let isError = false
    let message = ""

    if (typeof checkOption === "function") {
      const checkRes = checkOption(data)
      if (typeof checkRes === "string" && checkRes) {
        isError = true
        message = checkRes
      } else if (checkRes === true) {
        isError = true
        message = data.message || data.error || "Business operation failed"
      }
    } else if (checkOption === true) {
      const hasErrors = Array.isArray(data.errors) && data.errors.length > 0
      const hasExplicitFailure = data.success === false || data.ok === false

      if (hasErrors || hasExplicitFailure) {
        isError = true
        const firstError = hasErrors ? data.errors[0] : undefined
        message =
          firstError?.data?.errors?.[0]?.message ||
          firstError?.message ||
          data.message ||
          (hasExplicitFailure ? (data.error || "Operation failed") : "Business operation failed")
      }
    }

    if (isError) {
      const businessError = new RequestError({
        message,
        description: message,
        status: response?.status || 200,
        url: response?.url || ctx.req?.url,
        data,
        response
      })

      if (options.legacyResolveError) {
        if (res && typeof res === "object" && "data" in res) {
          res.data = { error: message, data }
        } else {
          ctx.res = { error: message, data }
        }
        return
      }

      throw businessError
    }
  }
})

export default request
