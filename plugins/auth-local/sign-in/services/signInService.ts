import { LOCAL_PASSWORD, LOCAL_USERNAME } from '../../index';
export interface SignInParamsType {
  username: string
  password: string
}

async function userSignInService(params: SignInParamsType) {
  const { username, password } = params
  if (username != LOCAL_USERNAME || password != LOCAL_PASSWORD)
    return { errors: "Username or password not match" }

  return {
    id: username,
    user: {
      username: username,
      role: "admin"
    }
  }
}

export default userSignInService
