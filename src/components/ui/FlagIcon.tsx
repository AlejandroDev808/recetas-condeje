import { flagUrl } from '@/lib/flagIcons'

interface FlagIconProps {
  area: string
  className?: string
}

/** Bandera del país como imagen (flagcdn.com), no emoji: ver lib/flagIcons.ts. */
export function FlagIcon({ area, className = 'h-4 w-5' }: FlagIconProps) {
  const src = flagUrl(area)
  if (!src) return null

  return (
    <img
      src={src}
      alt=""
      className={`shrink-0 rounded-[2px] object-cover ring-1 ring-espresso-500/10 ${className}`}
    />
  )
}
