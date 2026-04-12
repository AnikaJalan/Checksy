import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Note: Real data fetching and Client Components will be added in subsequent steps.
export default function ApiKeysPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium tracking-tight">API Keys</h3>
        <p className="text-muted-foreground text-sm">
          Manage integrations with AI providers. Checksy uses Bring-Your-Own-Key
          (BYOK) for security.
        </p>
      </div>
      <Separator />

      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">OpenAI</CardTitle>
              <CardDescription>
                Default provider for robust grading tasks.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Not configured</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                Anthropic
              </CardTitle>
              <CardDescription>
                Claude models, excellent for nuanced feedback.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-xs">Not configured</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
