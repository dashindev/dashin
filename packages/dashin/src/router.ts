import { useParams, useLocation, useNavigate } from "react-router-dom"

export type Router = {
  asPath: any
  query: any
  route: string
  push: (url: string, url2?: string) => void
  replace: (url: string, url2?: string) => void
}

export function useRouter(): Router {
  const navigate = useNavigate()

  const query: any = useParams()
  let route: any = useLocation()
  route = route.pathname

  const push = async (url: string, url2?: string) => {
    if (url && !url2) navigate(url)
    if (url2) navigate(url2)
  }
  const replace = async (url: string, url2?: string) => {
    if (url && !url2) navigate(url)
    if (url2) navigate(url2)
  }

  return {
    asPath: route,
    query,
    route,
    push,
    replace
  }
}
