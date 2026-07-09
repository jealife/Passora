import Icon from "@/components/ui/Icons";
import { classNames } from "@/lib/utils";

const VARIANTS = {
  primary:
    "bg-rust text-cream hover:bg-rust-deep shadow-lg shadow-rust/25 hover:shadow-rust/35 hover:-translate-y-0.5",
  outline:
    "border border-cocoa/25 text-cocoa hover:border-rust hover:text-rust bg-transparent hover:-translate-y-0.5",
  light:
    "bg-cream text-cocoa hover:bg-white shadow-lg shadow-cocoa/10 hover:-translate-y-0.5",
  ghost: "text-cocoa/70 hover:text-rust hover:bg-rust/5",
};

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-7 py-3 text-sm",
  lg: "px-9 py-4 text-sm",
};

/**
 * Bouton réutilisable — rendu <a> si `href` est fourni, <button> sinon.
 * `icon` accepte le nom d'une icône du jeu Icons.jsx.
 */
export default function Button({
  href,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  className = "",
  children,
  ...props
}) {
  const classes = classNames(
    "inline-flex items-center justify-center gap-2.5 rounded-full font-medium uppercase tracking-[0.18em] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const content = (
    <>
      {icon && iconPosition === "left" && <Icon name={icon} className="h-4 w-4" />}
      <span>{children}</span>
      {icon && iconPosition === "right" && <Icon name={icon} className="h-4 w-4" />}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {content}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}
