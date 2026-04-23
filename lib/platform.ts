export interface PlatformFlags {
  isIOS: boolean
  isIPhone: boolean
  isSafari: boolean
  isStandalone: boolean
}

export function getClientPlatform(): PlatformFlags {
  if (typeof window === 'undefined') {
    return {
      isIOS: false,
      isIPhone: false,
      isSafari: false,
      isStandalone: false,
    }
  }

  const nav = window.navigator
  const ua = nav.userAgent
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1)
  const isIPhone = /iPhone/.test(ua)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((nav as Navigator & { standalone?: boolean }).standalone)

  return {
    isIOS: isIOSDevice,
    isIPhone,
    isSafari,
    isStandalone,
  }
}
