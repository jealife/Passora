# Mariage Myrna & Jaël 💍

Page web premium de mariage, accessible par QR Code : informations sur
l'événement, compte à rebours, notre histoire en audio, galerie, programme,
lieux avec cartes, dress code terracotta et confirmation de présence (RSVP)
vérifiée sur la liste des invités.

**Stack** : Next.js (App Router) · React (JavaScript / JSX) · Tailwind CSS · Supabase

## Démarrage rapide (mode démo, sans Supabase)

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000 — le site fonctionne immédiatement avec le
contenu par défaut (`src/lib/content.js`). Le formulaire RSVP simule alors
les confirmations (en développement uniquement).

## Brancher Supabase (contenu administrable + RSVP réels)

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans **SQL Editor**, exécutez l'intégralité de [`supabase/schema.sql`](supabase/schema.sql)
   (tables, sécurité RLS, bucket de stockage `wedding`, événement initial).
3. Copiez `.env.local.example` vers `.env.local` et renseignez les clés
   (**Project Settings → API**) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` *(serveur uniquement — ne jamais l'exposer)*
4. Créez le compte administrateur : **Authentication → Users → Add user**
   (email + mot de passe, cochez « Auto confirm »).
5. Relancez `npm run dev`.

## Administration

Rendez-vous sur **`/admin`** et connectez-vous avec le compte créé à l'étape 4 :

| Onglet | Contenu administrable |
| --- | --- |
| Informations | Noms des mariés, accroche, **date & heure** (+ statut « à confirmer »), photo du hero (téléversement), texte et audio « Notre histoire », dress code, message de fin |
| Programme | Moments de la journée (section, heure, intitulé, icône, ordre) |
| Lieux | Nom, adresse, lien Google Maps et carte intégrée |
| Galerie | Téléversement des photos, légendes, ordre, suppression |
| Invités | Liste des invités : ajout, **import en masse** (un nom par ligne), recherche |
| Confirmations | Invités ayant confirmé, messages aux mariés, export CSV |

Toute modification est enregistrée dans Supabase et **visible immédiatement**
sur la page (rendu dynamique).

### Sécurité

- Contenu public en lecture seule (RLS) ; toute écriture exige un compte authentifié.
- La liste des invités et les RSVP ne sont **jamais** exposés au navigateur :
  la vérification du nom passe par `/api/rsvp` (clé service role, côté serveur).

## Architecture (pensée multi-événements)

```
src/
├── app/
│   ├── page.jsx                # Accueil = événement par défaut
│   ├── e/[slug]/page.jsx       # Autres événements par slug (évolutivité)
│   ├── admin/page.jsx          # Interface d'administration
│   └── api/rsvp/route.js       # Vérification invité + enregistrement RSVP
├── components/
│   ├── WeddingPage.jsx         # Assemble les sections d'un événement
│   ├── sections/               # Hero, Countdown, Story, Gallery, Program,
│   │                           # Venues, DressCode, Rsvp, Footer
│   ├── layout/Navbar.jsx
│   ├── admin/                  # Écrans d'administration
│   └── ui/                     # Composants réutilisables (Button, Icons…)
└── lib/
    ├── supabase/               # Clients navigateur / serveur / service role
    ├── data.js                 # Chargement d'un événement (+ repli hors-ligne)
    ├── content.js              # Contenu par défaut
    └── utils.js                # normalisation des noms, formats de dates
```

Toutes les tables sont rattachées à `events.event_id` : pour héberger un
nouvel événement, insérez une ligne dans `events` et partagez `/e/son-slug`.

## Déploiement & QR Code

1. Déployez sur [Vercel](https://vercel.com) (import du repo, ajoutez les 3
   variables d'environnement, build automatique).
2. Générez le QR Code vers l'URL de production (ex. `https://votre-domaine.com`)
   et intégrez-le à l'invitation PDF.

## À personnaliser

- **Date du mariage** : provisoire (12/09/2026) — à définir dans l'admin, puis
  cocher « Date confirmée ».
- **Photo des mariés** : à téléverser dans l'admin (onglet Informations) ;
  en attendant, le hero affiche un décor graphique terracotta.
- **Galerie** : des illustrations décoratives s'affichent tant qu'aucune photo
  n'a été téléversée.
- L'audio « Notre histoire » est dans `public/audio/notre-histoire.mp3`
  (converti depuis votre fichier `.opus` pour compatibilité iPhone/Safari).
