import React from 'react'

function base(children, props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-5 h-5"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconHome = (p) => base(<path d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1v-9M9.5 20v-6h5v6" />, p)

export const IconReceipt = (p) =>
  base(
    <>
      <path d="M6 3h12v18l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.5V3Z" />
      <path d="M9 8h6M9 12h6M9 16h3.5" />
    </>,
    p,
  )

export const IconWallet = (p) =>
  base(
    <>
      <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h13A1.5 1.5 0 0 1 19 7.5V9h-4.5a2.5 2.5 0 0 0 0 5H19v3.5A1.5 1.5 0 0 1 17.5 19h-13A1.5 1.5 0 0 1 3 17.5v-10Z" />
      <path d="M19 9v5h-4.5a2.5 2.5 0 0 1 0-5H19Z" />
    </>,
    p,
  )

export const IconUsers = (p) =>
  base(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3.31 2.69-5.5 5.5-5.5s5.5 2.19 5.5 5.5" />
      <path d="M16 8.2a2.7 2.7 0 1 1 0 5.4" />
      <path d="M15 14.6c2.3.3 4 2.2 4 5.4" />
    </>,
    p,
  )

export const IconClipboard = (p) =>
  base(
    <>
      <rect x="5.5" y="4.5" width="13" height="17" rx="1.6" />
      <path d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5" />
    </>,
    p,
  )

export const IconBook = (p) =>
  base(
    <>
      <path d="M4 5.2C4 4 5 3.4 6.3 3.4c2 0 4.2.9 5.7 2.1v14.9c-1.5-1.2-3.7-2.1-5.7-2.1C5 18.3 4 18.9 4 20.1" />
      <path d="M20 5.2c0-1.2-1-1.8-2.3-1.8-2 0-4.2.9-5.7 2.1v14.9c1.5-1.2 3.7-2.1 5.7-2.1 1.3 0 2.3.6 2.3 1.8" />
    </>,
    p,
  )

export const IconUserCircle = (p) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="10" r="3" />
      <path d="M6.3 18.5C7 16.2 9.2 15 12 15s5 1.2 5.7 3.5" />
    </>,
    p,
  )

export const IconMenu = (p) => base(<path d="M4 6.5h16M4 12h16M4 17.5h16" />, p)

export const IconChevronLeft = (p) => base(<path d="M14.5 5 8 12l6.5 7" />, p)
export const IconChevronRight = (p) => base(<path d="M9.5 5 16 12l-6.5 7" />, p)
export const IconChevronDown = (p) => base(<path d="M5 8.5 12 15l7-6.5" />, p)

export const IconPlus = (p) => base(<path d="M12 5v14M5 12h14" />, p)

export const IconPencil = (p) =>
  base(
    <>
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4.5 1.5L5 15Z" />
      <path d="M14.5 5.5 18 9" />
    </>,
    p,
  )

export const IconTrash = (p) =>
  base(
    <>
      <path d="M4.5 7h15" />
      <path d="M9 7V4.8c0-.6.5-1.1 1.1-1.1h3.8c.6 0 1.1.5 1.1 1.1V7" />
      <path d="M6.5 7 7.3 19a1.8 1.8 0 0 0 1.8 1.7h5.8a1.8 1.8 0 0 0 1.8-1.7L17.5 7" />
      <path d="M10.3 11v6M13.7 11v6" />
    </>,
    p,
  )

export const IconPaperclip = (p) =>
  base(
    <path d="M8 12.5 15 5.5a3 3 0 0 1 4.2 4.2l-8.5 8.5a5 5 0 0 1-7-7l7.8-7.8" />,
    p,
  )

export const IconSearch = (p) =>
  base(
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m19.5 19.5-4.3-4.3" />
    </>,
    p,
  )

export const IconLock = (p) =>
  base(
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="1.6" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </>,
    p,
  )

export const IconCheckCircle = (p) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.2 12.3 2.6 2.6 5-5.4" />
    </>,
    p,
  )

export const IconFileText = (p) =>
  base(
    <>
      <path d="M7 3.5h7l4 4V19a1.6 1.6 0 0 1-1.6 1.6H7A1.6 1.6 0 0 1 5.4 19V5.1A1.6 1.6 0 0 1 7 3.5Z" />
      <path d="M14 3.5V8h4.4" />
      <path d="M8.3 12.2h7.4M8.3 15.5h7.4M8.3 18.2h4.5" />
    </>,
    p,
  )

export const IconArrowUpRight = (p) => base(<path d="M7 17 17 7M9 7h8v8" />, p)
export const IconArrowDownRight = (p) => base(<path d="M7 7 17 17M17 9V17H9" />, p)

export const IconX = (p) => base(<path d="M6 6l12 12M18 6 6 18" />, p)

export const IconBuilding = (p) =>
  base(
    <>
      <rect x="5" y="3.5" width="10" height="17" rx="1" />
      <path d="M15 9.5h4v11h-4" />
      <path d="M8 7.5h1M11.5 7.5h1M8 11h1M11.5 11h1M8 14.5h1M11.5 14.5h1" />
    </>,
    p,
  )

export const IconTag = (p) =>
  base(
    <>
      <path d="M12.6 3.8h4.9a1.7 1.7 0 0 1 1.7 1.7v4.9a1.7 1.7 0 0 1-.5 1.2l-8.4 8.4a1.7 1.7 0 0 1-2.4 0l-4.9-4.9a1.7 1.7 0 0 1 0-2.4l8.4-8.4c.3-.3.7-.5 1.2-.5Z" />
      <circle cx="16" cy="8" r="1.3" />
    </>,
    p,
  )

export const IconCart = (p) =>
  base(
    <>
      <path d="M3.5 4.5h2.2l1 2M6.7 6.5l1.6 8.2a1.6 1.6 0 0 0 1.6 1.3h6.7a1.6 1.6 0 0 0 1.6-1.3l1.3-6.2H6.7Z" />
      <circle cx="10" cy="19.3" r="1.2" />
      <circle cx="16.5" cy="19.3" r="1.2" />
    </>,
    p,
  )

export const IconDroplet = (p) =>
  base(<path d="M12 3.5s6 6.6 6 10.8a6 6 0 1 1-12 0c0-4.2 6-10.8 6-10.8Z" />, p)

export const IconBolt = (p) => base(<path d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13Z" />, p)

export const IconWifi = (p) =>
  base(
    <>
      <path d="M4 8.8a12 12 0 0 1 16 0" />
      <path d="M7 12.2a7.5 7.5 0 0 1 10 0" />
      <path d="M10 15.6a3 3 0 0 1 4 0" />
      <circle cx="12" cy="18.6" r="0.9" fill="currentColor" stroke="none" />
    </>,
    p,
  )

export const IconFlame = (p) =>
  base(
    <path d="M12 3.5s-5.5 4.8-5.5 9.4a5.5 5.5 0 0 0 11 0c0-2-1.2-3.4-2.1-4.5.2 1.6-.5 2.5-1.2 3-0.1-2.4-1.1-4.5-2.2-7.9Z" />,
    p,
  )

export const IconWrench = (p) =>
  base(
    <path d="M14.7 6.3a4 4 0 0 0-5.4 4.6L4 16.2l2.8 2.8 5.3-5.3a4 4 0 0 0 4.6-5.4l-2.5 2.5-2.1-2.1Z" />,
    p,
  )

export const IconBucket = (p) =>
  base(
    <>
      <path d="M5.5 8h13l-1.6 10.3a1.8 1.8 0 0 1-1.8 1.5H8.9a1.8 1.8 0 0 1-1.8-1.5L5.5 8Z" />
      <path d="M4 8h16" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>,
    p,
  )

export const IconDrop2 = (p) =>
  base(
    <>
      <rect x="6" y="4" width="12" height="15" rx="2" />
      <path d="M9 8h6M9 11.5h6M9 15h3.5" />
    </>,
    p,
  )

export const IconSparkle = (p) =>
  base(
    <path d="M12 3.5 13.4 9l5.5 1.4-5.5 1.4L12 17.3 10.6 11.8 5.1 10.4l5.5-1.4Z" />,
    p,
  )

export const IconHash = (p) =>
  base(<path d="M9.5 3.5 7 20.5M17 3.5l-2.5 17M4 9h16M3 15h16" />, p)

export const IconTable = (p) =>
  base(
    <>
      <rect x="4" y="5" width="16" height="14" rx="1.3" />
      <path d="M4 10h16M4 14.5h16M10 5v14" />
    </>,
    p,
  )
