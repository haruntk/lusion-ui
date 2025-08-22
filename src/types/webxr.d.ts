// WebXR TypeScript declarations
// Since WebXR is still experimental, we need to declare the types

interface XRSystem {
  isSessionSupported(mode: XRSessionMode): Promise<boolean>
  requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>
}

interface XRSession extends EventTarget {
  end(): Promise<void>
  addEventListener(type: 'end', listener: (event: XRSessionEvent) => void): void
  removeEventListener(type: 'end', listener: (event: XRSessionEvent) => void): void
}

interface XRSessionEvent extends Event {
  session: XRSession
}

type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar'

interface XRSessionInit {
  optionalFeatures?: string[]
  requiredFeatures?: string[]
}

declare global {
  interface Navigator {
    xr?: XRSystem
  }
}
