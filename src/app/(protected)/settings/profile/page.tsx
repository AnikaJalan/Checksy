'use client'

import { useEffect, useRef, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Save,
  Loader2,
  Camera,
  User,
  GraduationCap,
  Mail,
  Building2,
  BookOpen,
  X,
  Plus,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Separator as Sep } from '@/components/ui/separator'

const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'History', 'Computer Science',
  'Economics', 'Geography', 'Physics', 'Chemistry', 'Biology',
  'Physical Education', 'Art', 'Music', 'Philosophy',
]

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  school: string
  subjectsTaught: string[]
}

function SectionCard({ icon: Icon, title, description, children }: {
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-[15px]">{title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <Separator className="bg-slate-100" />
      {children}
    </div>
  )
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    school: '',
    subjectsTaught: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [subjectInput, setSubjectInput] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        setProfile({
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          email: data.email ?? '',
          school: data.school ?? '',
          subjectsTaught: data.subjectsTaught ?? [],
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }

  function addSubject(subject: string) {
    const trimmed = subject.trim()
    if (!trimmed || profile.subjectsTaught.includes(trimmed)) return
    set('subjectsTaught', [...profile.subjectsTaught, trimmed])
    setSubjectInput('')
  }

  function removeSubject(subject: string) {
    set('subjectsTaught', profile.subjectsTaught.filter((s) => s !== subject))
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return

    // Preview
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setUploadingAvatar(true)
    try {
      await user.setProfileImage({ file })
      toast.success('Profile photo updated!')
    } catch (err: any) {
      toast.error('Failed to update photo: ' + (err.message ?? 'Unknown error'))
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      // Save to our DB
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          school: profile.school,
          subjectsTaught: profile.subjectsTaught,
        }),
      })
      if (!res.ok) throw new Error(await res.text())

      // Sync name to Clerk as well
      if (user) {
        await user.update({
          firstName: profile.firstName,
          lastName: profile.lastName,
        })
      }

      toast.success('Profile saved!')
    } catch (err: any) {
      toast.error('Failed to save: ' + (err.message ?? 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const avatarSrc = avatarPreview ?? user?.imageUrl

  const initials = [profile.firstName[0], profile.lastName[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || '?'

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center gap-3 py-12 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading profile…</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-serif font-bold text-slate-900">Profile Settings</h3>
          <p className="text-slate-500 text-sm mt-1">
            Manage your personal information and how it appears in the system.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-5 gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        {/* Avatar */}
        <SectionCard
          icon={Camera}
          title="Profile Photo"
          description="Upload a photo to personalise your account. JPG or PNG, max 5 MB."
        >
          <div className="flex items-center gap-6">
            {/* Avatar display */}
            <div className="relative flex-shrink-0">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center text-white text-2xl font-serif font-bold border-2 border-slate-200 shadow-sm">
                  {initials}
                </div>
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="rounded-full border-slate-300 gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                Upload Photo
              </Button>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setAvatarPreview(null)}
                  className="rounded-full text-slate-500 gap-1.5"
                >
                  <RotateCcw className="w-3 h-3" />
                  Revert
                </Button>
              )}
              {(avatarSrc && !avatarPreview) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={async () => {
                    if (!user) return
                    setUploadingAvatar(true)
                    try {
                      await user.setProfileImage({ file: null })
                      setAvatarPreview(null)
                      toast.success('Profile photo removed')
                    } catch (err: any) {
                      toast.error('Could not remove photo: ' + (err.message ?? 'Unknown error'))
                    } finally {
                      setUploadingAvatar(false)
                    }
                  }}
                  className="rounded-full text-rose-500 hover:text-rose-600 hover:bg-rose-50 gap-1.5"
                >
                  <X className="w-3.5 h-3.5" />
                  Delete Photo
                </Button>
              )}
              <p className="text-xs text-slate-400">
                Synced with your Clerk account across all sessions.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Personal Info */}
        <SectionCard
          icon={User}
          title="Personal Information"
          description="Your name as it appears on grading reports and exports."
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                First Name
              </Label>
              <Input
                value={profile.firstName}
                onChange={(e) => set('firstName', e.target.value)}
                placeholder="e.g. Anika"
                className="rounded-xl border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                Last Name
              </Label>
              <Input
                value={profile.lastName}
                onChange={(e) => set('lastName', e.target.value)}
                placeholder="e.g. Jalan"
                className="rounded-xl border-slate-200"
              />
            </div>
          </div>
        </SectionCard>

        {/* Email — read-only from Clerk */}
        <SectionCard
          icon={Mail}
          title="Email Address"
          description="Managed by your Clerk account. To change, update it in your account settings."
        >
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Email
            </Label>
            <Input
              value={profile.email}
              readOnly
              disabled
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-500"
            />
            <p className="text-xs text-slate-400">
              This email is linked to your sign-in and cannot be changed here.
            </p>
          </div>
        </SectionCard>

        {/* School */}
        <SectionCard
          icon={Building2}
          title="School / Institution"
          description="The school or organisation you're associated with."
        >
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              School Name
            </Label>
            <Input
              value={profile.school}
              onChange={(e) => set('school', e.target.value)}
              placeholder="e.g. Delhi Public School, Noida"
              className="rounded-xl border-slate-200"
            />
          </div>
        </SectionCard>

        {/* Subjects Taught */}
        <SectionCard
          icon={BookOpen}
          title="Subjects Taught"
          description="Used to personalise AI grading prompts and subject adapters."
        >
          <div className="space-y-4">
            {/* Quick-add chips */}
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.filter((s) => !profile.subjectsTaught.includes(s)).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSubject(s)}
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-xs text-slate-600 hover:border-zinc-900 hover:text-zinc-900 hover:bg-slate-50 transition-all"
                >
                  + {s}
                </button>
              ))}
            </div>

            {/* Custom subject input */}
            <div className="flex gap-2">
              <Input
                value={subjectInput}
                onChange={(e) => setSubjectInput(e.target.value)}
                placeholder="Add a custom subject…"
                className="rounded-xl border-slate-200 flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSubject(subjectInput)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addSubject(subjectInput)}
                disabled={!subjectInput.trim()}
                className="rounded-xl border-slate-300 gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>

            {/* Selected subjects */}
            {profile.subjectsTaught.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.subjectsTaught.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-semibold"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => removeSubject(s)}
                      className="hover:text-slate-300 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Account Info */}
        <SectionCard
          icon={GraduationCap}
          title="Account Information"
          description="Read-only account metadata from your Clerk session."
        >
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">Member Since</p>
              <p className="text-slate-700 font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">Last Sign In</p>
              <p className="text-slate-700 font-medium">
                {user?.lastSignInAt
                  ? new Date(user.lastSignInAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">Account ID</p>
              <p className="text-slate-400 text-xs font-mono truncate">{user?.id ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400 mb-1">Auth Provider</p>
              <p className="text-slate-700 font-medium capitalize">
                {user?.externalAccounts?.[0]?.provider ?? 'Email & Password'}
              </p>
            </div>
          </div>
        </SectionCard>

        {/* Bottom save */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-full px-8 gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </Button>
        </div>
      </div>
    </div>
  )
}
