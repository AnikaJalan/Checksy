import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export default function CustomRulesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium tracking-tight">Custom Rules</h3>
          <p className="text-muted-foreground text-sm">
            Define specific checking logic (e.g. &quot;Deduct 5 points for
            missing references&quot;).
          </p>
        </div>
        <Button>Add Rule</Button>
      </div>
      <Separator />

      <div className="space-y-4">
        <p className="text-muted-foreground rounded-md border border-dashed py-10 text-center text-sm">
          No custom rules added yet.
        </p>
      </div>
    </div>
  )
}
