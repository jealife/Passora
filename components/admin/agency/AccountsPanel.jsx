"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icons";
import { AdminButton, Badge, IconButton, Input, Notice } from "@/components/admin/ui";
import { classNames, normalizeName } from "@/lib/utils";
import { coupleName, relativeTime } from "@/components/admin/agency/shared";

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
      normalizeName(`${user.email} ${user.events.map(coupleName).join(" ")}`).includes(q),
    );
  }, [data.users, query]);

  const agencyCount = data.users.filter((user) => user.role === "agency").length;
  const neverSignedIn = data.users.filter((user) => !user.lastSignInAt).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-medium text-cocoa">Comptes</h1>
          <p className="mt-1 text-sm font-light text-cocoa/55">
            {data.users.length} compte{data.users.length > 1 ? "s" : ""} · {agencyCount} agence ·{" "}
            {data.users.length - agencyCount} couple{data.users.length - agencyCount > 1 ? "s" : ""}
            {neverSignedIn > 0 && ` · ${neverSignedIn} jamais connecté${neverSignedIn > 1 ? "s" : ""}`}
          </p>
        </div>
        <AdminButton icon="plus" onClick={() => openDialog("create-account")}>
          Nouveau compte
        </AdminButton>
      </div>

      <div className="relative sm:max-w-sm">
        <Icon name="search" className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-cocoa/35" />
        <Input
          type="search"
          placeholder="Email ou couple…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {data.usersError && <Notice tone="error">Comptes indisponibles : {data.usersError}</Notice>}

      <ul className="divide-y divide-cocoa/6 overflow-hidden rounded-3xl border border-cocoa/8 bg-white shadow-sm">
        {visible.map((user) => (
          <AccountRow
            key={user.id}
            user={user}
            isSelf={user.id === session.user.id}
            now={data.now}
            openDialog={openDialog}
          />
        ))}
        {visible.length === 0 && (
          <li className="py-12 text-center text-sm font-light text-cocoa/50">
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
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
      <div className="flex min-w-0 flex-1 items-start gap-3.5">
        <span
          className={classNames(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-lg italic uppercase",
            isAgency ? "bg-passora-ink text-passora-gold" : "bg-passora-gold/20 text-passora-gold-deep",
          )}
          aria-hidden="true"
        >
          {user.email[0]}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 truncate text-sm font-medium text-cocoa">{user.email}</span>
            <Badge tone={isAgency ? "ink" : "neutral"}>{isAgency ? "Agence" : "Couple"}</Badge>
            {isSelf && <Badge tone="gold">Vous</Badge>}
          </p>
          <p className="mt-1 text-xs text-cocoa/50">
            {user.lastSignInAt ? (
              `Dernière connexion ${relativeTime(user.lastSignInAt, now)}`
            ) : (
              <span className="text-rust">Jamais connecté</span>
            )}
            {" · "}
            créé le {new Date(user.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
          </p>
          {user.events.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.events.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/${event.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-cocoa/10 px-2.5 py-1 text-xs text-cocoa/70 transition-colors hover:border-passora-gold/50 hover:text-cocoa"
                >
                  <Icon name="heart" className="h-3 w-3 text-passora-gold-deep" />
                  {coupleName(event)}
                </Link>
              ))}
            </div>
          )}
          {!isAgency && user.events.length === 0 && (
            <p className="mt-1 text-xs font-light text-cocoa/40">Aucun événement confié.</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-0.5 self-end sm:self-center">
        <IconButton icon="key" label="Nouveau mot de passe" onClick={() => openDialog("reset-password", user)} />
        <IconButton
          icon="shield"
          label={isAgency ? "Retirer l'accès agence" : "Donner l'accès agence"}
          onClick={() => openDialog("role", user)}
          disabled={isSelf}
        />
        <IconButton
          icon="trash"
          label="Supprimer le compte"
          variant="danger"
          onClick={() => openDialog("delete-account", user)}
          disabled={isSelf}
        />
      </div>
    </li>
  );
}
