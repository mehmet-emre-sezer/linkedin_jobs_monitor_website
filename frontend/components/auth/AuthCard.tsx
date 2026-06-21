import Link from "next/link"
import { ReactNode } from "react"
import { APP_NAME } from "@/constants/app"

interface Props {
  children: ReactNode
}

export default function AuthCard({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col">
      <div className="flex items-center px-8 py-6">
        <Link href="/" className="text-white font-bold text-lg tracking-tight">{APP_NAME}</Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/[0.07] rounded-2xl p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
