"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Icon from "@/components/ui/Icons";
import { LAYOUT_TEMPLATES } from "@/lib/layouts";
import { eventInitials, eventTitle, eventTypeOf, hasTemplate } from "@/lib/event-types";
import { classNames, formatDateFr, normalizeName } from "@/lib/utils";
import { Button, IconAction, Message, PageHeader, SearchField, Segmented, Tag } from "@/components/admin/agency/kit";
import { countdownLabel, percent } from "@/components/admin/agency/shared";

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
 * clés, et actions (gérer, voir, copier le lien, compte client, supprimer).
 */
export default function EventsPanel({ data, usersById, openDialog, filter, onFilterChange }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = normalizeName(query);
    const list = data.events.filter((event) => {
      if (!matchesFilter(event, filter)) return false;
      if (!q) return true;
      const owner = usersById.get(event.owner_id)?.email || "";
      return normalizeName(`${eventTitle(event)} ${event.slug} ${owner}`).includes(q);
    });
    // Passés : du plus récent au plus ancien ; sinon, du plus proche au plus lointain.
    return filter === "past" ? [...list].reverse() : list;
  }, [data.events, usersById, filter, query]);

  const options = FILTERS.map((item) => ({
    ...item,
    count: data.events.filter((event) => matchesFilter(event, item.key)).length,
  }));
  const demoCount = options.find((item) => item.key === "demo").count;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Supervision"
        title="Événements"
        text={`${data.events.length} au total, dont ${demoCount} démo${demoCount > 1 ? "s" : ""} de la vitrine.`}
        actions={
          <Button icon="plus" onClick={() => openDialog("create-event")}>
            Nouvel événement
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchField value={query} onChange={setQuery} placeholder="Couple, lien ou email…" className="sm:max-w-sm sm:flex-1" />
        <Segmented options={options} value={filter} onChange={onFilterChange} className="sm:ml-auto" />
      </div>

      {data.eventsError && <Message tone="error">Chargement incomplet : {data.eventsError}</Message>}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-passora-ink/20 py-14 text-center text-sm text-passora-ink/50">
          {query ? "Aucun événement ne correspond à cette recherche." : "Aucun événement dans cette catégorie."}
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {visible.map((event) => (
            <EventCard key={event.id} event={event} owner={usersById.get(event.owner_id)} openDialog={openDialog} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatusTag({ event }) {
  if (event.isDemo) return <Tag tone="dark">Démo</Tag>;
  if (event.status === "past") return <Tag>Passé</Tag>;
  if (event.status === "undated") return <Tag>Sans date</Tag>;
  if (event.daysLeft === 0) return <Tag tone="success">Jour J</Tag>;
  return <Tag tone="gold">{countdownLabel(event)}</Tag>;
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
    { label: "Réponses", value: event.guests ? `${percent(event.rsvp, event.guests)} %` : event.rsvp },
    { label: "Entrées", value: event.checked },
    { label: "Photos", value: event.photos },
  ];

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-passora-ink/10 bg-white">
      <div className="flex items-start gap-4 p-5">
        <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-passora-gold font-serif text-base italic">
          {event.hero_image_url ? (
            <Image src={event.hero_image_url} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            eventInitials(event)
          )}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 font-serif text-xl leading-tight font-medium">{eventTitle(event)}</h2>
            <StatusTag event={event} />
          </div>
          <p className="mt-1 text-xs text-passora-ink/55">
            <span className="capitalize">{event.wedding_date ? formatDateFr(event.wedding_date) : "Date à définir"}</span>
            {event.wedding_date && !event.date_confirmed && " (à confirmer)"}
          </p>
          <p className="mt-0.5 truncate text-xs text-passora-ink/40">
            {eventTypeOf(event).label} · {hasTemplate(event) ? layoutName(event.layout_template) : "page en préparation"} · /e/
            {event.slug}
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-4 gap-px border-y border-passora-ink/10 bg-passora-ink/10">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-cream/60 px-2 py-3 text-center">
            <dd className="font-serif text-xl leading-none font-medium lining-nums">{stat.value}</dd>
            <dt className="mt-1.5 text-[0.58rem] font-medium tracking-[0.14em] text-passora-ink/45 uppercase">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => openDialog("owner", event)}
          title="Compte client"
          className={classNames(
            "flex min-w-0 max-w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs transition-colors",
            owner ? "text-passora-ink/60 hover:bg-passora-ink/5 hover:text-passora-ink" : "bg-rust/8 text-rust hover:bg-rust/12",
          )}
        >
          <Icon name="users" className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{owner?.email || (event.owner_id ? "Compte introuvable" : "Aucun compte client")}</span>
        </button>

        <div className="ml-auto flex items-center gap-0.5">
          <IconAction icon={copied ? "check" : "copy"} label={copied ? "Lien copié" : "Copier le lien de la page"} onClick={copyLink} />
          <IconAction icon="external-link" label="Voir la page" href={`/e/${event.slug}`} external />
          <IconAction icon="trash" label="Supprimer l'événement" danger onClick={() => openDialog("delete-event", event)} />
          <Button href={`/admin/${event.slug}`} variant="dark" className="ml-1 px-3.5 py-2">
            Gérer
            <Icon name="chevron-right" className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </article>
  );
}
