"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icons";
import { Button, Field, Message, Sheet, TextInput } from "@/components/admin/agency/kit";
import { DEFAULT_EVENT_TYPE, EVENT_TYPES, eventTitle, templatesFor } from "@/lib/event-types";
import { classNames, slugify } from "@/lib/utils";
import { agencyApi, credentialsMessage } from "@/components/admin/agency/shared";

/**
 * Fenêtres d'action du tableau de bord agence. `dialog` = { type, payload }
 * (payload : l'événement ou le compte visé). Chaque formulaire vit dans sa
 * fenêtre : il repart de zéro à chaque ouverture.
 */
export default function AgencyDialogs({ dialog, onClose, supabase, users, onChanged }) {
  const type = dialog?.type;
  const target = dialog?.payload;
  const props = { supabase, onClose, onChanged };

  return (
    <>
      <Sheet
        open={type === "create-event"}
        title="Nouvel événement"
        description="Le reste se complète ensuite dans l'espace de l'événement."
        onClose={onClose}
      >
        <CreateEventForm users={users} {...props} />
      </Sheet>

      <Sheet
        open={type === "create-account"}
        title="Nouveau compte"
        description="Un mot de passe temporaire est généré, à transmettre à la personne."
        onClose={onClose}
      >
        <CreateAccountForm {...props} />
      </Sheet>

      <Sheet open={type === "owner"} title="Compte propriétaire" description={target && eventTitle(target)} onClose={onClose}>
        <OwnerForm event={target} users={users} {...props} />
      </Sheet>

      <Sheet open={type === "delete-event"} title="Supprimer l'événement" description={target && eventTitle(target)} onClose={onClose}>
        <DeleteEventForm event={target} {...props} />
      </Sheet>

      <Sheet open={type === "reset-password"} title="Nouveau mot de passe" description={target?.email} onClose={onClose}>
        <ResetPasswordForm user={target} {...props} />
      </Sheet>

      <Sheet
        open={type === "role"}
        title={target?.role === "agency" ? "Retirer l'accès agence" : "Donner l'accès agence"}
        description={target?.email}
        onClose={onClose}
      >
        <RoleForm user={target} {...props} />
      </Sheet>

      <Sheet open={type === "delete-account"} title="Supprimer le compte" description={target?.email} onClose={onClose}>
        <DeleteAccountForm user={target} {...props} />
      </Sheet>
    </>
  );
}

/** Exécute une action serveur avec état "en cours" et message d'erreur. */
function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const run = async (action) => {
    setBusy(true);
    setError(null);
    try {
      return await action();
    } catch (err) {
      setError(err.message);
      return undefined;
    } finally {
      setBusy(false);
    }
  };
  return { busy, error, run };
}

/** Identifiants affichés une seule fois, à copier ou partager (WhatsApp…). */
function Credentials({ email, password }) {
  const [copied, setCopied] = useState(false);
  const message = credentialsMessage(email, password);
  const canShare = typeof navigator !== "undefined" && Boolean(navigator.share);

  const copy = () =>
    navigator.clipboard.writeText(message).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-passora-gold bg-passora-gold/10 p-4">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-passora-ink/55">
          Identifiants, affichés une seule fois
        </p>
        <p className="mt-2 text-sm break-all text-passora-ink/75">{email}</p>
        <p className="mt-1 font-mono text-lg tracking-wide break-all text-passora-ink select-all">{password}</p>
      </div>
      <div className={classNames("grid gap-2", canShare && "grid-cols-2")}>
        <Button variant="outline" icon={copied ? "check" : "copy"} onClick={copy} className="justify-center">
          {copied ? "Message copié" : "Copier le message"}
        </Button>
        {canShare && (
          <Button
            variant="outline"
            icon="share"
            onClick={() => navigator.share({ text: message }).catch(() => {})}
            className="justify-center"
          >
            Partager
          </Button>
        )}
      </div>
    </div>
  );
}

function Actions({ children }) {
  return <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">{children}</div>;
}

/** Suggestions d'emails parmi les comptes existants. */
function AccountSuggestions({ id, users }) {
  return (
    <datalist id={id}>
      {users.map((u) => (
        <option key={u.id} value={u.email} />
      ))}
    </datalist>
  );
}

/** Bouton de choix exclusif (type, mise en page, rôle). */
function Choice({ selected, onSelect, icon, title, text }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={classNames(
        "flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors",
        selected ? "border-passora-ink bg-white" : "border-passora-ink/15 hover:border-passora-ink/40",
      )}
    >
      {icon && (
        <Icon
          name={icon}
          className={classNames("mt-0.5 h-4 w-4 shrink-0", selected ? "text-passora-gold-deep" : "text-passora-ink/40")}
        />
      )}
      <span className="min-w-0">
        <span className={classNames("block text-sm", selected ? "font-medium text-passora-ink" : "text-passora-ink/70")}>
          {title}
        </span>
        {text && <span className="block text-xs text-passora-ink/50">{text}</span>}
      </span>
    </button>
  );
}

function CreateEventForm({ supabase, users, onClose, onChanged }) {
  const [typeId, setTypeId] = useState(DEFAULT_EVENT_TYPE);
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [title, setTitle] = useState("");
  const [slugOverride, setSlugOverride] = useState(null);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [layout, setLayout] = useState(null);
  const [created, setCreated] = useState(null);
  const { busy, error, run } = useAction();

  const type = EVENT_TYPES.find((t) => t.id === typeId);
  const templates = templatesFor(typeId);
  const selectedLayout = templates.some((t) => t.id === layout) ? layout : templates[0]?.id;
  const slug = slugOverride ?? slugify(type.couple ? `${brideName} ${groomName}` : title);

  const submit = (e) => {
    e.preventDefault();
    run(async () => {
      const result = await agencyApi(supabase, "/api/admin/create-event", {
        method: "POST",
        body: {
          eventType: typeId,
          brideName,
          groomName,
          title,
          slug: slugify(slug),
          ownerEmail,
          layoutTemplate: selectedLayout,
        },
      });
      setCreated({ ...result, ownerEmail: ownerEmail.trim().toLowerCase() });
      onChanged();
    });
  };

  if (created) {
    return (
      <div className="space-y-4">
        <Message tone="success">
          Événement créé : /e/{created.slug}
          {created.existingAccount && ". Le client se connecte avec son compte habituel."}
        </Message>
        {created.tempPassword && <Credentials email={created.ownerEmail} password={created.tempPassword} />}
        <Actions>
          <Button variant="outline" onClick={onClose} className="justify-center">
            Fermer
          </Button>
          <Button href={`/admin/${created.slug}`} icon="chevron-right">
            Ouvrir l&apos;événement
          </Button>
        </Actions>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Type d'événement">
        <div className="grid grid-cols-2 gap-2">
          {EVENT_TYPES.map((option) => (
            <Choice
              key={option.id}
              selected={typeId === option.id}
              onSelect={() => setTypeId(option.id)}
              icon={option.icon}
              title={option.label}
            />
          ))}
        </div>
      </Field>

      {type.couple ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prénom de la mariée">
            <TextInput value={brideName} onChange={(e) => setBrideName(e.target.value)} required />
          </Field>
          <Field label="Prénom du marié">
            <TextInput value={groomName} onChange={(e) => setGroomName(e.target.value)} required />
          </Field>
        </div>
      ) : (
        <Field label="Nom de l'événement">
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`Ex. ${type.label} de …`}
            required
          />
        </Field>
      )}

      <Field label="Lien de la page" hint={`/e/${slugify(slug) || "…"}`}>
        <TextInput value={slug} onChange={(e) => setSlugOverride(e.target.value)} required />
      </Field>
      <Field label="Email du client" hint="Un compte est créé s'il n'existe pas encore.">
        <TextInput
          type="email"
          list="create-event-accounts"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          required
        />
        <AccountSuggestions id="create-event-accounts" users={users} />
      </Field>

      {templates.length > 0 ? (
        <Field label="Mise en page">
          <div className="grid grid-cols-2 gap-2">
            {templates.map((template) => (
              <Choice
                key={template.id}
                selected={selectedLayout === template.id}
                onSelect={() => setLayout(template.id)}
                title={template.name}
              />
            ))}
          </div>
        </Field>
      ) : (
        <p className="rounded-md border border-passora-ink/10 bg-white px-4 py-3 text-xs leading-relaxed text-passora-ink/60">
          Pas encore de modèle de page pour ce type : l&apos;événement se gère déjà (invités, billets,
          scanner) et sa page publique indique qu&apos;elle est en préparation.
        </p>
      )}

      {error && <Message tone="error">{error}</Message>}
      <Actions>
        <Button variant="outline" onClick={onClose} className="justify-center">
          Annuler
        </Button>
        <Button type="submit" icon="check" busy={busy} className="justify-center">
          Créer l&apos;événement
        </Button>
      </Actions>
    </form>
  );
}

function CreateAccountForm({ supabase, onClose, onChanged }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("couple");
  const [created, setCreated] = useState(null);
  const { busy, error, run } = useAction();

  const submit = (e) => {
    e.preventDefault();
    run(async () => {
      setCreated(await agencyApi(supabase, "/api/admin/users", { method: "POST", body: { email, role } }));
      onChanged();
    });
  };

  if (created) {
    return (
      <div className="space-y-4">
        <Credentials email={created.email} password={created.tempPassword} />
        <Actions>
          <Button onClick={onClose} className="justify-center">
            Terminé
          </Button>
        </Actions>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Adresse email">
        <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </Field>
      <Field label="Rôle">
        <div className="grid grid-cols-2 gap-2">
          <Choice selected={role === "couple"} onSelect={() => setRole("couple")} title="Client" text="Gère ses événements" />
          <Choice selected={role === "agency"} onSelect={() => setRole("agency")} title="Agence" text="Accès complet" />
        </div>
      </Field>
      {error && <Message tone="error">{error}</Message>}
      <Actions>
        <Button variant="outline" onClick={onClose} className="justify-center">
          Annuler
        </Button>
        <Button type="submit" icon="check" busy={busy} className="justify-center">
          Créer le compte
        </Button>
      </Actions>
    </form>
  );
}

function OwnerForm({ supabase, event, users, onClose, onChanged }) {
  const currentOwner = users.find((u) => u.id === event.owner_id);
  const [email, setEmail] = useState(currentOwner?.email || "");
  const [created, setCreated] = useState(null);
  const { busy, error, run } = useAction();

  const save = (ownerEmail) =>
    run(async () => {
      const result = await agencyApi(supabase, `/api/admin/events/${event.id}`, {
        method: "PATCH",
        body: { ownerEmail },
      });
      onChanged();
      if (result.tempPassword) setCreated({ email: ownerEmail.trim().toLowerCase(), password: result.tempPassword });
      else onClose();
    });

  if (created) {
    return (
      <div className="space-y-4">
        <Message tone="success">Nouveau compte créé et associé à l&apos;événement.</Message>
        <Credentials email={created.email} password={created.password} />
        <Actions>
          <Button onClick={onClose} className="justify-center">
            Terminé
          </Button>
        </Actions>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save(email);
      }}
      className="space-y-4"
    >
      <p className="text-sm text-passora-ink/65">
        {currentOwner
          ? `Actuellement géré par ${currentOwner.email}.`
          : "Aucun compte ne gère cet événement : seule l'agence y a accès."}
      </p>
      <Field label="Email du compte" hint="Choisissez un compte existant, ou saisissez un nouvel email pour en créer un.">
        <TextInput type="email" list="owner-accounts" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <AccountSuggestions id="owner-accounts" users={users} />
      </Field>
      {error && <Message tone="error">{error}</Message>}
      <Actions>
        {currentOwner && (
          <Button variant="danger-outline" onClick={() => save("")} disabled={busy} className="justify-center sm:mr-auto">
            Retirer le compte
          </Button>
        )}
        <Button variant="outline" onClick={onClose} className="justify-center">
          Annuler
        </Button>
        <Button type="submit" icon="check" busy={busy} className="justify-center">
          Enregistrer
        </Button>
      </Actions>
    </form>
  );
}

function DeleteEventForm({ supabase, event, onClose, onChanged }) {
  const [confirmation, setConfirmation] = useState("");
  const { busy, error, run } = useAction();

  const remove = (e) => {
    e.preventDefault();
    run(async () => {
      await agencyApi(supabase, `/api/admin/events/${event.id}`, { method: "DELETE" });
      onChanged();
      onClose();
    });
  };

  return (
    <form onSubmit={remove} className="space-y-4">
      <div className="rounded-md border-l-2 border-rust bg-rust/8 p-4 text-sm text-rust">
        <p className="flex items-center gap-2 font-medium">
          <Icon name="alert" className="h-4 w-4" />
          Suppression définitive
        </p>
        <p className="mt-1.5">
          La page /e/{event.slug} disparaît avec {event.guests} invité(s), {event.rsvp} réponse(s),{" "}
          {event.photos} photo(s) de galerie et tous ses fichiers.
        </p>
      </div>
      <Field label={`Tapez « ${event.slug} » pour confirmer`}>
        <TextInput value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="off" />
      </Field>
      {error && <Message tone="error">{error}</Message>}
      <Actions>
        <Button variant="outline" onClick={onClose} className="justify-center">
          Annuler
        </Button>
        <Button
          type="submit"
          icon="trash"
          variant="destructive"
          busy={busy}
          disabled={confirmation.trim().toLowerCase() !== event.slug}
          className="justify-center"
        >
          Supprimer
        </Button>
      </Actions>
    </form>
  );
}

function ResetPasswordForm({ supabase, user, onClose }) {
  const [password, setPassword] = useState(null);
  const { busy, error, run } = useAction();

  const reset = () =>
    run(async () => {
      const result = await agencyApi(supabase, `/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: { action: "reset-password" },
      });
      setPassword(result.tempPassword);
    });

  if (password) {
    return (
      <div className="space-y-4">
        <Credentials email={user.email} password={password} />
        <Actions>
          <Button onClick={onClose} className="justify-center">
            Terminé
          </Button>
        </Actions>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-passora-ink/65">
        Un mot de passe temporaire remplace l&apos;actuel, qui ne fonctionnera plus. À utiliser quand la
        personne a perdu ses accès.
      </p>
      {error && <Message tone="error">{error}</Message>}
      <Actions>
        <Button variant="outline" onClick={onClose} className="justify-center">
          Annuler
        </Button>
        <Button icon="key" busy={busy} onClick={reset} className="justify-center">
          Générer
        </Button>
      </Actions>
    </div>
  );
}

function RoleForm({ supabase, user, onClose, onChanged }) {
  const toAgency = user.role !== "agency";
  const { busy, error, run } = useAction();

  const apply = () =>
    run(async () => {
      await agencyApi(supabase, `/api/admin/users/${user.id}`, {
        method: "PATCH",
        body: { action: "set-role", role: toAgency ? "agency" : "couple" },
      });
      onChanged();
      onClose();
    });

  return (
    <div className="space-y-4">
      <p className="text-sm text-passora-ink/65">
        {toAgency
          ? "Ce compte pourra voir et gérer tous les événements, tous les comptes et la plateforme."
          : "Ce compte ne pourra plus gérer que les événements qui lui sont confiés."}{" "}
        Le changement s&apos;applique à sa prochaine connexion.
      </p>
      {error && <Message tone="error">{error}</Message>}
      <Actions>
        <Button variant="outline" onClick={onClose} className="justify-center">
          Annuler
        </Button>
        <Button icon="shield" busy={busy} onClick={apply} className="justify-center">
          {toAgency ? "Donner l'accès agence" : "Retirer l'accès agence"}
        </Button>
      </Actions>
    </div>
  );
}

function DeleteAccountForm({ supabase, user, onClose, onChanged }) {
  const { busy, error, run } = useAction();

  const remove = () =>
    run(async () => {
      await agencyApi(supabase, `/api/admin/users/${user.id}`, { method: "DELETE" });
      onChanged();
      onClose();
    });

  return (
    <div className="space-y-4">
      <p className="text-sm text-passora-ink/65">
        La personne ne pourra plus se connecter.
        {user.events.length > 0 &&
          ` Ses événements (${user.events.map(eventTitle).join(", ")}) restent en ligne, sans compte propriétaire.`}
      </p>
      {error && <Message tone="error">{error}</Message>}
      <Actions>
        <Button variant="outline" onClick={onClose} className="justify-center">
          Annuler
        </Button>
        <Button variant="destructive" icon="trash" busy={busy} onClick={remove} className="justify-center">
          Supprimer le compte
        </Button>
      </Actions>
    </div>
  );
}
