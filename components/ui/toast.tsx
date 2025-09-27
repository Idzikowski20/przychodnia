"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Toast = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "destructive"
}

type ToastContextValue = {
  toast: (t: Omit<Toast, "id">) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const api = useMemo<ToastContextValue>(() => ({
    toast: (t) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, ...t }])
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 5000)
    },
  }), [])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              `min-w-[260px] rounded-xl px-4 py-3 shadow-lg border text-sm bg-white ${
                t.variant === "destructive" ? "border-red-300 text-red-700" :
                t.variant === "success" ? "border-green-300 text-green-700" :
                "border-gray-200 text-gray-700"}`
            }
          >
            {t.title && <div className="font-medium">{t.title}</div>}
            {t.description && <div className="mt-0.5 text-gray-500">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}


