import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function PreferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium tracking-tight">Preferences</h3>
        <p className="text-muted-foreground text-sm">
          Set your grading defaults, model strictness, and fallback limits.
        </p>
      </div>
      <Separator />

      <div className="max-w-md space-y-5">
        <div className="grid gap-2">
          <Label>Default Grading Strictness</Label>
          <Select defaultValue="moderate">
            <SelectTrigger>
              <SelectValue placeholder="Select strictness" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lenient">Lenient</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="strict">Strict</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Default Max Score</Label>
          <Input type="number" defaultValue="100" />
        </div>

        <div className="grid gap-2">
          <Label>Feedback Tone</Label>
          <Select defaultValue="encouraging">
            <SelectTrigger>
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="encouraging">Encouraging</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="academic">Academic / Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button>Save Preferences</Button>
      </div>
    </div>
  )
}
