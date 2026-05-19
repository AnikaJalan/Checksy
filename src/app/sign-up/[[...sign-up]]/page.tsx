import Link from 'next/link'
import { SignUp } from '@clerk/nextjs'
import { ChecksyLogoMark } from '@/components/checksy-logo-mark'

const authAppearance = {
  variables: {
    colorPrimary: '#2f4f8f',
    colorBackground: '#ffffff',
    colorText: '#1a2f59',
    colorTextSecondary: '#6a7da4',
    colorInputBackground: '#f8fbff',
    colorInputText: '#243a63',
    colorNeutral: '#d4dfef',
    borderRadius: '14px',
  },
  elements: {
    card: 'border border-[#d4dfef] shadow-[0_20px_40px_rgba(28,55,103,0.10)] rounded-3xl !bg-white',
    headerTitle: 'text-[#14264d] font-serif text-2xl',
    headerSubtitle: 'text-[#60779f]',
    formButtonPrimary: 'bg-[#111827] hover:bg-[#1d2940] text-white rounded-xl shadow-none',
    socialButtonsBlockButton: 'border border-[#d4dfef] bg-[#f8fbff] hover:bg-[#edf4ff] text-[#233c67] rounded-xl',
    socialButtonsBlockButtonText: 'text-[#233c67] font-medium',
    formFieldInput: 'border border-[#d4dfef] bg-[#f8fbff] text-[#233c67] rounded-xl',
    footerActionLink: 'text-[#3c5f9e] hover:text-[#2d4d84]',
    identityPreviewText: 'text-[#5d739b]',
    formFieldLabel: 'text-[#5d739b]',
  },
}

export default function SignUpPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7fb] px-6 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#bad5ff]/50 blur-3xl" />
        <div className="absolute right-[-8rem] top-20 h-[24rem] w-[24rem] rounded-full bg-[#c4e6e6]/45 blur-3xl" />
        <div className="absolute bottom-[-7rem] left-1/3 h-[20rem] w-[20rem] rounded-full bg-[#d2d8ff]/45 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <Link href="/" className="mx-auto flex w-fit items-center gap-3 rounded-2xl bg-white/80 px-4 py-2.5 shadow-sm ring-1 ring-[#d4dfef]">
            <ChecksyLogoMark className="h-8 w-8" />
            <div className="flex flex-col">
              <span className="font-serif text-xl font-semibold leading-tight text-[#14264d]">Checksy</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6d84ac]">AI Grading</span>
            </div>
          </Link>

          <SignUp
            routing="path"
            path="/sign-up"
            fallbackRedirectUrl="/dashboard"
            forceRedirectUrl="/dashboard"
            appearance={authAppearance}
          />
        </div>
      </div>
    </div>
  )
}
