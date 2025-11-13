import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getRoleFromToken } from "@/lib/shared/jwt"

const LOGIN_ROUTE = "/"
const ADMIN_REDIRECT = "/dashboard"
const USERS_PATH = "/users"

export default function UsersLayout({ children }: { children: ReactNode }) {
  const token = cookies().get("ltgt_access_token")?.value

  if (!token) {
    redirect(`${LOGIN_ROUTE}?redirect=${encodeURIComponent(USERS_PATH)}`)
  }

  const role = getRoleFromToken(token)
  if (role !== "admin") {
    redirect(ADMIN_REDIRECT)
  }

  return <>{children}</>
}
