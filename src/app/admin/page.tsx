import { Metadata } from 'next'
import AdminOverview from '@/components/admin-overview'

export const metadata: Metadata = {
  title: 'Admin Panel | Choutuppal',
  description: 'Manage the application',
}

export default function AdminPage() {
  return <AdminOverview />
}
