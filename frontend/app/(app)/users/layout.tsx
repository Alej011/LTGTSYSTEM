import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ACCESS_COOKIE, verifyAccessToken } from "@/lib/server/session"

export default async function UsersLayout({ children }: { children: ReactNode }) {
  const session = await verifyAccessToken((await cookies()).get(ACCESS_COOKIE)?.value)

  if (!session) redirect(`/?redirect=${encodeURIComponent("/users")}`)
  if (session.role !== "ADMIN") redirect("/dashboard")

  return <>{children}</>
}
