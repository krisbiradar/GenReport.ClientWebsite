import * as yup from "yup";

var passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,20}$/;

export const forgotPasswordSchema = yup.object().shape({
    email: yup
        .string()
        .email("Please enter a valid email")
        .required("Email is required"),
});

export const verifyOtpSchema = yup.object().shape({
    otp: yup
        .string()
        .length(6, "OTP must be exactly 6 digits")
        .matches(/^\d+$/, "OTP must only contain numbers")
        .required("OTP is required"),
});

export const newPasswordSchema = yup.object().shape({
    newPassword: yup
        .string()
        .required("Password is required")
        .min(6, "Too short!")
        .max(20, "Too long!")
        .matches(passwordRegex, { message: "Please create a stronger password" }),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref("newPassword")], "Passwords must match")
        .required("Confirm password is required"),
});
