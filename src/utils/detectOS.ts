export type OSTarget =
  | 'macos-arm'
  | 'macos-x64'
  | 'windows-x64'
  | 'linux-appimage'
  | 'linux-deb';

export interface PlatformOption {
  id: OSTarget;
  label: string;
  format: string;
  pattern: RegExp;
}

export const PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'macos-arm', label: 'macOS Apple Silicon', format: 'dmg', pattern: /_aarch64\.dmg$/ },
  { id: 'macos-x64', label: 'macOS Intel', format: 'dmg', pattern: /_x64\.dmg$/ },
  { id: 'windows-x64', label: 'Windows x64', format: 'exe', pattern: /_x64-setup\.exe$/ },
  { id: 'linux-appimage', label: 'Linux AppImage', format: 'AppImage', pattern: /\.AppImage$/ },
  { id: 'linux-deb', label: 'Linux .deb', format: 'deb', pattern: /\.deb$/ },
];

/** Same targets but matching Learning Hub asset names (e.g. RedfireForge-LearningHub-0.8.2-macos-aarch64.dmg).
 *  Tauri on ubuntu-22.04 produces both AppImage and .deb, so LH has the same 5 targets as Standard. */
export const LH_PLATFORM_OPTIONS: PlatformOption[] = [
  { id: 'macos-arm',      label: 'macOS Apple Silicon', format: 'dmg',      pattern: /LearningHub.*aarch64\.dmg$/i },
  { id: 'macos-x64',      label: 'macOS Intel',         format: 'dmg',      pattern: /LearningHub.*(x64|x86_64)\.dmg$/i },
  { id: 'windows-x64',    label: 'Windows x64',         format: 'exe',      pattern: /LearningHub.*\.exe$/i },
  { id: 'linux-appimage', label: 'Linux AppImage',      format: 'AppImage', pattern: /LearningHub.*\.AppImage$/i },
  { id: 'linux-deb',      label: 'Linux .deb',          format: 'deb',      pattern: /LearningHub.*\.deb$/i },
];

/** Detect OS target — treat as a hint only (Rosetta can spoof Intel UA). */
export function detectOSTarget(): OSTarget {
  if (typeof navigator === 'undefined') return 'macos-arm';
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'windows-x64';
  if (ua.includes('Linux')) return 'linux-appimage';
  if (ua.includes('Mac OS X') || ua.includes('Macintosh')) {
    return ua.includes('Intel Mac') ? 'macos-x64' : 'macos-arm';
  }
  return 'macos-arm';
}

export function platformLabel(target: OSTarget): string {
  return PLATFORM_OPTIONS.find((p) => p.id === target)?.label ?? 'your platform';
}
