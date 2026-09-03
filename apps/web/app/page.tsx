"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function Page() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
    } else if (user.role === "manager") {
      router.replace("/manager/dashboard")
    } else {
      router.replace("/reports")
    }
  }, [isLoading, user, router])

  return null
}
