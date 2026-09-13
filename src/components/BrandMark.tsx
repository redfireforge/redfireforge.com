// Canonical brand flame. Mirrored in public/logo-tile.svg, public/logo-mark.svg
// and the app's Tauri icons — keep them in sync if the mark ever changes.
const FLAME = 'M37 4.5C37 16.5 47.2 22.8 47.6 35C48 46.2 40.2 54.6 31 54.6'
  + 'C21.6 54.6 14 46.6 14 36.6C14 29 20.2 24.8 23.6 15.2'
  + 'C24.6 21.8 27.6 25.4 30.6 26.8C31.2 18.6 34 10.6 37 4.5Z';

/**
 * Cream flame glyph. The ember tile behind it comes from the CSS class, so this
 * renders the glyph only.
 */
export function BrandMark({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden>
      <svg viewBox="0 0 64 64" focusable={false}>
        <path d={FLAME} fill="#fff7ed" />
      </svg>
    </span>
  );
}
