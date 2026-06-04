import UsersFilterableList from "@/components/admin/UsersFilterableList"
import { MOCK_USERS } from "@/constants/mockData"

export default function AdminUsersPage() {
  const users = MOCK_USERS

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Kullanıcılar</h1>
        <p className="text-gray-500 text-sm">Toplam {users.length} kullanıcı.</p>
      </div>

      <UsersFilterableList users={users} />
    </div>
  )
}
