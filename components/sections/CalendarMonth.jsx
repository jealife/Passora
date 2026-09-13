import FadeIn from "@/components/ui/FadeIn";

const WEEKDAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Grille du mois du mariage, du lundi au dimanche, jour du mariage mis en évidence. */
function buildMonthGrid(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = lundi

  const cells = Array(startWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  return cells;
}

/** Mini-calendrier du mois, avec le jour du mariage entouré. */
export default function CalendarMonth({ weddingDate }) {
  const date = new Date(weddingDate);
  if (Number.isNaN(date.getTime())) return null;

  const cells = buildMonthGrid(date);
  const weddingDay = date.getDate();

  return (
    <FadeIn className="mx-auto max-w-xs">
      <p className="mb-4 text-center font-serif text-lg italic text-cocoa">
        {MONTHS_FR[date.getMonth()]} {date.getFullYear()}
      </p>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((day) => (
          <span key={day} className="text-[0.6rem] font-medium tracking-wide text-cocoa/45">
            {day}
          </span>
        ))}
        {cells.map((day, index) => (
          <span
            key={index}
            className={
              day === weddingDay
                ? "mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-terracotta text-xs font-medium text-cream"
                : "flex h-7 w-7 items-center justify-center text-xs font-light text-cocoa/70"
            }
          >
            {day || ""}
          </span>
        ))}
      </div>
    </FadeIn>
  );
}
