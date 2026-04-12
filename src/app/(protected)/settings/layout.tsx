import { SettingsNav } from '@/components/settings-nav'
import { Separator } from '@/components/ui/separator'

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-8 pb-16 md:p-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm">
          Configure your Checksy account and grading parameters.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
        <aside className="overflow-x-auto pb-2 lg:w-1/5 lg:pb-0">
          <SettingsNav />
        </aside>
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}
