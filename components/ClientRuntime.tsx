'use client'

import { useEffect } from 'react'
import { getClientPlatform } from '@/lib/platform'

export default function ClientRuntime() {
  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const { isIOS, isIPhone, isSafari, isStandalone } = getClientPlatform()

    root.classList.toggle('ios-device', isIOS)
    root.classList.toggle('ios-iphone', isIPhone)
    root.classList.toggle('ios-safari', isIPhone && isSafari)
    root.classList.toggle('ios-standalone', isIPhone && isStandalone)

    body.classList.toggle('ios-device', isIOS)
    body.classList.toggle('ios-iphone', isIPhone)
    body.classList.toggle('ios-safari', isIPhone && isSafari)
    body.classList.toggle('ios-standalone', isIPhone && isStandalone)

    if ('serviceWorker' in navigator && window.isSecureContext) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return null
}
