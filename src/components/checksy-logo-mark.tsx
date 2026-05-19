type ChecksyLogoMarkProps = {
  className?: string
}

export function ChecksyLogoMark({ className }: ChecksyLogoMarkProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="6" width="108" height="108" rx="28" fill="#05070B" />

      <path
        d="M77.8 35.4C73 31.9 67 30.1 60.7 30.1C44.3 30.1 30.9 43.5 30.9 60C30.9 76.5 44.3 89.9 60.7 89.9C67.1 89.9 73.1 88.1 78 84.5"
        stroke="#F6FAFF"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path d="M49.5 67.4L79 44.7" stroke="#F6FAFF" strokeWidth="8.5" strokeLinecap="round" />
      <path d="M79 44.7L86.1 42.8L82 48.8Z" fill="#F6FAFF" />
      <circle cx="49.5" cy="67.4" r="4.1" fill="#F6FAFF" />
    </svg>
  )
}
