import * as React from "react"

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "rounded-lg border bg-white p-4 shadow-sm " +
        (className || "")
      }
      {...props}
    />
  )
}
