'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, PlusSquare } from 'lucide-react'
import { getClientPlatform } from '@/lib/platform'

export default function IPhoneAppRail() {
  const [{ isIPhone: visible, isStandalone: standalone }] = useState(() => getClientPlatform())

  if (!visible) return null

  return (
    <div className={'iphone-app-rail' + (standalone ? ' standalone' : '')}>
      <div>
        <div className="mono mute">iPhone track</div>
        <div className="iphone-app-rail-title serif">
          {standalone ? 'Home-screen mode is ready.' : 'Turn this into a home-screen planner.'}
        </div>
        <div className="iphone-app-rail-copy">
          {standalone
            ? 'Start planning faster with the cleaner app shell and iPhone-safe spacing.'
            : 'In Safari, tap Share, then Add to Home Screen for a cleaner, app-like trip flow.'}
        </div>
      </div>
      <div className="iphone-app-rail-actions">
        <Link href="#search-section" className="btn btn-primary">
          Start planning <ArrowRight size={16} />
        </Link>
        {!standalone && (
          <span className="iphone-app-rail-hint">
            <PlusSquare size={14} />
            Safari install
          </span>
        )}
      </div>
    </div>
  )
}
