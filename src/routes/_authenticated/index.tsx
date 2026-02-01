import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-8 md:max-w-none md:p-0">
      <div className="animate-fade-in text-center md:text-left">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Demo Page
        </h1>
        <p className="text-muted-foreground mt-2 text-base md:text-lg">
          Clean and minimal starting point.
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="animate-fade-in-delay-1">
          <CardHeader>
            <CardTitle className="text-lg">Content Area</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              This area is ready for your content.
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-delay-2">
          <CardHeader>
            <CardTitle className="text-lg">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-primary h-2 w-2 rounded-full" />
                <span>Ready for development</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
