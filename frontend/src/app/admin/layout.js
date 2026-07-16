import AdminShell from '@/components/admin/AdminShell';

export const metadata = { title: 'Admin — LUMIÈRE' };

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
