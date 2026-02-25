"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

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
import {
  forgotPasswordSchema,
  verifyOtpSchema,
  newPasswordSchema,
} from "@/utils/validations/reset-password-validation"
import { container } from "@/utils/di/inversify.config"
import AuthService from "@/utils/services/auth-service"
import { useToast } from "@/components/ui/use-toast"

const STEPS = [
  { label: "Email", icon: "✉" },
  { label: "Verify", icon: "🔑" },
  { label: "Reset", icon: "🔒" },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const authService = container.get(AuthService)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Step 1: Email
  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (formValues) => {
      setIsLoading(true)
      try {
        const res: any = await authService.forgotPassword({
          email: formValues.email,
        })
        if (res?.errorResponse) {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              res.errorResponse.message || "Failed to send reset code.",
          })
        } else {
          setEmail(formValues.email)
          toast({
            title: "Code sent!",
            description: "Check your email for the 6-digit OTP code.",
          })
          setCurrentStep(1)
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

  // Step 2: OTP
  const otpForm = useFormik({
    initialValues: { otp: "" },
    validationSchema: verifyOtpSchema,
    onSubmit: async (formValues) => {
      setIsLoading(true)
      try {
        const res: any = await authService.verifyOtp({
          email,
          otp: formValues.otp,
        })
        if (res?.errorResponse) {
          toast({
            variant: "destructive",
            title: "Invalid code",
            description:
              res.errorResponse.message || "The OTP code is incorrect.",
          })
        } else {
          setOtp(formValues.otp)
          toast({
            title: "Verified!",
            description: "You can now set a new password.",
          })
          setCurrentStep(2)
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

  // Step 3: New Password
  const passwordForm = useFormik({
    initialValues: { newPassword: "", confirmPassword: "" },
    validationSchema: newPasswordSchema,
    onSubmit: async (formValues) => {
      setIsLoading(true)
      try {
        const res: any = await authService.resetPassword({
          email,
          otp,
          newPassword: formValues.newPassword,
          confirmPassword: formValues.confirmPassword,
        })
        if (res?.errorResponse) {
          toast({
            variant: "destructive",
            title: "Reset failed",
            description:
              res.errorResponse.message || "Could not reset password.",
          })
        } else {
          toast({
            title: "Password reset!",
            description:
              "Your password has been changed. Redirecting to login...",
          })
          setTimeout(() => router.push("/onboarding/login"), 1500)
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

  // OTP digit inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])

  useEffect(() => {
    if (currentStep === 1) {
      otpInputRefs.current[0]?.focus()
    }
  }, [currentStep])

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value.slice(-1)
    setOtpDigits(newDigits)

    const combined = newDigits.join("")
    otpForm.setFieldValue("otp", combined)

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
    const newDigits = [...otpDigits]
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || ""
    }
    setOtpDigits(newDigits)
    otpForm.setFieldValue("otp", newDigits.join(""))
    const focusIdx = Math.min(pasted.length, 5)
    otpInputRefs.current[focusIdx]?.focus()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] animate-fadeIn">
        <Card className="border-border/40 shadow-2xl overflow-hidden">
          {/* Gradient accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary" />

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0 pt-8 px-12">
            {STEPS.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${idx < currentStep
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                        : idx === currentStep
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {idx < currentStep ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${idx <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-500 ${idx < currentStep ? "bg-green-500" : "bg-muted"
                      }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step 1: Email */}
          {currentStep === 0 && (
            <div className="animate-slideUp">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">
                  Reset Password
                </CardTitle>
                <CardDescription>
                  Enter your email address and we&apos;ll send you a verification
                  code
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={emailForm.handleSubmit}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={`transition-all duration-200 ${emailForm.errors.email && emailForm.touched.email
                            ? "input-field-error ring-1 ring-red-400"
                            : "focus:ring-1 focus:ring-primary"
                          }`}
                        value={emailForm.values.email}
                        onChange={emailForm.handleChange}
                        onBlur={emailForm.handleBlur}
                      />
                      {emailForm.errors.email && emailForm.touched.email && (
                        <p className="error-text">{emailForm.errors.email}</p>
                      )}
                    </div>
                    <Button
                      className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Sending code...
                        </span>
                      ) : (
                        "Send Verification Code"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </div>
          )}

          {/* Step 2: OTP */}
          {currentStep === 1 && (
            <div className="animate-slideUp">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">
                  Enter Verification Code
                </CardTitle>
                <CardDescription>
                  We sent a 6-digit code to{" "}
                  <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={otpForm.handleSubmit}>
                  <div className="grid w-full items-center gap-5">
                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpDigitChange(idx, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="otp-input"
                        />
                      ))}
                    </div>
                    {otpForm.errors.otp && otpForm.touched.otp && (
                      <p className="error-text text-center">
                        {otpForm.errors.otp}
                      </p>
                    )}
                    <Button
                      className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Verifying...
                        </span>
                      ) : (
                        "Verify Code"
                      )}
                    </Button>
                    <button
                      type="button"
                      className="text-sm text-primary hover:text-primary/80 transition-colors mx-auto"
                      onClick={() => {
                        setOtpDigits(["", "", "", "", "", ""])
                        otpForm.resetForm()
                        setCurrentStep(0)
                      }}
                    >
                      ← Change email
                    </button>
                  </div>
                </form>
              </CardContent>
            </div>
          )}

          {/* Step 3: New Password */}
          {currentStep === 2 && (
            <div className="animate-slideUp">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">
                  Set New Password
                </CardTitle>
                <CardDescription>
                  Create a strong password for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-medium"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`pr-10 transition-all duration-200 ${passwordForm.errors.newPassword &&
                              passwordForm.touched.newPassword
                              ? "input-field-error ring-1 ring-red-400"
                              : "focus:ring-1 focus:ring-primary"
                            }`}
                          value={passwordForm.values.newPassword}
                          onChange={passwordForm.handleChange}
                          onBlur={passwordForm.handleBlur}
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
                      {passwordForm.errors.newPassword &&
                        passwordForm.touched.newPassword && (
                          <p className="error-text">
                            {passwordForm.errors.newPassword}
                          </p>
                        )}
                    </div>

                    <div className="flex flex-col space-y-2">
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
                          className={`pr-10 transition-all duration-200 ${passwordForm.errors.confirmPassword &&
                              passwordForm.touched.confirmPassword
                              ? "input-field-error ring-1 ring-red-400"
                              : "focus:ring-1 focus:ring-primary"
                            }`}
                          value={passwordForm.values.confirmPassword}
                          onChange={passwordForm.handleChange}
                          onBlur={passwordForm.handleBlur}
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
                      {passwordForm.errors.confirmPassword &&
                        passwordForm.touched.confirmPassword && (
                          <p className="error-text">
                            {passwordForm.errors.confirmPassword}
                          </p>
                        )}
                    </div>

                    <Button
                      className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                          Resetting...
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </div>
          )}

          <CardFooter className="flex flex-col space-y-4 pb-8">
            <div className="text-sm text-center">
              <Link
                href="/onboarding/login"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ← Back to Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}