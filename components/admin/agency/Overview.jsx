"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icons";
import { classNames } from "@/lib/utils";
import { Button, PageHeader, Panel } from "@/components/admin/agency/kit";
import { countdownLabel, coupleName, percent } from "@/components/admin/agency/shared";

/**
 * Aperçu de supervision : chiffres clés de la plateforme (hors démos),
 * prochains événements et points à surveiller. Le détail d'un événement
 * (qui a répondu, messages…) se consulte dans sa propre page.
 */
export default function Overview({ data, usersById, openDialog, goTo }) {
  const real = data.events.filter((event) => !event.isDemo);
  const upcoming = real
    .filter((event) => event.status === "upcoming")
    .sort((a, b) => a.daysLeft - b.daysLeft);
  const past = real.filter((event) => event.status === "past");
  const guests = real.reduce((sum, event) => sum + event.guests, 0);
  const answers = real.reduce((sum, event) => sum + event.rsvp, 0);
  const clients = data.users.filter((user) => user.role !== "agency");
  const alerts = buildAlerts(real, usersById);

  const now = new Date(data.now);
  const greeting = now.getHours() < 5 || now.getHours() >= 18 ? "Bonsoir" : "Bonjour";

  const stats = [
    {
      label: "Événements à venir",
      value: upcoming.length,
      hint: `${past.length} passé${past.length > 1 ? "s" : ""}`,
      onClick: () => goTo("evenements", "upcoming"),
    },
    {
      label: "Clients",
      value: clients.length,
      hint: `${clients.filter((user) => user.events.length > 0).length} avec un événement`,
      onClick: () => goTo("comptes"),
    },
    { label: "Invités gérés", value: guests, hint: `sur ${real.length} événement${real.length > 1 ? "s" : ""}` },
    { label: "Taux de réponse", value: `${percent(answers, guests)} %`, hint: `${answers} confirmation${answers > 1 ? "s" : ""}` },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        title={greeting}
        text={
          upcoming.length === 0
            ? "Aucun événement à venir pour le moment."
            : `${upcoming.length} événement${upcoming.length > 1 ? "s" : ""} à venir, le prochain ${
                upcoming[0].daysLeft === 0
                  ? "aujourd'hui"
                  : `dans ${upcoming[0].daysLeft} jour${upcoming[0].daysLeft > 1 ? "s" : ""}`
              }.`
        }
        actions={
          <>
            <Button icon="plus" onClick={() => openDialog("create-event")}>
              Nouvel événement
            </Button>
            <Button variant="outline" icon="users" onClick={() => openDialog("create-account")}>
              Nouveau compte
            </Button>
          </>
        }
      />

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-passora-ink/10 bg-passora-ink/10 lg:grid-cols-4">
        {stats.map((stat) => {
          const Tag = stat.onClick ? "button" : "div";
          return (
            <Tag
              key={stat.label}
              {...(stat.onClick ? { type: "button", onClick: stat.onClick } : {})}
              className={classNames(
                "flex flex-col bg-white p-5 text-left",
                stat.onClick && "cursor-pointer transition-colors hover:bg-cream",
              )}
            >
              <dt className="text-[0.66rem] font-medium tracking-[0.16em] text-passora-ink/50 uppercase">{stat.label}</dt>
              <dd className="mt-3 font-serif text-4xl leading-none font-medium lining-nums">{stat.value}</dd>
              <dd className="mt-2 text-xs text-passora-ink/50">{stat.hint}</dd>
            </Tag>
          );
        })}
      </dl>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel
          title="Prochains événements"
          className="lg:col-span-2"
          bodyClassName=""
          action={
            <button
              type="button"
              onClick={() => goTo("evenements", "upcoming")}
              className="cursor-pointer text-xs font-medium tracking-wide text-passora-gold-deep hover:text-passora-ink"
            >
              Tout voir
            </button>
          }
        >
          {upcoming.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-passora-ink/50">Aucun événement à venir.</p>
          ) : (
            <ul className="divide-y divide-passora-ink/8">
              {upcoming.slice(0, 6).map((event) => (
                <li key={event.id}>
                  <UpcomingRow event={event} owner={usersById.get(event.owner_id)} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="À surveiller" className="self-start" bodyClassName="">
          {alerts.length === 0 ? (
            <p className="flex items-center gap-3 px-5 py-5 text-sm text-olive-deep">
              <Icon name="check" className="h-4 w-4 shrink-0" />
              Tout est en ordre sur les événements à venir.
            </p>
          ) : (
            <ul className="divide-y divide-passora-ink/8">
              {alerts.map((alert) => (
                <li key={`${alert.event.id}-${alert.key}`}>
                  <AlertRow alert={alert} openDialog={openDialog} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/** Points d'attention des événements à venir, du plus au moins urgent. */
function buildAlerts(events, usersById) {
  const alerts = [];
  for (const event of events) {
    if (event.status === "past") continue;
    const owner = usersById.get(event.owner_id);
    if (event.guests === 0) {
      alerts.push({ event, key: "guests", level: 0, text: "Liste d'invités vide : n'importe qui peut confirmer." });
    }
    if (!event.owner_id) {
      alerts.push({ event, key: "owner", level: 1, text: "Aucun compte client associé.", dialog: "owner" });
    } else if (owner && !owner.lastSignInAt) {
      alerts.push({
        event,
        key: "signin",
        level: 1,
        text: "Le client ne s'est jamais connecté.",
        dialog: "reset-password",
        target: owner,
      });
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

function UpcomingRow({ event, owner }) {
  const date = event.wedding_date ? new Date(event.wedding_date) : null;
  const rate = percent(event.rsvp, event.guests);
  return (
    <Link href={`/admin/${event.slug}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream">
      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md bg-passora-ink text-cream">
        <span className="font-serif text-xl leading-none lining-nums">{date ? date.getDate() : "?"}</span>
        <span className="mt-0.5 text-[0.55rem] font-medium tracking-[0.15em] text-passora-gold uppercase">
          {date ? date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "") : "date"}
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate font-serif text-lg font-medium">{coupleName(event)}</span>
          <span className="shrink-0 text-xs font-medium text-passora-gold-deep">{countdownLabel(event)}</span>
        </span>
        <span className="mt-2 flex items-center gap-3">
          <span className="h-1 flex-1 bg-passora-ink/8">
            <span className="block h-full bg-passora-gold" style={{ width: `${rate}%` }} />
          </span>
          <span className="shrink-0 text-xs text-passora-ink/55 lining-nums">{rate} % de réponses</span>
        </span>
        <span className="mt-1 block truncate text-xs text-passora-ink/40">{owner?.email || "Aucun compte client"}</span>
      </span>
      <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-passora-ink/25 transition-colors group-hover:text-passora-ink/60" />
    </Link>
  );
}

function AlertRow({ alert, openDialog }) {
  const content = (
    <>
      <span
        className={classNames(
          "mt-1.5 h-2 w-2 shrink-0",
          alert.level <= 1 ? "bg-rust" : alert.level === 2 ? "bg-passora-gold" : "bg-passora-ink/25",
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{coupleName(alert.event)}</span>
        <span className="block text-xs leading-snug text-passora-ink/60">{alert.text}</span>
      </span>
      <Icon name="chevron-right" className="mt-1 h-4 w-4 shrink-0 text-passora-ink/25" />
    </>
  );
  const className = "flex w-full cursor-pointer items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-cream";
  return alert.dialog ? (
    <button type="button" onClick={() => openDialog(alert.dialog, alert.target || alert.event)} className={className}>
      {content}
    </button>
  ) : (
    <Link href={`/admin/${alert.event.slug}`} className={className}>
      {content}
    </Link>
  );
}
