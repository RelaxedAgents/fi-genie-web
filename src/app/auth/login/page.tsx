import { AuthLayout } from "@/components/auth/AuthLayout"
import { MobileLoginForm } from "@/components/auth/MobileLoginForm"

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Enter your mobile number to continue"
    >
      <MobileLoginForm />
    </AuthLayout>
  )
}
