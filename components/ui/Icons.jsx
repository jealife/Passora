/**
 * Jeu d'icônes SVG inline (trait fin, style « feather »).
 * Usage : <Icon name="heart" className="h-5 w-5 text-rust" />
 * Aucune dépendance externe, couleur héritée via currentColor.
 */

const PATHS = {
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2.5" />
      <path d="M16 2.5v4M8 2.5v4M3 9.5h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  "map-pin": (
    <>
      <path d="M21 10.4c0 6.5-9 12.6-9 12.6s-9-6.1-9-12.6a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10.4" r="3.1" />
    </>
  ),
  heart: (
    <path d="M20.84 4.9a5.4 5.4 0 0 0-7.65 0L12 6.09 10.81 4.9a5.41 5.41 0 0 0-7.65 7.65l1.18 1.19L12 21.38l7.66-7.64 1.18-1.19a5.4 5.4 0 0 0 0-7.65Z" />
  ),
  rings: (
    <>
      <circle cx="9.2" cy="13" r="5.8" />
      <circle cx="14.8" cy="11" r="5.8" />
    </>
  ),
  music: (
    <>
      <path d="M9 18.5V5.5l12-2.2v12.9" />
      <circle cx="6" cy="18.5" r="3" />
      <circle cx="18" cy="16.2" r="3" />
    </>
  ),
  play: <path d="M7 4.8c0-.8.9-1.3 1.6-.9l11.4 7.2c.6.4.6 1.4 0 1.8L8.6 20.1c-.7.4-1.6-.1-1.6-.9V4.8Z" />,
  pause: (
    <>
      <rect x="6" y="4.5" width="4" height="15" rx="1.4" />
      <rect x="14" y="4.5" width="4" height="15" rx="1.4" />
    </>
  ),
  "chevron-left": <path d="m15 18-6-6 6-6" />,
  "chevron-right": <path d="m9 18 6-6-6-6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="M20 6 9 17l-5-5" />,
  glass: (
    <>
      <path d="M8 2.5h8l-.7 7.2a3.6 3.6 0 0 1-3.3 3.3 3.6 3.6 0 0 1-3.3-3.3L8 2.5Z" />
      <path d="M12 13v6.5M8.5 21.5h7M9 6h6" />
    </>
  ),
  camera: (
    <>
      <path d="M22 18.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h3.2L9 4h6l1.8 2.5H20a2 2 0 0 1 2 2v10Z" />
      <circle cx="12" cy="13" r="3.6" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M15.5 4.13a3.5 3.5 0 0 1 0 6.75" />
    </>
  ),
  send: (
    <>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </>
  ),
  loader: <path d="M21 12a9 9 0 1 1-9-9" />,
  "external-link": (
    <>
      <path d="M18 13.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5.5" />
      <path d="M15 3h6v6M10 14 21 3" />
    </>
  ),
  "log-out": (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: (
    <>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  pencil: <path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2.5" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.8-3.8a2 2 0 0 0-2.8 0L6 19.5" />
    </>
  ),
  upload: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m17 8-5-5-5 5M12 3v12" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5M12 15V3" />
    </>
  ),
  leaf: (
    <>
      <path d="M11 20.5A7.3 7.3 0 0 1 9.8 6.4C15.5 5.2 17.5 4.6 19.5 2c1 2.1 2 4.4 2 8.2 0 5.7-5 10.3-10.5 10.3Z" />
      <path d="M2 21.5c.5-3.5 2.5-5.9 6-7.4" />
    </>
  ),
  kola: (
    <>
      <path d="M12 21.5c-4.5 0-8-3.4-8-8C4 8 8 3.5 12 2.5 16 3.5 20 8 20 13.5c0 4.6-3.5 8-8 8Z" />
      <path d="M12 2.5v19M5.5 8.5c2 1.4 11 1.4 13 0" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 4.5 13.8 9.7 19 11.5l-5.2 1.8L12 18.5l-1.8-5.2L5 11.5l5.2-1.8L12 4.5Z" />
      <path d="M19 3v3M20.5 4.5h-3M5 17.5v2.6M6.3 18.8H3.7" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4.5" rx="1" />
      <path d="M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5M12 8v13" />
      <path d="M12 8H8.5A2.25 2.25 0 1 1 10.75 5.75C12 6.5 12 8 12 8ZM12 8h3.5a2.25 2.25 0 1 0-2.25-2.25C12 6.5 12 8 12 8Z" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
      <path d="m3 7 9 6.5L21 7" />
    </>
  ),
  refresh: (
    <>
      <path d="M21 4v6h-6" />
      <path d="M3 20v-6h6" />
      <path d="M20.5 10a8.5 8.5 0 0 0-15.1-3.4L3 10M3.5 14a8.5 8.5 0 0 0 15.1 3.4L21 14" />
    </>
  ),
};

export default function Icon({ name, className = "h-5 w-5", strokeWidth = 1.6, ...props }) {
  const path = PATHS[name];
  if (!path) return null;
  const filled = name === "play" || name === "pause";
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {path}
    </svg>
  );
}
