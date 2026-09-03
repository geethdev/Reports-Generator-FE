"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

export function PasswordInput({
  id,
  value,
  onChange,
  autoComplete,
  minLength,
  className,
  iconClassName,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  minLength?: number
  className?: string
  iconClassName?: string
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        className={cn("pr-10", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className={cn(
          "absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground",
          iconClassName
        )}
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
