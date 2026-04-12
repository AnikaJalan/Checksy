import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium tracking-tight">
            Grading Templates
          </h3>
          <p className="text-muted-foreground text-sm">
            Manage assignment templates with predefined custom rules to speed up
            grading.
          </p>
        </div>
        <Button>Create Template</Button>
      </div>
      <Separator />

      <div className="space-y-4">
        <p className="text-muted-foreground rounded-md border border-dashed py-10 text-center text-sm">
          No templates created yet.
        </p>
      </div>
    </div>
  )
}
