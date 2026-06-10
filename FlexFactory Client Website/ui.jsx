// ui.jsx — shared FlexFactory admin UI primitives
const { useState, useEffect, useRef, createContext, useContext, useCallback } = React;

/* ============================ Brand mark ============================ */
// Chamfered "FF" monogram echoing the brand graphic elements.
function FFMark({ size = 34, accent = false }) {
  const fill = accent ? '#FFFFFF' : 'var(--ff-blue)';
  const w = Math.round(size * 49 / 40);
  return (
    <svg width={w} height={size} viewBox="0 0 49 40" style={{ display: 'block' }} aria-hidden="true">
      <path d="M48.1774 0L42.6845 4.305L42.6439 4.32328L35.2543 39.9999H14.4441L9.68626 32.1535V32.1453H28.5349L30.2102 24.1385H4.84312L9.68626 32.1453H9.67814L9.68626 32.1535L8.08406 39.9999H0L7.4708 4.42481H26.425L24.7456 12.1941H7.38552L12.3809 20.1746H31.0387L35.3518 0H48.1774Z" fill={fill} />
    </svg>
  );
}

function Wordmark({ light = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <FFMark size={26} accent={light} />
      <span style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em',
        color: light ? '#fff' : 'var(--ink)',
      }}>
        Flex<span style={{ color: light ? 'var(--ff-lime)' : 'var(--ff-blue)' }}>Factory</span>
      </span>
    </div>
  );
}

/* ============================ Icons ============================ */
const I = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  swap: 'M7 7h11M7 7l3-3M7 7l3 3M17 17H6M17 17l-3-3M17 17l-3 3',
  inbox: 'M3 12h5l2 3h4l2-3h5M3 12v7h18v-7M3 12l3-8h12l3 8',
  users: 'M9 11a4 4 0 100-8 4 4 0 000 8zM2 21a7 7 0 0114 0M17 11a3 3 0 100-6M21 21a6 6 0 00-5-5.9',
  tag: 'M3 3h8l10 10-8 8L3 11zM7 7h.01',
  bank: 'M3 9l9-6 9 6M4 9v11h16V9M9 13v4M15 13v4',
  gear: 'M12 9a3 3 0 100 6 3 3 0 000-6zM19.4 13a7.9 7.9 0 000-2l2-1.5-2-3.4-2.4 1a8 8 0 00-1.7-1l-.4-2.6H9.1l-.4 2.6a8 8 0 00-1.7 1l-2.4-1-2 3.4L4.6 11a7.9 7.9 0 000 2l-2 1.5 2 3.4 2.4-1a8 8 0 001.7 1l.4 2.6h4.2l.4-2.6a8 8 0 001.7-1l2.4 1 2-3.4z',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  check: 'M20 6L9 17l-5-5',
  x: 'M18 6L6 18M6 6l12 12',
  chevR: 'M9 18l6-6-6-6',
  chevD: 'M6 9l6 6 6-6',
  dots: 'M12 6h.01M12 12h.01M12 18h.01',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  filter: 'M3 5h18M6 12h12M10 19h4',
  arrowUp: 'M12 19V5M5 12l7-7 7 7',
  arrowDn: 'M12 5v14M5 12l7 7 7-7',
  alert: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z',
  pause: 'M10 4H6v16h4zM18 4h-4v16h4z',
  play: 'M6 4l14 8-14 8z',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  eyeOff: 'M9.9 4.2A9.1 9.1 0 0112 4c6 0 10 7 10 7a17 17 0 01-2.2 3M6.6 6.6A17 17 0 002 12s4 7 10 7a9 9 0 004.1-1M1 1l22 22M9.9 9.9a3 3 0 004.2 4.2',
  logout: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9',
  clock: 'M12 7v5l3 2M12 21a9 9 0 100-18 9 9 0 000 18z',
  box: 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8',
  pin: 'M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5',
  menu: 'M3 6h18M3 12h18M3 18h18',
  wallet: 'M3 7h15a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7V5a2 2 0 012-2h11M17 13h.01',
  star: 'M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 21l1.2-6.5L2.5 9.9 9.1 9z',
  plus: 'M12 5v14M5 12h14',
  trash: 'M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6',
  upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
  image: 'M3 3h18v18H3zM3 15l5-5 4 4 3-3 6 6M8.5 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3',
  file: 'M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9zM14 3v6h6M9 13h6M9 17h4',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  calendar: 'M3 5h18v16H3zM3 9h18M8 3v4M16 3v4',
  truck: 'M3 6h11v9H3zM14 9h4l3 3v3h-7zM7 18a2 2 0 100-4 2 2 0 000 4zM18 18a2 2 0 100-4 2 2 0 000 4z',
  chart: 'M3 3v18h18M8 15v3M13 10v8M18 6v12',
  refresh: 'M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5',
  phone: 'M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.1-8.7A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.1-1.1a2 2 0 012.1-.5c.9.3 1.8.5 2.7.6a2 2 0 011.7 2z',
  mail: 'M3 5h18v14H3zM3 6l9 7 9-7',
  building: 'M3 21h18M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16M15 21V9h3a1 1 0 011 1v11M8 8h2M8 12h2M8 16h2',
  layers: 'M12 2L2 7l10 5 10-5zM2 12l10 5 10-5M2 17l10 5 10-5',
  doc: 'M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9zM14 3v6h6M9 13h6M9 17h4',
  tools: 'M14.7 6.3a4 4 0 00-5.4 5.4l-6 6a1.5 1.5 0 002 2l6-6a4 4 0 005.4-5.4l-2.5 2.5-2-2z',
  external: 'M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3',
};
function Icon({ name, size = 18, stroke = 2, fill = false, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...style }}>
      <path d={I[name]} />
    </svg>
  );
}

/* ============================ Button ============================ */
function Button({ children, kind = 'primary', size = 'md', icon, iconRight, onClick, disabled, full, danger, style }) {
  const sizes = {
    sm: { h: 32, px: 12, fs: 13 },
    md: { h: 40, px: 16, fs: 14 },
    lg: { h: 48, px: 22, fs: 15 },
  }[size];
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: sizes.h, padding: `0 ${sizes.px}px`, fontSize: sizes.fs, fontWeight: 600,
    border: '1px solid transparent', borderRadius: 0, transition: 'all .15s ease',
    whiteSpace: 'nowrap', width: full ? '100%' : 'auto', letterSpacing: '-0.01em',
    opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? 'none' : 'auto',
  };
  const kinds = {
    primary: { background: 'var(--ff-navy)', color: '#fff' },
    accent: { background: 'var(--ff-blue)', color: '#fff' },
    lime: { background: 'var(--ff-lime)', color: 'var(--ff-navy)' },
    secondary: { background: '#fff', color: 'var(--ink)', borderColor: 'var(--line-strong)' },
    ghost: { background: 'transparent', color: 'var(--ink-2)' },
  };
  if (danger) kinds.primary = { background: 'var(--neg)', color: '#fff' };
  const [hover, setHover] = useState(false);
  const hoverStyle = hover && !disabled ? {
    primary: { background: '#0b133a' }, accent: { background: 'var(--ff-blue-deep)' },
    lime: { filter: 'brightness(0.95)' }, secondary: { background: 'var(--ff-fog)', borderColor: 'var(--ink-3)' },
    ghost: { background: 'rgba(7,15,65,0.05)' },
  }[danger ? 'primary' : kind] : {};
  if (danger && hover) hoverStyle.background = '#a82424';
  return (
    <button className="chamfer-sm focus-lime" style={{ ...base, ...kinds[kind], ...hoverStyle, ...style }}
      onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {icon && <Icon name={icon} size={sizes.fs + 3} stroke={2.2} />}
      {children}
      {iconRight && <Icon name={iconRight} size={sizes.fs + 3} stroke={2.2} />}
    </button>
  );
}

/* ============================ Status pill ============================ */
const STATUS_MAP = {
  active: ['pos', 'Active'], confirmed: ['pos', 'Confirmed'], live: ['pos', 'Live'], paid: ['pos', 'Paid'], approved: ['pos', 'Approved'],
  pending: ['warn', 'Pending'], review: ['warn', 'In review'], flagged: ['warn', 'Flagged'],
  suspended: ['neg', 'Suspended'], failed: ['neg', 'Failed'], rejected: ['neg', 'Rejected'], disabled: ['neg', 'Disabled'], refunded: ['neutral', 'Refunded'],
};
function Status({ value }) {
  const [tone, label] = STATUS_MAP[value] || ['neutral', value];
  const tones = {
    pos: { bg: 'var(--pos-bg)', fg: 'var(--pos)', dot: 'var(--pos)' },
    warn: { bg: 'var(--warn-bg)', fg: 'var(--warn)', dot: 'var(--warn)' },
    neg: { bg: 'var(--neg-bg)', fg: 'var(--neg)', dot: 'var(--neg)' },
    neutral: { bg: '#EEEEEA', fg: 'var(--ink-2)', dot: 'var(--ink-3)' },
  }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, height: 24, padding: '0 9px 0 8px',
      background: tones.bg, color: tones.fg, fontSize: 12.5, fontWeight: 600, borderRadius: 0, whiteSpace: 'nowrap', flexShrink: 0,
    }} className="chamfer-sm">
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: tones.dot }} />
      {label}
    </span>
  );
}

function Tag({ children, tone = 'blue' }) {
  const tones = {
    blue:   { bg: 'rgba(1,53,244,0.08)',  fg: 'var(--ff-blue)'  },
    navy:   { bg: 'rgba(7,15,65,0.07)',   fg: 'var(--ff-navy)'  },
    pos:    { bg: 'var(--pos-bg)',         fg: 'var(--pos)'      },
    warn:   { bg: 'var(--warn-bg)',        fg: 'var(--warn)'     },
    neg:    { bg: 'var(--neg-bg)',         fg: 'var(--neg)'      },
    purple: { bg: 'rgba(91,107,214,0.12)', fg: '#4A5BC4'         },
    gray:   { bg: '#EEEEEA',               fg: 'var(--ink-2)'    },
    default:{ bg: '#EEEEEA',               fg: 'var(--ink-2)'    },
  }[tone] || { bg: '#EEEEEA', fg: 'var(--ink-2)' };
  return <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', background: tones.bg, color: tones.fg, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }} className="chamfer-sm">{children}</span>;
}

/* ============================ Card ============================ */
function Card({ children, style, pad = true, className = '' }) {
  return (
    <div className={`chamfer ${className}`} style={{
      background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
      padding: pad ? 'var(--gap)' : 0, ...style,
    }}>{children}</div>
  );
}

function SectionTitle({ children, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
      <div>
        <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 19, letterSpacing: '-0.02em', color: 'var(--ink)' }}>{children}</h2>
        {sub && <p style={{ margin: '4px 0 0', fontSize: 13.5, color: 'var(--ink-3)' }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/* ============================ Avatar ============================ */
function Avatar({ name, size = 34, tone }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const tones = ['var(--ff-blue)', 'var(--ff-blue-deep)', 'var(--ff-navy)', '#5B6BD6', '#3A4AA0'];
  const c = tone || tones[name.charCodeAt(0) % tones.length];
  return (
    <div className="chamfer-sm" style={{
      width: size, height: size, background: c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.36, fontFamily: 'var(--font-display)', flexShrink: 0,
    }}>{initials}</div>
  );
}

/* ============================ Table ============================ */
function Table({ columns, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={i} style={{
                textAlign: c.align || 'left', padding: '0 16px', height: 42, fontWeight: 600, fontSize: 12,
                letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--ink-3)',
                borderBottom: '1px solid var(--line)', background: 'var(--surface-2)', whiteSpace: 'nowrap',
                width: c.w,
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Row({ children, onClick }) {
  const [h, setH] = useState(false);
  return (
    <tr onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: h && onClick ? 'var(--surface-2)' : 'transparent', cursor: onClick ? 'pointer' : 'default', transition: 'background .12s' }}>
      {children}
    </tr>
  );
}
function Cell({ children, align = 'left', style, mono }) {
  return (
    <td style={{
      padding: '0 16px', height: 'var(--row-h)', borderBottom: '1px solid var(--line)', textAlign: align,
      color: 'var(--ink)', fontVariantNumeric: mono ? 'tabular-nums' : 'normal', verticalAlign: 'middle', ...style,
    }}>{children}</td>
  );
}

/* ============================ Stat card ============================ */
function Stat({ label, value, delta, deltaDir = 'up', spark, accent }) {
  return (
    <Card style={{ position: 'relative', overflow: 'hidden' }}>
      {accent && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 3, background: 'var(--ff-lime)' }} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.01em' }}>{label}</div>
        {delta != null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12.5, fontWeight: 700, color: deltaDir === 'up' ? 'var(--pos)' : 'var(--neg)' }}>
            <Icon name={deltaDir === 'up' ? 'arrowUp' : 'arrowDn'} size={13} stroke={2.6} />{delta}
          </span>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 30, letterSpacing: '-0.03em', marginTop: 8, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {spark && <div style={{ marginTop: 12 }}>{spark}</div>}
    </Card>
  );
}

/* ============================ Sparkline / charts ============================ */
function Sparkline({ data, color = 'var(--ff-blue)', h = 36, fill = true }) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 120;
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, h - ((d - min) / (max - min || 1)) * (h - 4) - 2]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const gid = 'sg' + Math.round(max * 1000 + data.length);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none">
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.18" /><stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient></defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function BarChart({ data, color = 'var(--ff-blue)', h = 180, labels }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: h }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div className="chamfer-sm" title={String(d)} style={{
            width: '100%', height: `${(d / max) * 100}%`, minHeight: 3,
            background: i === data.length - 1 ? 'var(--ff-blue)' : 'rgba(1,53,244,0.22)',
            transition: 'height .5s cubic-bezier(.2,.8,.3,1)',
          }} />
        </div>
      ))}
    </div>
  );
}

function Donut({ segments, size = 150 }) {
  let acc = 0; const r = size / 2 - 14; const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {segments.map((s, i) => {
          const len = (s.value / 100) * c; const off = acc; acc += len;
          return <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth="18"
            strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} />;
        })}
      </g>
    </svg>
  );
}

/* ============================ Modal ============================ */
function Modal({ open, onClose, children, title, width = 520, footer }) {
  useEffect(() => {
    if (!open) return;
    const fn = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn); return () => window.removeEventListener('keydown', fn);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(7,15,65,0.42)', backdropFilter: 'blur(3px)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'ff-fade .2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} className="chamfer" style={{
        background: 'var(--surface)', width: '100%', maxWidth: width, maxHeight: '88vh', overflow: 'auto',
        boxShadow: 'var(--shadow-lg)', animation: 'ff-scale-in .24s cubic-bezier(.2,.8,.3,1)',
      }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid var(--line)' }}>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 17, letterSpacing: '-0.02em' }}>{title}</h3>
            <button onClick={onClose} className="focus-lime" style={{ border: 'none', background: 'transparent', color: 'var(--ink-3)', padding: 4, display: 'flex' }}><Icon name="x" size={20} /></button>
          </div>
        )}
        <div style={{ padding: 22 }}>{children}</div>
        {footer && <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '16px 22px', borderTop: '1px solid var(--line)', background: 'var(--surface-2)' }}>{footer}</div>}
      </div>
    </div>
  );
}

/* ============================ Toasts ============================ */
const ToastCtx = createContext(null);
function useToast() { return useContext(ToastCtx); }
function ToastHost({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((text, tone = 'ok') => {
    const id = Math.random();
    setList(l => [...l, { id, text, tone }]);
    setTimeout(() => setList(l => l.filter(t => t.id !== id)), 3400);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2000, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        {list.map(t => (
          <div key={t.id} className="chamfer-sm" style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: 'var(--ff-navy)', color: '#fff',
            boxShadow: 'var(--shadow-lg)', fontSize: 14, fontWeight: 500, animation: 'ff-fade-up .26s cubic-bezier(.2,.8,.3,1)', maxWidth: '90vw',
          }}>
            <span style={{ color: t.tone === 'err' ? '#FF8A8A' : 'var(--ff-lime)', display: 'flex' }}>
              <Icon name={t.tone === 'err' ? 'alert' : 'check'} size={18} stroke={2.6} />
            </span>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ============================ Search field ============================ */
function SearchField({ value, onChange, placeholder = 'Search…', width = 260 }) {
  return (
    <div className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px', background: 'var(--surface)', border: '1px solid var(--line-strong)', width, maxWidth: '100%' }}>
      <Icon name="search" size={16} style={{ color: 'var(--ink-3)' }} />
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 14, width: '100%', color: 'var(--ink)' }} />
    </div>
  );
}

function Field({ label, children, hint }) {
  return (
    <label style={{ display: 'block' }}>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7 }}>{label}</div>}
      {children}
      {hint && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{hint}</div>}
    </label>
  );
}
function TextInput(props) {
  return <input {...props} className="chamfer-sm focus-lime" style={{
    width: '100%', height: 42, padding: '0 14px', border: '1px solid var(--line-strong)', background: 'var(--surface)',
    fontSize: 14, color: 'var(--ink)', outline: 'none', ...props.style,
  }} />;
}

/* ============================ Filter chips ============================ */
function Chips({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(o => {
        const active = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} className="chamfer-sm focus-lime" style={{
            height: 34, padding: '0 14px', fontSize: 13, fontWeight: 600, border: '1px solid',
            borderColor: active ? 'var(--ff-navy)' : 'var(--line-strong)',
            background: active ? 'var(--ff-navy)' : 'var(--surface)', color: active ? '#fff' : 'var(--ink-2)',
            transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 7,
          }}>
            {o.label}{o.count != null && <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Empty({ icon = 'inbox', title, sub }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--ink-3)' }}>
      <div style={{ display: 'inline-flex', padding: 16, background: 'var(--ff-fog)', marginBottom: 14 }} className="chamfer-sm"><Icon name={icon} size={26} /></div>
      <div style={{ fontWeight: 600, color: 'var(--ink-2)', fontSize: 15 }}>{title}</div>
      {sub && <div style={{ fontSize: 13.5, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

Object.assign(window, {
  FFMark, Wordmark, Icon, Button, Status, Tag, Card, SectionTitle, Avatar,
  Table, Row, Cell, Stat, Sparkline, BarChart, Donut, Modal, ToastHost, useToast,
  SearchField, Field, TextInput, Chips, Empty,
});
