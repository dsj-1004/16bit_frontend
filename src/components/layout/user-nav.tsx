import { useNavigate } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function UserNav() {
  const navigate = useNavigate()
  const user = localStorage.getItem('user')
  const isLoggedIn = !!user

  const handleProfileClick = () => {
    console.log('UserNav clicked', user)
    // Check localStorage freshly on click to ensure latest state
    const currentUser = localStorage.getItem('user')
    if (currentUser) {
      navigate({ to: '/profile' })
    } else {
      navigate({ to: '/login' })
    }
  }

  return (
    <Button
      variant="ghost"
      className="relative h-8 w-8 rounded-full"
      onClick={handleProfileClick}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src="/avatars/01.png" alt="@user" />
        <AvatarFallback className={isLoggedIn ? 'bg-[#FF715B] text-white' : ''}>
          {isLoggedIn ? '김' : 'U'}
        </AvatarFallback>
      </Avatar>
    </Button>
  )
}
