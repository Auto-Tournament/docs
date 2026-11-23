import type { ReactNode } from 'react';

// A CS2 chat box for the docs: how Ready Up's chat lines look in game.
// Colors are CS2's chat colors (approximate), not the site theme.
const C = {
  red: '#ff4c4c',
  orange: '#e4ae39',
  yellow: '#ecec2c',
  green: '#40fe40',
  lightBlue: '#99ccff',
  purple: '#be6bff',
  white: '#f2f2f2',
};

const RAINBOW = [C.red, C.orange, C.yellow, C.green, C.lightBlue, C.purple];

function ReadyUpTag() {
  let n = 0;
  return (
    <span>
      {'[Ready Up]'.split('').map((ch, i) =>
        ch === ' ' ? (
          ' '
        ) : (
          <span key={i} style={{ color: RAINBOW[n++ % RAINBOW.length] }}>
            {ch}
          </span>
        )
      )}
    </span>
  );
}

// `.ready`, `.pause`: chat commands are green, the way Ready Up highlights them.
function Highlight({ text }: { text: string }) {
  const parts = text.split(/(\B\.[A-Za-z][\w]*)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\.[A-Za-z]/.test(p) ? (
          <span key={i} style={{ color: C.green }}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function text(children: ReactNode): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(text).join('');
  return '';
}

/**
 * One chat line.
 * - default: the rainbow [Ready Up] tag, then the text (commands in green).
 * - `important`: a block for lines that must not be missed: an empty line, then one line per
 *   sentence behind an orange star.
 */
export function ChatLine({ children, important }: { children?: ReactNode; important?: boolean }) {
  const t = text(children).trim();
  if (important) {
    const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
    return (
      <>
        <div style={{ height: '1.4em' }} />
        {sentences.map((s, i) => (
          <div key={i}>
            <span style={{ color: C.orange }}>★</span> <Highlight text={s} />
          </div>
        ))}
      </>
    );
  }
  return (
    <div>
      <ReadyUpTag /> <Highlight text={t} />
    </div>
  );
}

/** The chat box: put ChatLine elements inside. */
export function Chat({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: 'rgba(10, 12, 14, 0.92)',
        color: C.white,
        fontFamily: 'Stratum2, "Trebuchet MS", "Segoe UI", sans-serif',
        fontWeight: 600,
        fontSize: '0.9rem',
        lineHeight: 1.45,
        padding: '0.75rem 1rem',
        borderRadius: 4,
        margin: '1rem 0',
        textShadow: '1px 1px 0 #000',
      }}
    >
      {children}
    </div>
  );
}
