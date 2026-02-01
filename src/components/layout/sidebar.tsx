import { Home, LayoutDashboard } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [{ title: 'Main Page', href: '/', icon: Home }]

export function Sidebar() {
  const { isOpen, isCollapsed } = useSidebarStore()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300',
        'bg-sidebar border-r',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        isCollapsed ? 'w-16' : 'w-64',
        'lg:translate-x-0'
      )}
    >
      {/* Logo */}
      <div className="border-border/50 flex h-14 items-center overflow-hidden border-b px-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
            <LayoutDashboard className="text-primary-foreground h-5 w-5" />
          </div>
          {!isCollapsed && <span className="text-lg">Laboratory</span>}
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'group relative justify-start transition-all duration-200',
                  isCollapsed && 'justify-center px-2',
                  isActive && 'font-medium shadow-sm'
                )}
                asChild
              >
                <Link to={item.href}>
                  <item.icon
                    className={cn(
                      'h-4 w-4 transition-transform duration-200 group-hover:scale-110',
                      !isCollapsed && 'mr-2',
                      isActive && 'text-foreground'
                    )}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
