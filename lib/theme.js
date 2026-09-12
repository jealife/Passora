const HEX_RE = /^#[0-9a-fA-F]{6}$/;

/**
 * Modèles de thème proposés dans l'admin (voir `components/admin/EventForm.jsx`).
 * Un modèle ne fait que pré-remplir les 3 couleurs configurables d'un
 * événement — l'agence peut ensuite les affiner avec les sélecteurs.
 */
export const THEME_PRESETS = [
  {
    id: "terracotta",
    name: "Terracotta",
    primary: "#b76950",
    secondary: "#8a8b62",
    background: "#faf6ef",
  },
  {
    id: "emeraude-or",
    name: "Émeraude & Or",
    primary: "#0b6e4f",
    secondary: "#d4af37",
    background: "#ffffff",
  },
];

const clamp01 = (n) => Math.min(1, Math.max(0, n));

function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return [h * 60, s, l];
}

function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp01(s);
  l = clamp01(l);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r0, g0, b0] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];

  const toHex = (v) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r0)}${toHex(g0)}${toHex(b0)}`;
}

/** Éclaircit (dl > 0) ou assombrit (dl < 0), et ajuste la saturation (ds). */
function adjust(hex, { l: dl = 0, s: ds = 0 } = {}) {
  const [h, s, l] = hexToHsl(hex);
  return hslToHex(h, s + ds, l + dl);
}

/**
 * Dérive les 13 couleurs de la palette (voir app/globals.css `@theme`) à
 * partir des 3 couleurs configurables d'un événement. `mist` (gris neutre,
 * usage marginal) n'est volontairement pas dérivé.
 *
 * Retourne `null` si l'événement n'a aucun thème personnalisé (ou si les
 * valeurs stockées sont invalides), auquel cas la palette par défaut de
 * `app/globals.css` s'applique sans changement.
 */
export function buildEventTheme(event) {
  const primary = event?.theme_primary;
  const secondary = event?.theme_secondary;
  const background = event?.theme_background;

  if (![primary, secondary, background].some(Boolean)) return null;

  const p = HEX_RE.test(primary) ? primary : "#b76950";
  const sec = HEX_RE.test(secondary) ? secondary : "#8a8b62";
  const bg = HEX_RE.test(background) ? background : "#faf6ef";

  return {
    "--color-terracotta": p,
    "--color-rust": adjust(p, { l: -0.12 }),
    "--color-rust-deep": adjust(p, { l: -0.24 }),
    "--color-blush": adjust(p, { l: 0.18, s: -0.15 }),
    "--color-blush-soft": adjust(p, { l: 0.28, s: -0.1 }),

    "--color-olive": sec,
    "--color-olive-deep": adjust(sec, { l: -0.15 }),

    "--color-cream": bg,
    "--color-linen": adjust(bg, { l: -0.03 }),
    "--color-champagne": adjust(bg, { l: -0.02, s: 0.05 }),
    "--color-sand": adjust(bg, { l: -0.08, s: 0.08 }),

    "--color-coffee": adjust(p, { l: -0.45, s: -0.2 }),
    "--color-cocoa": adjust(p, { l: -0.55, s: -0.25 }),
  };
}

/** `{ "--color-x": "#fff" }` -> `--color-x:#fff;--color-y:#000` pour un <style>. */
export function themeToCss(theme) {
  return Object.entries(theme)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}
