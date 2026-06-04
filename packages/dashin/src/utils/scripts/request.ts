/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from "umi-request"
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

interface ErrorResponse extends Response {
  error: {
    description?: string
    message?: string
  }
}

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): ErrorResponse => {
  console.warn(error)
  const { response } = error
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText
    const { status, url } = response

    console.error({
      message: `request error ${status}: ${url}`,
      description: errorText
    })
    return ({ error: errorText } as unknown) as ErrorResponse
  } else if (!response) {
    const errorMsg = {
      description: "您的网络发生异常，无法连接服务器",
      message: "网络异常"
    }
    console.error(errorMsg)
    return { error: errorMsg } as ErrorResponse
  }
  return response as ErrorResponse
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

export default request
