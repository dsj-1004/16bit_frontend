import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebarStore } from '@/stores'
import { UserNav } from './user-nav'

export function Header() {
  const { toggle } = useSidebarStore()

  return (
    <header className="bg-background sticky top-0 z-50 flex h-14 items-center gap-4 border-b px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggle}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle navigation</span>
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <UserNav />
      </div>
    </header>
  )
}
