import React from 'react'

interface PlatformIconProps {
  platform: string
  size?: number
  className?: string
}

export default function PlatformIcon({ platform, size = 24, className = '' }: PlatformIconProps) {
  const s = size
  const common = { width: s, height: s, viewBox: '0 0 24 24', className, fill: 'none' as const }

  switch (platform.toLowerCase()) {
    case 'instagram':
      return (
        <svg {...common}>
          <defs>
            <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#feda75" />
              <stop offset="25%" stopColor="#fa7e1e" />
              <stop offset="50%" stopColor="#d62976" />
              <stop offset="75%" stopColor="#962fbf" />
              <stop offset="100%" stopColor="#4f5bd5" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="url(#ig-grad)" strokeWidth="2" />
          <circle cx="12" cy="12" r="4.5" stroke="url(#ig-grad)" strokeWidth="2" />
          <circle cx="17.5" cy="6.5" r="1.25" fill="url(#ig-grad)" />
        </svg>
      )

    case 'facebook':
      return (
        <svg {...common}>
          <path
            d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z"
            stroke="#1877F2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case 'tiktok':
      return (
        <svg {...common}>
          <path
            d="M9 12a4 4 0 104 4V4a5 5 0 005 5"
            stroke="#00f2ea"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case 'youtube':
      return (
        <svg {...common}>
          <path
            d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 001.94-2A29 29 0 0023 12a29 29 0 00-.46-5.58z"
            stroke="#FF0000"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9.75 15.02l5.25-3.02-5.25-3.02v6.04z" fill="#FF0000" />
        </svg>
      )

    case 'linkedin':
      return (
        <svg {...common}>
          <path
            d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"
            stroke="#0A66C2"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="2" y="9" width="4" height="12" stroke="#0A66C2" strokeWidth="2" />
          <circle cx="4" cy="4" r="2" stroke="#0A66C2" strokeWidth="2" />
        </svg>
      )

    case 'twitter':
    case 'x':
      return (
        <svg {...common}>
          <path
            d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.4L20 4h-2l-5.2 6.4L8 4H4z"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )

    case 'pinterest':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="#E60023" strokeWidth="2" />
          <path
            d="M12 7c-2.5 0-4.5 2-4.5 4.5 0 1.8 1 3.3 2.5 4l.5-2s-.5-.2-.5-1c0-1.5 1-2.5 2-2.5s1.5.7 1.5 1.5c0 1-.5 2.5-1 3.5-.3 1 .5 1.5 1.2 1.5 1.5 0 2.8-2 2.8-4 0-2-1.5-3.5-3.5-3.5z"
            stroke="#E60023"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )

    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <path
            d="M12 8v4l2 2"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
  }
}
