import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/server'

export default async function SignOutPage() {
  await auth.signOut()
  redirect("/")
}
