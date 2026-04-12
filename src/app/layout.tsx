import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Checksy — AI Grading Assistant',
    template: '%s | Checksy'
  },
  description: 'Automated, secure, BYOK-driven mass-grading platform tailored precisely for teachers giving them their weekends back.',
  keywords: ['AI Grading', 'Teacher Assistant', 'Mass Grading', 'LLM Grading Engine'],
  authors: [{ name: 'Checksy Team' }],
  openGraph: {
    title: 'Checksy — Execute Weeks of Work within Seconds',
    description: 'Checksy combines modern pedagogical philosophy with deep local AI orchestration, giving you your weekends back securely mapping local analytics.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Checksy Platform'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Checksy',
    description: 'Grade smarter, not longer.'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="flex min-h-full flex-col">{children}</body>
      </html>
    </ClerkProvider>
  )
}
