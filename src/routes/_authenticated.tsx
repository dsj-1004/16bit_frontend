import { Outlet, createFileRoute } from '@tanstack/react-router'
import { MainLayout } from '@/components/layout'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
