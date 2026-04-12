import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium tracking-tight">Profile</h3>
        <p className="text-muted-foreground text-sm">
          Manage your personal information and how it appears in the system.
        </p>
      </div>
      <Separator />

      <div className="max-w-md space-y-5">
        <div className="grid gap-2">
          <Label htmlFor="first-name">First Name</Label>
          <Input id="first-name" defaultValue="Teacher" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="last-name">Last Name</Label>
          <Input id="last-name" placeholder="E.g., Smith" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="school">School</Label>
          <Input id="school" placeholder="Central High School" />
        </div>
        <Button>Save Profile</Button>
      </div>
    </div>
  )
}
