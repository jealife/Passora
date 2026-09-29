"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icons";
import { AdminButton } from "@/components/admin/ui";
import { classNames } from "@/lib/utils";
import { countdownLabel, coupleName, percent, relativeTime } from "@/components/admin/agency/shared";

/**
 * Aperçu de la plateforme : chiffres clés (hors démos), prochains
 * événements, dernières confirmations et points à surveiller.
 */
export default function Overview({ data, openDialog, goTo }) {
  const real = data.events.filter((event) => !event.isDemo);
  const upcoming = real
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const past = real.filter((event) => event.status === "past");
  const totals = real.reduce(
    (sum, event) => ({
      guests: sum.guests + event.guests,
      rsvp: sum.rsvp + event.rsvp,
      checked: sum.checked + event.checked,
    }),
    { guests: 0, rsvp: 0, checked: 0 },
  );
  const eventsById = new Map(data.events.map((event) => [event.id, event]));
  const activity = data.activity.filter((item) => !eventsById.get(item.event_id)?.isDemo).slice(0, 8);
  const alerts = buildAlerts(real);

  const now = new Date(data.now);
  const greeting = now.getHours() < 5 || now.getHours() >= 18 ? "Bonsoir" : "Bonjour";

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-passora-ink via-cocoa to-passora-gold-deep px-6 py-6 text-cream shadow-xl shadow-passora-ink/20 sm:px-9 sm:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-passora-gold/25 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.3em] text-cream/65">
              {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1.5 font-serif text-3xl font-medium italic sm:text-4xl">{greeting}</h1>
            <p className="mt-1.5 text-sm font-light text-cream/75">
              {upcoming.length === 0
                ? "Aucun événement à venir pour le moment."
                : `${upcoming.length} événement${upcoming.length > 1 ? "s" : ""} à venir, le prochain ${
                    upcoming[0].daysLeft === 0 ? "aujourd'hui" : `dans ${upcoming[0].daysLeft} jour${upcoming[0].daysLeft > 1 ? "s" : ""}`
                  }.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminButton icon="plus" onClick={() => openDialog("create-event")}>
              Nouvel événement
            </AdminButton>
            <AdminButton icon="users" variant="onDark" onClick={() => openDialog("create-account")}>
              Nouveau compte
            </AdminButton>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon="calendar"
          label="À venir"
          value={upcoming.length}
          hint={`${past.length} passé${past.length > 1 ? "s" : ""}`}
          onClick={() => goTo("evenements", "upcoming")}
        />
        <Stat icon="users" label="Invités" value={totals.guests} hint={`sur ${real.length} événement${real.length > 1 ? "s" : ""}`} />
        <Stat
          icon="check"
          label="Confirmations"
          value={totals.rsvp}
          hint={`${percent(totals.rsvp, totals.guests)} % des invités`}
        />
        <Stat icon="ticket" label="Entrées scannées" value={totals.checked} hint="le jour J" />
      </div>

      {/* Mobile : prochains événements, points à surveiller, puis activité.
          Grand écran : les points à surveiller occupent la colonne de droite. */}
      <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
        <Panel
          title="Prochains événements"
          className="lg:col-span-2"
          action={
            <button
              type="button"
              onClick={() => goTo("evenements", "upcoming")}
              className="cursor-pointer text-xs font-medium uppercase tracking-[0.15em] text-passora-gold-deep hover:text-cocoa"
            >
              Tout voir
            </button>
          }
        >
          {upcoming.length === 0 ? (
            <Empty>Aucun événement à venir.</Empty>
          ) : (
            <ul className="-mx-2">
              {upcoming.slice(0, 5).map((event) => (
                <li key={event.id}>
                  <UpcomingRow event={event} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="À surveiller" className="self-start lg:row-span-2">
          {alerts.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl bg-olive/10 p-4 text-sm text-olive-deep">
              <Icon name="check" className="h-5 w-5 shrink-0" />
              Tout est en ordre sur les événements à venir.
            </div>
          ) : (
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li key={`${alert.event.id}-${alert.key}`}>
                  <AlertRow alert={alert} openDialog={openDialog} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Activité récente" className="lg:col-span-2">
          {activity.length === 0 ? (
            <Empty>Les confirmations des invités apparaîtront ici.</Empty>
          ) : (
            <ul className="divide-y divide-cocoa/6">
              {activity.map((item) => (
                <ActivityRow key={item.id} item={item} event={eventsById.get(item.event_id)} now={data.now} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/** Points d'attention des événements à venir, du plus au moins urgent. */
function buildAlerts(events) {
  const alerts = [];
  for (const event of events) {
    if (event.status === "past") continue;
    if (event.guests === 0) {
      alerts.push({ event, key: "guests", level: 0, text: "Liste d'invités vide : n'importe qui peut confirmer." });
    }
    if (!event.owner_id) {
      alerts.push({ event, key: "owner", level: 1, text: "Aucun compte couple associé.", dialog: "owner" });
    }
    if (event.status === "upcoming" && event.daysLeft <= 14 && event.guests > 0 && event.rsvp / event.guests < 0.5) {
      alerts.push({
        event,
        key: "rsvp",
        level: 1,
        text: `${percent(event.rsvp, event.guests)} % de réponses à ${countdownLabel(event)}.`,
      });
    }
    if (event.status === "undated") alerts.push({ event, key: "date", level: 2, text: "Date à définir." });
    else if (!event.date_confirmed) alerts.push({ event, key: "date", level: 2, text: "Date encore à confirmer." });
    if (!event.hero_image_url) alerts.push({ event, key: "photo", level: 3, text: "Pas de photo d'accueil." });
  }
  return alerts.sort((a, b) => a.level - b.level);
}

function Panel({ title, action, className, children }) {
  return (
    <section className={classNames("rounded-3xl border border-cocoa/10 bg-white p-5 shadow-sm sm:p-6", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-medium text-cocoa">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <p className="py-6 text-center text-sm font-light text-cocoa/50">{children}</p>;
}

function Stat({ icon, label, value, hint, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      {...(onClick ? { type: "button", onClick } : {})}
      className={classNames(
        "rounded-2xl border border-cocoa/8 bg-white p-4 text-left shadow-sm sm:p-5",
        onClick && "cursor-pointer transition-all hover:-translate-y-0.5 hover:border-passora-gold/40 hover:shadow-md",
      )}
    >
      <span className="flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-cocoa/50">
        <Icon name={icon} className="h-3.5 w-3.5 text-passora-gold-deep" />
        {label}
      </span>
      <span className="mt-2 block font-serif text-4xl font-medium leading-none text-cocoa lining-nums">
        {value.toLocaleString("fr-FR")}
      </span>
      <span className="mt-1.5 block text-xs font-light text-cocoa/50">{hint}</span>
    </Tag>
  );
}

function UpcomingRow({ event }) {
  const date = event.wedding_date ? new Date(event.wedding_date) : null;
  const rate = percent(event.rsvp, event.guests);
  return (
    <Link
      href={`/admin/${event.slug}`}
      className="group flex items-center gap-4 rounded-2xl px-2 py-2.5 transition-colors hover:bg-cream"
    >
      <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-passora-ink text-cream">
        <span className="font-serif text-2xl leading-none lining-nums">{date ? date.getDate() : "?"}</span>
        <span className="mt-0.5 text-[0.55rem] font-medium uppercase tracking-[0.15em] text-passora-gold">
          {date ? date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "") : "date"}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate font-serif text-lg italic text-cocoa">{coupleName(event)}</span>
          <span className="shrink-0 text-xs font-medium text-passora-gold-deep">{countdownLabel(event)}</span>
        </span>
        <span className="mt-1.5 flex items-center gap-3">
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-cocoa/8">
            <span className="block h-full rounded-full bg-passora-gold" style={{ width: `${rate}%` }} />
          </span>
          <span className="shrink-0 text-xs text-cocoa/55 tabular-nums">
            {event.rsvp}/{event.guests} réponses
          </span>
        </span>
      </span>
      <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-cocoa/25 transition-colors group-hover:text-cocoa/60" />
    </Link>
  );
}

function ActivityRow({ item, event, now }) {
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={classNames(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          item.checked_in_at ? "bg-passora-gold/20 text-passora-gold-deep" : "bg-olive/12 text-olive-deep",
        )}
      >
        <Icon name={item.checked_in_at ? "ticket" : "check"} className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-cocoa">
          <span className="font-medium">{item.guest_name}</span>{" "}
          <span className="font-light text-cocoa/70">{item.checked_in_at ? "est entré(e)" : "a confirmé"}</span>
        </p>
        <p className="mt-0.5 text-xs text-cocoa/50">
          {event ? (
            <Link href={`/admin/${event.slug}`} className="hover:text-cocoa">
              {coupleName(event)}
            </Link>
          ) : (
            "Événement supprimé"
          )}{" "}
          · {relativeTime(item.checked_in_at || item.created_at, now)}
        </p>
        {item.message && (
          <p className="mt-1.5 line-clamp-2 font-serif text-sm italic text-cocoa/70">« {item.message} »</p>
        )}
      </div>
    </li>
  );
}

function AlertRow({ alert, openDialog }) {
  const content = (
    <>
      <span
        className={classNames(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          alert.level <= 1 ? "bg-rust/10 text-rust" : "bg-passora-gold/20 text-passora-gold-deep",
        )}
      >
        <Icon name="alert" className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-cocoa">{coupleName(alert.event)}</span>
        <span className="block text-xs leading-snug font-light text-cocoa/60">{alert.text}</span>
      </span>
      <Icon name="chevron-right" className="mt-1.5 h-4 w-4 shrink-0 text-cocoa/25" />
    </>
  );
  const className =
    "flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-cocoa/8 p-3 text-left transition-colors hover:border-passora-gold/40 hover:bg-cream/60";
  return alert.dialog ? (
    <button type="button" onClick={() => openDialog(alert.dialog, alert.event)} className={className}>
      {content}
    </button>
  ) : (
    <Link href={`/admin/${alert.event.slug}`} className={className}>
      {content}
    </Link>
  );
}
