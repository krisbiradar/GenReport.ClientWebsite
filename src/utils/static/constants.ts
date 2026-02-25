export default class Constants {
   public static readonly excludeJwtValidation = [
      "login",
      "signup",
      "forgot-password",
      "verify-otp",
      "reset-password",
   ];
   public static readonly excludeNavBar = [
      "/onboarding/login",
      "/onboarding/signup",
      "/onboarding/reset-password",
   ];
}