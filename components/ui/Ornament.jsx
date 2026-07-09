import Icon from "@/components/ui/Icons";

/** Séparateur décoratif : filet — cœur — filet. */
export default function Ornament({ className = "text-terracotta" }) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className}`} aria-hidden="true">
      <span className="h-px w-14 bg-gradient-to-l from-current to-transparent opacity-60" />
      <Icon name="heart" className="h-4 w-4" />
      <span className="h-px w-14 bg-gradient-to-r from-current to-transparent opacity-60" />
    </div>
  );
}
