"use client"

import type { User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; error?: string }>
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => Promise<{ ok: boolean; error?: string; requiresConfirmation?: boolean }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function mapAuthError(message?: string): string {
  if (!message) return "Ocurrió un error inesperado"
  const m = message.toLowerCase()
  if (
    m.includes("invalid login credentials") ||
    m.includes("wrong credentials") ||
    m.includes("invalid credentials")
  ) {
    return "Correo o contraseña incorrectos"
  }
  if (
    m.includes("user already registered") ||
    m.includes("email already in use")
  ) {
    return "Este correo ya está registrado"
  }
  if (m.includes("password should be at least 6 characters")) {
    return "La contraseña debe tener al menos 6 caracteres"
  }
  if (m.includes("invalid email")) {
    return "Correo electrónico no válido"
  }
  if (m.includes("email not confirmed")) {
    return "Debes confirmar tu correo antes de iniciar sesión"
  }
  return message
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    void supabase.auth
      .getUser()
      .then(({ data }) => {
        if (!cancelled) setUser(data?.user ?? null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      return { ok: false, error: mapAuthError(error.message) }
    }
    return { ok: true }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    if (!name.trim()) return { ok: false, error: "El nombre es obligatorio" }
    if (!email.trim()) return { ok: false, error: "El correo es obligatorio" }
    if (password.length < 6)
      return {
        ok: false,
        error: "La contraseña debe tener al menos 6 caracteres",
      }
    if (password !== confirmPassword)
      return { ok: false, error: "Las contraseñas no coinciden" }

    const { error, data } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
      },
    })

    if (error) {
      return { ok: false, error: mapAuthError(error.message) }
    }

    const requiresConfirmation = !data.user?.confirmed_at && !data.session
    return { ok: true, requiresConfirmation }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
