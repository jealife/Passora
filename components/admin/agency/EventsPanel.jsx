"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icons";
import { AdminButton, Badge, IconButton, Input, Notice } from "@/components/admin/ui";
import { LAYOUT_TEMPLATES } from "@/lib/layouts";
import { classNames, formatDateFr, normalizeName } from "@/lib/utils";
import { countdownLabel, coupleName, monogram, percent } from "@/components/admin/agency/shared";

const FILTERS = [
  { key: "upcoming", label: "À venir" },
  { key: "past", label: "Passés" },
  { key: "demo", label: "Démos" },
  { key: "all", label: "Tous" },
];

// "À venir" regroupe aussi les événements encore sans date.
const matchesFilter = (event, filter) =>
  filter === "all" ||
  (filter === "upcoming" ? event.status === "upcoming" || event.status === "undated" : event.status === filter);

const layoutName = (id) => LAYOUT_TEMPLATES.find((template) => template.id === id)?.name || id;

/**
 * Tous les événements : recherche (couple, lien, compte), filtres, chiffres
 * clés, et actions (gérer, voir, copier le lien, compte propriétaire,
 * supprimer).
 */
export default function EventsPanel({ data, usersById, openDialog, filter, onFilterChange }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = normalizeName(query);
    const list = data.events.filter((event) => {
      if (!matchesFilter(event, filter)) return false;
      if (!q) return true;
      const owner = usersById.get(event.owner_id)?.email || "";
      return normalizeName(`${coupleName(event)} ${event.slug} ${owner}`).includes(q);
    });
    // Passés : du plus récent au plus ancien ; sinon, du plus proche au plus lointain.
    return filter === "past" ? [...list].reverse() : list;
  }, [data.events, usersById, filter, query]);

  const counts = Object.fromEntries(
    FILTERS.map(({ key }) => [key, data.events.filter((event) => matchesFilter(event, key)).length]),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-medium text-cocoa">Événements</h1>
          <p className="mt-1 text-sm font-light text-cocoa/55">
            {data.events.length} au total, dont {counts.demo} démo{counts.demo > 1 ? "s" : ""} de la vitrine.
          </p>
        </div>
        <AdminButton icon="plus" onClick={() => openDialog("create-event")}>
          Nouvel événement
        </AdminButton>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-cocoa/35" />
          <Input
            type="search"
            placeholder="Couple, lien ou email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-full bg-white p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onFilterChange(item.key)}
              aria-pressed={filter === item.key}
              className={classNames(
                "flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                filter === item.key ? "bg-passora-ink text-cream" : "text-cocoa/60 hover:text-cocoa",
              )}
            >
              {item.label}
              <span className={classNames("tabular-nums", filter === item.key ? "text-passora-gold" : "text-cocoa/35")}>
                {counts[item.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {data.eventsError && <Notice tone="error">Chargement incomplet : {data.eventsError}</Notice>}

      {visible.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-cocoa/15 py-14 text-center text-sm font-light text-cocoa/50">
          {query ? "Aucun événement ne correspond à cette recherche." : "Aucun événement dans cette catégorie."}
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((event) => (
            <EventCard key={event.id} event={event} owner={usersById.get(event.owner_id)} openDialog={openDialog} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ event }) {
  if (event.isDemo) return <Badge tone="ink">Démo</Badge>;
  if (event.status === "past") return <Badge>Passé</Badge>;
  if (event.status === "undated") return <Badge>Sans date</Badge>;
  if (event.daysLeft === 0) return <Badge tone="success">Jour J</Badge>;
  return <Badge tone="gold">{countdownLabel(event)}</Badge>;
}

function EventCard({ event, owner, openDialog }) {
  const [copied, setCopied] = useState(false);

  const copyLink = () =>
    navigator.clipboard.writeText(`${window.location.origin}/e/${event.slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  const stats = [
    { label: "Invités", value: event.guests },
    { label: "Réponses", value: event.rsvp, hint: event.guests ? `${percent(event.rsvp, event.guests)} %` : null },
    { label: "Entrées", value: event.checked },
    { label: "Photos", value: event.photos },
  ];

  return (
    <article className="flex flex-col rounded-3xl border border-cocoa/8 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3.5">
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-passora-gold font-serif text-base italic text-passora-ink">
          {event.hero_image_url ? (
            <Image src={event.hero_image_url} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            monogram(event)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="min-w-0 font-serif text-xl leading-tight italic text-cocoa">{coupleName(event)}</h2>
            <StatusBadge event={event} />
          </div>
          <p className="mt-1 text-xs text-cocoa/55">
            <span className="capitalize">{event.wedding_date ? formatDateFr(event.wedding_date) : "Date à définir"}</span>
            {event.wedding_date && !event.date_confirmed && " (à confirmer)"}
          </p>
          <p className="mt-0.5 truncate text-xs text-cocoa/40">
            /e/{event.slug} · {layoutName(event.layout_template)}
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-4 divide-x divide-cocoa/8 rounded-2xl bg-cream/70 py-2.5 text-center">
        {stats.map((stat) => (
          <div key={stat.label} className="px-1">
            <dd className="font-serif text-xl leading-none font-medium text-cocoa lining-nums">{stat.value}</dd>
            <dt className="mt-1 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-cocoa/45">
              {stat.label}
              {stat.hint && <span className="text-passora-gold-deep"> {stat.hint}</span>}
            </dt>
          </div>
        ))}
      </dl>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => openDialog("owner", event)}
          className={classNames(
            "flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs transition-colors",
            owner ? "text-cocoa/60 hover:bg-cocoa/5 hover:text-cocoa" : "bg-rust/8 text-rust hover:bg-rust/12",
          )}
          title="Compte propriétaire"
        >
          <Icon name="users" className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{owner?.email || (event.owner_id ? "Compte introuvable" : "Aucun compte")}</span>
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          <IconButton
            icon={copied ? "check" : "copy"}
            label={copied ? "Lien copié" : "Copier le lien de la page"}
            onClick={copyLink}
          />
          <a
            href={`/e/${event.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Voir la page"
            aria-label="Voir la page"
            className="flex h-9 w-9 items-center justify-center rounded-full text-cocoa/50 transition-colors hover:bg-cocoa/8 hover:text-cocoa"
          >
            <Icon name="external-link" className="h-4 w-4" />
          </a>
          <IconButton icon="trash" label="Supprimer l'événement" variant="danger" onClick={() => openDialog("delete-event", event)} />
          <Link
            href={`/admin/${event.slug}`}
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-passora-gold px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-passora-ink transition-colors hover:bg-passora-gold-deep"
          >
            Gérer
            <Icon name="chevron-right" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
