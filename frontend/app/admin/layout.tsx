import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminGuard from "@/components/admin/AdminGuard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0f1117] flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </AdminGuard>
  )
}
