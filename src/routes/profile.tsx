import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-gray-500">
        User profile page implementation coming soon.
      </p>
    </div>
  )
}
