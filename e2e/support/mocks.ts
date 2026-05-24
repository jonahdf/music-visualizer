/**
 * Browser-side script strings injected via page.addInitScript() before the app loads.
 * Must be self-contained vanilla JS — no imports, no TypeScript.
 *
 * Why strings, not functions? page.addInitScript() serialises the function body for
 * the browser context, stripping all closure variables and module imports. Keeping them
 * as explicit strings makes that boundary obvious.
 */

/**
 * Replaces getDisplayMedia with a mock that immediately returns a fake stream
 * containing one silent audio track and one tiny video track.
 *
 * Why: Chromium flags can auto-grant getUserMedia but cannot auto-dismiss the
 * getDisplayMedia system picker. Tests that connect Tab Audio would stall waiting
 * for a dialog that never appears — so we mock at the JS level instead.
 */
export const MOCK_GET_DISPLAY_MEDIA = `
  (() => {
    navigator.mediaDevices.getDisplayMedia = async function() {
      // Create a silent audio track via AudioContext
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      const audioTrack = dest.stream.getAudioTracks()[0];

      // Create a minimal 1x1 video track (TabSource.ts stops it after checking for audio)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const videoTrack = canvas.captureStream(1).getVideoTracks()[0];

      const stream = new MediaStream([audioTrack, videoTrack]);
      stream._isMocked = true;
      return stream;
    };
  })();
`;

/**
 * Replaces getDisplayMedia with a rejection — simulates environments (Firefox,
 * or a getDisplayMedia call that returns a stream with no audio tracks selected).
 */
export const MOCK_GET_DISPLAY_MEDIA_REJECT = `
  (() => {
    navigator.mediaDevices.getDisplayMedia = async function() {
      throw new DOMException(
        'getDisplayMedia is not supported or was denied',
        'NotSupportedError'
      );
    };
  })();
`;

/**
 * Replaces getDisplayMedia with a stream that has NO audio tracks.
 * Simulates the user unchecking "Share tab audio" in the picker.
 */
export const MOCK_GET_DISPLAY_MEDIA_NO_AUDIO = `
  (() => {
    navigator.mediaDevices.getDisplayMedia = async function() {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      // Only video — no audio track
      const stream = canvas.captureStream(1);
      return stream;
    };
  })();
`;

/**
 * Spoof the userAgent to look like Firefox.
 * This triggers browserSupport.ts → isFirefox() → true, which disables
 * the Tab Audio source card in the UI.
 */
export const MOCK_FIREFOX_UA = `
  (() => {
    Object.defineProperty(navigator, 'userAgent', {
      get: () => 'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
      configurable: true,
    });
  })();
`;

/**
 * Replaces getUserMedia with a mock that returns a fake silent MediaStream.
 *
 * Why: Playwright's headless Chromium shell does not fully honour the
 * --use-fake-device-for-media-stream flag — getUserMedia() Promise never resolves
 * in headless mode. Mocking at the JS level works reliably.
 */
export const MOCK_GET_USER_MEDIA = `
  (() => {
    navigator.mediaDevices.getUserMedia = async function() {
      const ctx = new AudioContext();
      const dest = ctx.createMediaStreamDestination();
      return dest.stream;
    };
  })();
`;

/**
 * Replaces getUserMedia with a rejection simulating permission denial.
 * The Chromium flag --use-fake-ui-for-media-stream auto-grants permission,
 * so this mock is needed to test the denied path explicitly.
 */
export const MOCK_MIC_DENIED = `
  (() => {
    navigator.mediaDevices.getUserMedia = async function() {
      throw new DOMException('Permission denied', 'NotAllowedError');
    };
  })();
`;

/**
 * Replaces getUserMedia with a rejection simulating no microphone hardware.
 */
export const MOCK_MIC_NOT_FOUND = `
  (() => {
    navigator.mediaDevices.getUserMedia = async function() {
      throw new DOMException('Requested device not found', 'NotFoundError');
    };
  })();
`;
