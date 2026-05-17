export function isFirefox(): boolean {
  return navigator.userAgent.toLowerCase().includes('firefox');
}

export function supportsTabAudioCapture(): boolean {
  // getDisplayMedia with audio is only reliably supported in Chromium-based browsers.
  // Firefox's getDisplayMedia doesn't expose per-tab audio.
  return !isFirefox();
}
