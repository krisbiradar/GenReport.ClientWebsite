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
import { userSchema } from "@/utils/validations/user-signup-validation"
import { container } from "@/utils/di/inversify.config"
import AuthService from "@/utils/services/auth-service"
import { setJwt } from "@/utils/helpers/window-helpers"
import { setAuth } from "@/state-management/slices/auth-slice"
import { useToast } from "@/components/ui/use-toast"

export default function SignupPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { toast } = useToast()
  const authService = container.get(AuthService)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { values, touched, errors, handleBlur, handleChange, handleSubmit } =
    useFormik({
      initialValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      },
      validationSchema: userSchema,
      onSubmit: async (formValues) => {
        setIsLoading(true)
        try {
          const res: any = await authService.signup(formValues)
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
              title: "Account created!",
              description: "Welcome to GenReport.",
            })
            router.push("/")
          } else if (res?.errorResponse) {
            toast({
              variant: "destructive",
              title: "Signup failed",
              description:
                res.errorResponse.message || "Could not create account.",
            })
          } else {
            toast({
              variant: "destructive",
              title: "Signup failed",
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

  // Password strength indicator
  const getPasswordStrength = (pw: string) => {
    if (!pw) return { level: 0, label: "", color: "" }
    let score = 0
    if (pw.length >= 6) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[!@#$%^&*]/.test(pw)) score++
    if (pw.length >= 12) score++

    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-500" }
    if (score <= 2) return { level: 2, label: "Fair", color: "bg-orange-500" }
    if (score <= 3) return { level: 3, label: "Good", color: "bg-primary/70" }
    return { level: 4, label: "Strong", color: "bg-green-500" }
  }

  const strength = getPasswordStrength(values.password)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] animate-fadeIn">
        <Card className="border-border/40 shadow-2xl overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary" />

          <CardHeader className="text-center pb-2 pt-8">
            <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign up to get started with GenReport
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 px-6">
            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-4">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      className={`transition-all duration-200 ${errors.firstName && touched.firstName
                          ? "input-field-error ring-1 ring-red-400"
                          : "focus:ring-1 focus:ring-primary"
                        }`}
                      value={values.firstName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.firstName && touched.firstName && (
                      <p className="error-text">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      className={`transition-all duration-200 ${errors.lastName && touched.lastName
                          ? "input-field-error ring-1 ring-red-400"
                          : "focus:ring-1 focus:ring-primary"
                        }`}
                      value={values.lastName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.lastName && touched.lastName && (
                      <p className="error-text">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col space-y-1.5">
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

                {/* Password */}
                <div className="flex flex-col space-y-1.5">
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {values.password && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((seg) => (
                          <div
                            key={seg}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${seg <= strength.level
                                ? strength.color
                                : "bg-muted"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {strength.label}
                      </p>
                    </div>
                  )}
                  {errors.password && touched.password && (
                    <p className="error-text">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col space-y-1.5">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pr-10 transition-all duration-200 ${errors.confirmPassword && touched.confirmPassword
                          ? "input-field-error ring-1 ring-red-400"
                          : "focus:ring-1 focus:ring-primary"
                        }`}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="error-text">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-4 h-4 mt-0.5 rounded border-border bg-background accent-primary"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground leading-5"
                  >
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Terms and Conditions
                    </a>
                  </label>
                </div>

                <Button
                  className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link
                href="/onboarding/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}