import { AuthLayout } from "@/components/auth/AuthLayout"
import { OTPForm } from "@/components/auth/OTPForm"

export default function OTPPage() {
  return (
    <AuthLayout
      title="Verify Your Number"
      subtitle="Enter the 6-digit code we sent to your phone"
    >
      <OTPForm />
    </AuthLayout>
  )
}
