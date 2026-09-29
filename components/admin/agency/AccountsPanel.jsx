"use client";

import { eventTitle } from "@/lib/event-types";
import { useMemo, useState } from "react";
import Link from "next/link";
import { normalizeName } from "@/lib/utils";
import { Button, IconAction, Message, PageHeader, SearchField, Tag } from "@/components/admin/agency/kit";
import { relativeTime } from "@/components/admin/agency/shared";

/**
 * Comptes de connexion (Supabase Auth) : rôle, événements confiés, dernière
 * connexion ; création, nouveau mot de passe, rôle et suppression. Le
 * compte connecté ne peut ni changer son propre rôle ni se supprimer.
 */
export default function AccountsPanel({ data, session, openDialog }) {
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = normalizeName(query);
    if (!q) return data.users;
    return data.users.filter((user) =>
      normalizeName(`${user.email} ${user.events.map(eventTitle).join(" ")}`).includes(q),
    );
  }, [data.users, query]);

  const agencyCount = data.users.filter((user) => user.role === "agency").length;
  const clientCount = data.users.length - agencyCount;
  const neverSignedIn = data.users.filter((user) => !user.lastSignInAt).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Accès"
        title="Comptes"
        text={[
          `${clientCount} client${clientCount > 1 ? "s" : ""}`,
          `${agencyCount} agence`,
          neverSignedIn > 0 && `${neverSignedIn} jamais connecté${neverSignedIn > 1 ? "s" : ""}`,
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <Button icon="plus" onClick={() => openDialog("create-account")}>
            Nouveau compte
          </Button>
        }
      />

      <SearchField value={query} onChange={setQuery} placeholder="Email ou couple…" className="sm:max-w-sm" />

      {data.usersError && <Message tone="error">Comptes indisponibles : {data.usersError}</Message>}

      <ul className="divide-y divide-passora-ink/8 overflow-hidden rounded-lg border border-passora-ink/10 bg-white">
        {visible.map((user) => (
          <AccountRow key={user.id} user={user} isSelf={user.id === session.user.id} now={data.now} openDialog={openDialog} />
        ))}
        {visible.length === 0 && (
          <li className="py-12 text-center text-sm text-passora-ink/50">
            {query ? "Aucun compte ne correspond à cette recherche." : "Aucun compte pour le moment."}
          </li>
        )}
      </ul>
    </div>
  );
}

function AccountRow({ user, isSelf, now, openDialog }) {
  const isAgency = user.role === "agency";
  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <span
          aria-hidden="true"
          className={
            isAgency
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-passora-ink font-serif text-lg text-passora-gold uppercase italic"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-passora-gold font-serif text-lg text-passora-ink uppercase italic"
          }
        >
          {user.email[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 truncate text-sm font-medium">{user.email}</span>
            <Tag tone={isAgency ? "dark" : "neutral"}>{isAgency ? "Agence" : "Client"}</Tag>
            {isSelf && <Tag tone="gold">Vous</Tag>}
          </p>
          <p className="mt-1 text-xs text-passora-ink/50">
            {user.lastSignInAt ? (
              `Dernière connexion ${relativeTime(user.lastSignInAt, now)}`
            ) : (
              <span className="text-rust">Jamais connecté</span>
            )}
            {" · créé le "}
            {new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          {user.events.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/${event.slug}`}
                  className="rounded-sm border border-passora-ink/12 px-2 py-0.5 text-xs text-passora-ink/70 transition-colors hover:border-passora-ink hover:text-passora-ink"
                >
                  {eventTitle(event)}
                </Link>
              ))}
            </div>
          ) : (
            !isAgency && <p className="mt-1 text-xs text-passora-ink/40">Aucun événement confié.</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 self-end sm:self-center">
        <IconAction icon="key" label="Nouveau mot de passe" onClick={() => openDialog("reset-password", user)} />
        <IconAction
          icon="shield"
          label={isAgency ? "Retirer l'accès agence" : "Donner l'accès agence"}
          onClick={() => openDialog("role", user)}
          disabled={isSelf}
        />
        <IconAction
          icon="trash"
          label="Supprimer le compte"
          danger
          onClick={() => openDialog("delete-account", user)}
          disabled={isSelf}
        />
      </div>
    </li>
  );
}
