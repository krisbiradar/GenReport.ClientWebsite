"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormik } from "formik"
import { loginSchema } from "@/utils/validations/login-validation"
import { container } from "@/utils/di/inversify.config"
import AuthService from "@/utils/services/auth-service"
import { setJwt } from "@/utils/helpers/window-helpers"
import { setAuth } from "@/state-management/slices/auth-slice"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { toast } = useToast()
  const authService = container.get(AuthService)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { values, touched, errors, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues: { email: "", password: "" },
      validationSchema: loginSchema,
      onSubmit: async (formValues) => {
        setIsLoading(true)
        try {
          const res: any = await authService.login(formValues)
          if (res?.successResponse) {
            const data = res.successResponse.data
            setJwt("jwt-token", data.token)
            setJwt("jwt-refresh-token", data.refreshToken)
            dispatch(
              setAuth({
                role: data.role,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
              })
            )
            toast({
              title: "Welcome back!",
              description: "You have been logged in successfully.",
            })
            router.push("/")
          } else if (res?.errorResponse) {
            toast({
              variant: "destructive",
              title: "Login failed",
              description:
                res.errorResponse.message || "Invalid email or password.",
            })
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: "Something went wrong. Please try again.",
            })
          }
        } catch {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Unable to connect to the server.",
          })
        } finally {
          setIsLoading(false)
        }
      },
    })

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[1000px] animate-fadeIn">
        <Card className="flex flex-col md:flex-row overflow-hidden border-border/40 shadow-2xl">
          {/* Left branding panel */}
          <div className="md:w-1/2 relative flex flex-col items-center justify-center p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(46,90%,58%)]/10 via-[hsl(43,71%,46%)]/5 to-transparent pointer-events-none" />
            <div className="relative z-10 text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-primary">
                GENREPORT
              </h1>
              <p className="text-muted-foreground text-lg max-w-[280px] mx-auto leading-relaxed">
                Enter your credentials to access your account.
              </p>
              <div className="flex justify-center gap-2 pt-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary/70 animate-pulse delay-150" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300" />
              </div>
            </div>
          </div>

          {/* Right form panel */}
          <div className="md:w-1/2 p-8 md:p-10">
            <CardHeader className="px-0 pt-0 pb-6">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to continue to GenReport
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit}>
                <div className="grid w-full items-center gap-5">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className={`transition-all duration-200 ${errors.email && touched.email
                          ? "input-field-error ring-1 ring-red-400"
                          : "focus:ring-1 focus:ring-primary"
                        }`}
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.email && touched.email && (
                      <p className="error-text">{errors.email}</p>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pr-10 transition-all duration-200 ${errors.password && touched.password
                            ? "input-field-error ring-1 ring-red-400"
                            : "focus:ring-1 focus:ring-primary"
                          }`}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        )}
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p className="error-text">{errors.password}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-border bg-background accent-primary"
                      />
                      <span className="text-sm text-muted-foreground">
                        Remember me
                      </span>
                    </label>
                    <Link
                      href="/onboarding/reset-password"
                      className="text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  className="w-full mt-6 h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="px-0 pb-0 pt-4">
              <p className="text-sm text-muted-foreground text-center w-full">
                Don&apos;t have an account?{" "}
                <Link
                  href="/onboarding/signup"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Create account
                </Link>
              </p>
            </CardFooter>
          </div>
        </Card>
      </div>
    </div>
  )
}
