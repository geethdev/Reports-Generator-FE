"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { useAuth } from "@/lib/auth-context"

const NAV_ITEMS = [
  { href: "/manager/dashboard", label: "Dashboard" },
  { href: "/manager/team", label: "Team" },
  { href: "/manager/projects", label: "Projects" },
]

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, logout } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
    } else if (user.role !== "manager") {
      router.replace("/reports")
    }
  }, [isLoading, user, router])

  if (isLoading || !user || user.role !== "manager") {
    return null
  }

  return (
    <div className="min-h-svh">
      <header className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="font-semibold">Weekly Reports</span>
          <nav className="flex flex-wrap gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={
                  pathname.startsWith(item.href)
                    ? "text-sm font-medium text-foreground"
                    : "text-sm font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <span className="truncate text-sm text-muted-foreground">{user.name}</span>
          <Button variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
