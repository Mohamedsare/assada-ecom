@AGENTS.md

# CLAUDE.md — Odm’s Shopping

## 1. Identité du projet

**Nom de la plateforme :** Odm’s Shopping
**Type :** Site e-commerce moderne
**Cible principale :** Gabon
**Objectif :** Permettre aux clients d’acheter facilement des chaussures, vêtements, accessoires et produits électroniques, avec une expérience fluide, professionnelle, rapide et fortement orientée conversion.

Odm’s Shopping doit donner l’image d’une boutique en ligne sérieuse, moderne, fiable, premium et adaptée au marché gabonais.

---

## 2. Informations officielles

- **Nom :** Odm’s Shopping
- **Email :** [ryta@gmail.com](mailto:ryta@gmail.com)
- **Téléphone / WhatsApp :** +241 62 57 37 48
- **Pays cible :** Gabon
- **Ville principale :** Libreville
- **Réseaux sociaux :**
  - TikTok
  - Facebook
  - Instagram si nécessaire

- **Devise :** FCFA / XAF
- **Mode de livraison :** Livraison partout au Gabon
- **Moyens de paiement MVP :**
  - Espèces à la livraison
  - Airtel Money
  - Moov Money

- **Paiement en ligne :** prévu pour une version future

---

## 3. Stack technique obligatoire

Utiliser une stack moderne, propre, scalable et maintenable.

### Frontend

- Next.js avec App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- React Hook Form
- Zod
- TanStack Query si nécessaire
- Zustand ou Context API pour le panier
- Responsive design desktop, tablette et mobile

### Backend / Base de données

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security
- Edge Functions si nécessaire

### Authentification

- Connexion email / mot de passe
- Connexion Google
- Gestion session utilisateur
- Rôle utilisateur :
  - `customer`
  - `admin`
  - `super_admin`
  - `delivery_agent` si module livraison réel ajouté plus tard

### Déploiement

- Frontend : Vercel
- Backend : Supabase
- Images : Supabase Storage
- Domaine personnalisé prévu

---

## 4. Direction artistique

Le design doit être **ultra moderne, premium, minimaliste et e-commerce**.

### Couleurs principales

```txt
Bleu nuit principal : #020617
Bleu nuit secondaire : #0F172A
Vert principal : #16A34A
Vert lumineux : #22C55E
Blanc : #FFFFFF
Gris clair : #F8FAFC
Gris bordure : #E5E7EB
Texte sombre : #0F172A
Texte secondaire : #64748B
Rouge erreur / annulation : #EF4444
Orange attente : #F97316
```

### Style UI

- Fond principal clair pour les contenus.
- Header et footer en bleu nuit.
- Accents verts pour les boutons, statuts positifs, badges et CTA.
- Cards arrondies.
- Ombres douces.
- Espacement généreux.
- Images produits propres.
- Interface respirante.
- Pas de surcharge visuelle.
- Expérience premium et professionnelle.

### Typographie

Utiliser une police moderne :

- Inter
- Geist
- Satoshi si disponible
- Sans-serif propre

### Règles visuelles

- Les boutons principaux sont verts.
- Les boutons secondaires sont bleu nuit ou outline.
- Les cards produits doivent être simples, propres, avec image, nom, catégorie, prix, ancien prix barré, badge, note et bouton panier.
- Le site doit être responsive parfaitement.
- Le mobile doit être prioritaire pour l’expérience d’achat.

---

## 5. Navigation officielle

### Menu principal

- Accueil
- Boutique
- Nouveautés
- Promotions
- Suivi commande
- Contact

### Actions à droite

- Recherche
- Panier
- Compte
- WhatsApp

### Version mobile

Dans le menu mobile :

- Accueil
- Boutique
- Nouveautés
- Promotions
- Suivi commande
- Contact
- Compte

Accès rapide mobile :

- Panier
- WhatsApp

---

## 6. Pages publiques à développer

### 6.1 Accueil

Page d’accueil complète du haut vers le bas.

Sections obligatoires :

1. Top bar avec :
   - téléphone
   - email
   - message livraison rapide partout au Gabon
   - icônes réseaux sociaux

2. Header principal avec :
   - logo Odm’s Shopping
   - navigation
   - recherche
   - panier
   - compte
   - bouton WhatsApp

3. Hero section :
   - grand titre orienté Gabon
   - sous-titre clair
   - CTA “Découvrir la boutique”
   - CTA “Voir les promotions”
   - visuel premium avec chaussures, vêtements, téléphone, casque, montre

4. Catégories :
   - Chaussures Homme
   - Chaussures Femme
   - Vêtements Homme
   - Vêtements Femme
   - Accessoires Homme
   - Accessoires Femme
   - Électroniques
   - PC & Accessoires

5. Bannières commerciales :
   - Offre spéciale
   - Nouveautés

6. Avantages :
   - Paiement à la livraison
   - Livraison rapide
   - Support WhatsApp
   - Produits authentiques

7. Derniers produits ajoutés

8. Meilleures promotions

9. Section réseaux sociaux :
   - suivre Odm’s Shopping
   - galerie style Instagram/TikTok

10. Footer complet

---

### 6.2 Boutique

Page catalogue complète.

Fonctionnalités obligatoires :

- Liste de produits
- Filtres à gauche sur desktop
- Filtres en drawer sur mobile
- Recherche produit
- Tri :
  - Popularité
  - Plus récents
  - Prix croissant
  - Prix décroissant
  - Meilleures offres

- Vue grille
- Vue liste si possible
- Pagination

Filtres obligatoires :

- Catégories
- Marques
- Prix
- Couleurs
- Tailles
- Disponibilité
- Promotions

---

### 6.3 Nouveautés

Page dédiée aux nouveaux produits.

Objectif :

- Montrer uniquement les produits récents.
- Mettre en valeur les dernières arrivées.
- Donner un sentiment de fraîcheur et d’exclusivité.

Sections :

- Hero nouveauté
- Catégories rapides
- Filtres
- Produits nouveaux
- CTA “Voir plus de nouveautés”
- Avantages
- Footer

---

### 6.4 Promotions

Page dédiée aux produits en réduction.

Objectif :

- Augmenter la conversion.
- Créer un sentiment d’urgence.
- Mettre en avant les réductions.

Sections :

- Hero promotions avec badges -20%, -30%, -50%
- Catégories de promotions
- Filtres :
  - catégorie
  - marque
  - réduction
  - prix

- Grille produits en promotion
- Badges rouges de réduction
- Ancien prix barré
- Prix actuel en vert
- CTA “Voir plus de promotions”

---

### 6.5 Suivi commande

Page permettant au client de suivre sa commande.

Fonctionnalités :

- Recherche par numéro de commande
- Recherche par email
- Connexion au compte pour voir toutes les commandes
- Affichage statut commande
- Timeline de suivi :
  - Commande confirmée
  - Préparée
  - Expédiée
  - En cours de livraison
  - Livrée

- Estimation de livraison
- Bouton voir sur la carte
- Bloc aide :
  - WhatsApp
  - Support
  - FAQ
  - Signaler un problème

Important :

Le tracking réel en temps réel nécessite un module livreur séparé. Pour le MVP, afficher d’abord un tracking par statut. Prévoir ensuite un tracking carte avec localisation livreur.

---

### 6.6 Contact

Page contact complète.

Sections :

- Hero contact
- Coordonnées :
  - téléphone
  - email
  - adresse
  - WhatsApp
  - réseaux sociaux

- Formulaire :
  - nom complet
  - email
  - sujet
  - message

- Carte de localisation Libreville
- FAQ rapide
- Avantages
- Footer

---

### 6.7 Recherche

Page résultats de recherche.

Fonctionnalités :

- Champ de recherche principal
- Résultats pour le mot-clé
- Nombre de résultats
- Filtres
- Catégories rapides
- Grille produits
- Tri par pertinence
- Pagination
- CTA si aucun résultat :
  - “Voir toute la boutique”
  - “Contacter WhatsApp”

---

### 6.8 Panier

Page panier complète.

Sections :

- Liste articles
- Image produit
- Nom produit
- Catégorie
- Taille
- Couleur
- Quantité
- Prix unitaire
- Total ligne
- Suppression article
- Vider panier
- Code promo
- Récapitulatif commande :
  - sous-total
  - livraison
  - réduction
  - total

- CTA “Passer la commande”
- CTA “Continuer mes achats”
- Avantages :
  - paiement sécurisé
  - livraison rapide
  - satisfait ou remboursé
  - support 7j/7

---

### 6.9 Validation de commande

Page affichée après confirmation.

Sections :

- Message “Commande validée”
- Numéro commande
- Email de confirmation
- Date de livraison estimée
- Mode de paiement
- Timeline de suivi
- Récapitulatif commande
- Articles commandés
- CTA :
  - Suivre ma commande
  - Voir le détail de ma commande
  - Retourner à la boutique

- Bloc aide :
  - WhatsApp
  - Support
  - FAQ
  - Email

---

## 7. Pages compte utilisateur

### 7.1 Connexion

- Connexion email / mot de passe
- Connexion Google
- Lien mot de passe oublié
- Lien création de compte

### 7.2 Inscription

Champs :

- nom
- prénom
- téléphone
- email
- mot de passe
- confirmation mot de passe

### 7.3 Mon compte

Dashboard utilisateur.

Sections :

- Informations utilisateur
- Nombre de commandes
- Commandes en cours
- Commandes livrées
- Favoris
- Dernières commandes
- Adresses
- Informations personnelles
- Moyens de paiement
- Déconnexion

### 7.4 Mes commandes

- Liste des commandes
- Statut
- Date
- Total
- Bouton détail
- Bouton suivi

### 7.5 Détail commande

- Informations commande
- Articles
- Adresse livraison
- Paiement
- Statut
- Timeline
- Support

### 7.6 Mes adresses

Champs adresse :

- nom destinataire
- téléphone WhatsApp
- ville
- quartier
- adresse détaillée
- repère
- latitude
- longitude
- adresse par défaut

### 7.7 Mes favoris

- Liste produits favoris
- Ajouter au panier
- Retirer des favoris

### 7.8 Informations personnelles

- Modifier nom
- Modifier prénom
- Modifier téléphone
- Modifier email
- Modifier mot de passe

---

## 8. Checkout / passage de commande

Le checkout doit être simple et rassurant.

Étapes :

1. Informations client
2. Adresse de livraison
3. Méthode de paiement
4. Récapitulatif
5. Validation finale

Méthodes de paiement :

- Espèces à la livraison
- Airtel Money
- Moov Money

Champs obligatoires :

- nom complet
- téléphone WhatsApp
- ville
- quartier
- adresse détaillée
- moyen de paiement
- commentaire optionnel

Après validation :

- créer commande
- créer order_items
- vider panier
- afficher page validation
- envoyer notification email si possible
- préparer future notification WhatsApp

---

## 9. Backoffice admin

Créer un backoffice moderne, décisionnel, bleu nuit, vert et blanc.

### 9.1 Dashboard admin

Objectif : permettre à l’admin de prendre des décisions rapidement.

KPI obligatoires :

- Ventes totales
- Commandes totales
- Commandes en attente
- Commandes livrées
- Commandes annulées
- Clients actifs
- Panier moyen
- Taux de conversion
- Taux de livraison
- Nouveaux clients
- Produits en stock faible

Graphiques :

- évolution des ventes
- répartition des statuts de commande
- meilleures catégories
- top produits
- ventes par période

Widgets :

- commandes récentes
- alertes stock faible
- suivi livraison
- produits les plus vendus
- clients récents
- raccourcis admin

---

### 9.2 Gestion produits

Fonctionnalités :

- liste produits
- ajouter produit
- modifier produit
- supprimer ou désactiver produit
- upload multi-images
- catégorie
- marque
- description
- prix actuel
- ancien prix barré
- stock
- couleurs
- tailles
- variants
- produit vedette
- nouveauté
- promotion
- statut :
  - actif
  - brouillon
  - rupture
  - masqué

---

### 9.3 Gestion catégories

Champs :

- nom
- slug
- image
- description
- parent_id pour sous-catégorie
- statut actif/inactif
- ordre d’affichage

Catégories initiales :

- Chaussures Homme
- Chaussures Femme
- Vêtements Homme
- Vêtements Femme
- Accessoires Homme
- Accessoires Femme
- Électroniques
- Accessoires Téléphone
- PC & Accessoires

---

### 9.4 Gestion marques

Champs :

- nom
- slug
- logo
- description
- statut

Exemples :

- Nike
- Adidas
- Apple
- Samsung
- HP
- Lenovo
- JBL
- Oraimo
- Tecno
- Infinix

---

### 9.5 Gestion commandes

Fonctionnalités :

- liste commandes
- détail commande
- changement statut
- filtre par statut
- filtre par date
- filtre par moyen de paiement
- recherche numéro commande
- contact WhatsApp client
- impression reçu/facture si possible

Statuts commande :

- pending
- confirmed
- preparing
- shipped
- out_for_delivery
- delivered
- cancelled
- returned

Labels français :

- En attente
- Confirmée
- En préparation
- Expédiée
- En cours de livraison
- Livrée
- Annulée
- Retournée

---

### 9.6 Gestion utilisateurs

- liste clients
- détail client
- commandes client
- adresses client
- bloquer/débloquer client
- historique achat

---

### 9.7 Gestion livraisons

Pour MVP :

- statut livraison
- estimation livraison
- adresse client
- bouton WhatsApp client
- statut livré/non livré

Pour version avancée :

- assignation livreur
- position livreur
- carte
- distance boutique/client
- tracking temps réel

---

### 9.8 Gestion paiements

- méthode paiement
- statut paiement
- référence paiement
- montant
- commande liée

Statuts paiement :

- pending
- paid
- failed
- refunded
- cash_on_delivery

---

### 9.9 Paramètres boutique

Champs :

- nom boutique
- logo
- email
- téléphone
- WhatsApp
- adresse
- ville
- pays
- latitude boutique
- longitude boutique
- Facebook
- TikTok
- Instagram
- message WhatsApp par défaut
- frais livraison
- livraison gratuite à partir de
- devise
- SEO global

---

## 10. Modèle de données Supabase recommandé

Créer les tables suivantes :

```sql
profiles
addresses
categories
brands
products
product_images
product_variants
carts
cart_items
orders
order_items
payments
order_tracking
wishlist_items
reviews
coupons
settings
admin_users
delivery_agents
```

---

## 11. Tables principales

### profiles

```sql
id uuid primary key references auth.users(id) on delete cascade,
first_name text,
last_name text,
phone text,
email text,
avatar_url text,
role text default 'customer',
is_active boolean default true,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

### addresses

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id) on delete cascade,
full_name text not null,
phone text not null,
city text not null,
district text not null,
address_details text,
landmark text,
latitude numeric,
longitude numeric,
is_default boolean default false,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

### categories

```sql
id uuid primary key default gen_random_uuid(),
name text not null,
slug text unique not null,
description text,
image_url text,
parent_id uuid references categories(id),
is_active boolean default true,
sort_order int default 0,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

### brands

```sql
id uuid primary key default gen_random_uuid(),
name text not null,
slug text unique not null,
logo_url text,
description text,
is_active boolean default true,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

### products

```sql
id uuid primary key default gen_random_uuid(),
category_id uuid references categories(id),
brand_id uuid references brands(id),
name text not null,
slug text unique not null,
description text,
short_description text,
current_price numeric not null,
old_price numeric,
stock_quantity int default 0,
sku text,
main_image_url text,
is_featured boolean default false,
is_new boolean default false,
is_promo boolean default false,
status text default 'active',
seo_title text,
seo_description text,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

### product_images

```sql
id uuid primary key default gen_random_uuid(),
product_id uuid references products(id) on delete cascade,
image_url text not null,
alt_text text,
sort_order int default 0,
created_at timestamp with time zone default now()
```

### product_variants

```sql
id uuid primary key default gen_random_uuid(),
product_id uuid references products(id) on delete cascade,
color text,
size text,
stock_quantity int default 0,
price_adjustment numeric default 0,
created_at timestamp with time zone default now()
```

### carts

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id) on delete cascade,
session_id text,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

### cart_items

```sql
id uuid primary key default gen_random_uuid(),
cart_id uuid references carts(id) on delete cascade,
product_id uuid references products(id),
variant_id uuid references product_variants(id),
quantity int not null default 1,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

### orders

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id),
order_number text unique not null,
customer_name text not null,
customer_email text,
customer_phone text not null,
delivery_city text not null,
delivery_district text not null,
delivery_address_details text,
delivery_landmark text,
delivery_latitude numeric,
delivery_longitude numeric,
payment_method text not null,
payment_status text default 'pending',
order_status text default 'pending',
subtotal numeric not null,
delivery_fee numeric default 0,
discount_amount numeric default 0,
total_amount numeric not null,
customer_note text,
admin_note text,
estimated_delivery_date date,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

### order_items

```sql
id uuid primary key default gen_random_uuid(),
order_id uuid references orders(id) on delete cascade,
product_id uuid references products(id),
variant_id uuid references product_variants(id),
product_name text not null,
product_image_url text,
color text,
size text,
unit_price numeric not null,
quantity int not null,
total_price numeric not null,
created_at timestamp with time zone default now()
```

### payments

```sql
id uuid primary key default gen_random_uuid(),
order_id uuid references orders(id) on delete cascade,
method text not null,
status text default 'pending',
amount numeric not null,
reference text,
paid_at timestamp with time zone,
created_at timestamp with time zone default now()
```

### order_tracking

```sql
id uuid primary key default gen_random_uuid(),
order_id uuid references orders(id) on delete cascade,
status text not null,
message text,
latitude numeric,
longitude numeric,
created_by uuid references profiles(id),
created_at timestamp with time zone default now()
```

### wishlist_items

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id) on delete cascade,
product_id uuid references products(id) on delete cascade,
created_at timestamp with time zone default now(),
unique(user_id, product_id)
```

### reviews

```sql
id uuid primary key default gen_random_uuid(),
user_id uuid references profiles(id),
product_id uuid references products(id) on delete cascade,
order_id uuid references orders(id),
rating int check (rating >= 1 and rating <= 5),
comment text,
is_approved boolean default false,
created_at timestamp with time zone default now()
```

### settings

```sql
id uuid primary key default gen_random_uuid(),
key text unique not null,
value jsonb,
created_at timestamp with time zone default now(),
updated_at timestamp with time zone default now()
```

---

## 12. Règles de sécurité RLS

Activer RLS sur toutes les tables sensibles.

Règles générales :

- Un client peut lire ses propres données.
- Un client peut modifier uniquement son profil et ses adresses.
- Un client peut voir uniquement ses commandes.
- Les produits actifs sont visibles publiquement.
- Les catégories actives sont visibles publiquement.
- Les marques actives sont visibles publiquement.
- Les admins peuvent tout gérer.
- Les livreurs peuvent voir uniquement les commandes qui leur sont assignées en version avancée.

Ne jamais exposer :

- données privées des autres clients
- commandes des autres clients
- informations admin
- paramètres sensibles
- clés API

---

## 13. SEO Gabon

La plateforme doit être ultra optimisée pour le référencement local au Gabon.

### Mots-clés principaux

- boutique en ligne Gabon
- shopping en ligne Gabon
- achat chaussures Gabon
- vêtements homme Gabon
- vêtements femme Gabon
- accessoires téléphone Gabon
- acheter téléphone Libreville
- livraison vêtements Libreville
- chaussures femme Libreville
- boutique électronique Gabon
- Odm’s Shopping Gabon

### SEO technique

Chaque page doit avoir :

- title
- meta description
- canonical
- Open Graph
- Twitter card
- sitemap.xml
- robots.txt
- données structurées JSON-LD

### SEO produit

Chaque produit doit avoir :

- slug propre
- title SEO
- description SEO
- alt text images
- structured data Product
- prix
- disponibilité
- marque
- catégorie

Exemple :

```txt
Title : Nike Air Max Homme au Gabon | Odm’s Shopping
Description : Achetez vos Nike Air Max Homme au Gabon avec Odm’s Shopping. Livraison rapide, paiement à la livraison et support WhatsApp.
```

---

## 14. WhatsApp

WhatsApp doit être intégré partout où c’est utile.

### Emplacements

- Header
- Footer
- Page produit
- Panier
- Checkout
- Validation commande
- Suivi commande
- Contact
- Backoffice commande

### Message par défaut

```txt
Bonjour Odm’s Shopping, je suis intéressé par vos produits.
```

### Message depuis produit

```txt
Bonjour Odm’s Shopping, je suis intéressé par ce produit : {product_name}
Lien : {product_url}
```

### Message depuis commande

```txt
Bonjour Odm’s Shopping, j’ai une question concernant ma commande {order_number}.
```

Utiliser le numéro :

```txt
+24162573748
```

Lien format :

```txt
https://wa.me/24162573748?text=...
```

---

## 15. Règles UX importantes

### Général

- Toujours guider l’utilisateur.
- Toujours afficher des CTA clairs.
- Toujours rassurer avant l’achat.
- Toujours afficher les moyens de paiement.
- Toujours permettre de contacter WhatsApp rapidement.
- Toujours garder une interface simple.

### Produit

Une card produit doit afficher :

- image
- badge nouveauté ou promotion
- nom
- catégorie
- prix actuel
- ancien prix barré si existe
- note
- bouton panier
- bouton favori

### Panier

Le panier doit être accessible en un clic.
Le total doit être clair.
Le bouton commander doit être très visible.

### Checkout

Le checkout doit être court.
Ne pas demander trop d’informations.
Le client doit pouvoir commander rapidement.

---

## 16. Format des prix

Toujours afficher en FCFA.

Exemples :

```txt
65 000 FCFA
350 000 FCFA
1 200 000 FCFA
```

Ne pas afficher :

```txt
65000
65000 XAF
```

Créer une fonction utilitaire :

```ts
formatPrice(amount: number): string
```

---

## 17. Format des numéros de commande

Format recommandé :

```txt
RYTA-YYYY-XXXX
```

Exemple :

```txt
RYTA-2025-4321
```

---

## 18. Structure recommandée du projet

```txt
src/
  app/
    (public)/
      page.tsx
      boutique/
      nouveautes/
      promotions/
      suivi-commande/
      contact/
      recherche/
      panier/
      checkout/
      validation-commande/
    (auth)/
      connexion/
      inscription/
      mot-de-passe-oublie/
    compte/
      page.tsx
      commandes/
      adresses/
      favoris/
      parametres/
    admin/
      dashboard/
      produits/
      categories/
      marques/
      commandes/
      clients/
      livraisons/
      paiements/
      statistiques/
      parametres/
  components/
    layout/
    sections/
    product/
    cart/
    checkout/
    account/
    admin/
    ui/
  lib/
    supabase/
    utils/
    validations/
    constants/
  hooks/
  stores/
  types/
  styles/
```

---

## 19. Composants principaux

### Layout

- TopBar
- Header
- Navbar
- MobileMenu
- Footer
- WhatsAppFloatingButton

### Produit

- ProductCard
- ProductGrid
- ProductFilters
- ProductSort
- ProductImageGallery
- ProductPrice
- ProductBadge
- AddToCartButton

### Panier

- CartItem
- CartSummary
- PromoCodeInput
- CartDrawer si nécessaire

### Checkout

- CustomerInfoForm
- DeliveryAddressForm
- PaymentMethodSelector
- OrderSummary
- CheckoutStepper

### Compte

- AccountSidebar
- AccountStats
- OrderList
- AddressCard
- PaymentMethodCard

### Admin

- AdminSidebar
- AdminHeader
- StatCard
- SalesChart
- OrderStatusChart
- RecentOrdersTable
- ProductForm
- CategoryForm
- BrandForm
- OrderDetails
- StockAlertCard

---

## 20. États et statuts

### Product status

```ts
type ProductStatus = "active" | "draft" | "out_of_stock" | "hidden";
```

### Order status

```ts
type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned";
```

### Payment status

```ts
type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cash_on_delivery";
```

### Payment method

```ts
type PaymentMethod = "cash_on_delivery" | "airtel_money" | "moov_money";
```

---

## 21. Données initiales à prévoir

### Catégories

- Chaussures Homme
- Chaussures Femme
- Vêtements Homme
- Vêtements Femme
- Accessoires Homme
- Accessoires Femme
- Électroniques
- Accessoires Téléphone
- PC & Accessoires
- Audio

### Marques

- Nike
- Adidas
- Apple
- Samsung
- HP
- Lenovo
- JBL
- Oraimo
- Tecno
- Infinix

### Produits exemples

- Nike Air Max 270
- Nike Air Force 1 Rose
- Ensemble Survêtement Nike
- iPhone 14 Pro Max 256Go
- Samsung Galaxy A54
- JBL Tune 510BT
- AirPods Pro 2
- Power Bank Oraimo 30000mAh
- HP Pavilion 15
- Sac à Main Élégant
- Montre Curren Homme
- Veste en Jean Homme

---

## 22. Accessibilité

Respecter les bonnes pratiques :

- contraste suffisant
- navigation clavier
- labels sur formulaires
- aria-label sur icônes
- alt text sur images
- boutons compréhensibles
- messages d’erreur clairs

---

## 23. Performance

Objectifs :

- chargement rapide
- images optimisées
- lazy loading
- Server Components quand pertinent
- éviter les packages inutiles
- composants réutilisables
- pagination produits
- skeleton loading

Optimiser :

- images produits
- fonts
- scripts
- SEO
- metadata
- cache

---

## 24. Règles de code

- TypeScript strict
- Pas de `any` sauf nécessité justifiée
- Composants courts et réutilisables
- Séparation logique UI / données
- Utiliser Zod pour valider les formulaires
- Utiliser des constantes pour les statuts
- Centraliser les helpers dans `lib/utils`
- Ne jamais hardcoder les clés secrètes
- Utiliser `.env.local`
- Toujours gérer loading / error / empty state

---

## 25. Variables d’environnement

Prévoir :

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=24162573748
NEXT_PUBLIC_SHOP_EMAIL=ryta@gmail.com
NEXT_PUBLIC_SHOP_PHONE=+24162573748
```

Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client.

---

## 26. Pages légales

Créer les pages suivantes :

- Conditions d’utilisation
- Politique de confidentialité
- Livraison & Retours
- FAQ

Elles doivent être simples, professionnelles et rassurantes.

---

## 27. Fonctionnalités V1 prioritaires

Priorité MVP :

1. Accueil
2. Boutique
3. Détail produit
4. Nouveautés
5. Promotions
6. Recherche
7. Panier
8. Checkout
9. Validation commande
10. Suivi commande simple
11. Compte utilisateur
12. Backoffice admin
13. Produits
14. Catégories
15. Marques
16. Commandes
17. Paramètres boutique
18. WhatsApp

---

## 28. Fonctionnalités V2

À prévoir après MVP :

- paiement en ligne réel
- tracking livreur temps réel
- interface livreur
- notifications SMS
- notifications WhatsApp automatiques
- coupons avancés
- avis clients
- recommandations produits
- programme fidélité
- génération facture PDF
- export commandes Excel
- analytics avancés
- application mobile

---

## 29. Règle importante sur le tracking

Ne pas promettre un tracking temps réel si aucun module livreur n’existe.

MVP :

- tracking par statut
- estimation livraison
- timeline commande

Version avancée :

- interface livreur
- géolocalisation livreur
- carte en temps réel
- distance boutique-client
- estimation dynamique

---

## 30. Ton rédactionnel du site

Le ton doit être :

- professionnel
- simple
- rassurant
- commercial
- adapté au Gabon
- direct

Exemples :

```txt
Votre boutique en ligne n°1 au Gabon.
```

```txt
Commandez facilement vos chaussures, vêtements, accessoires et produits électroniques avec livraison rapide partout au Gabon.
```

```txt
Payez à la livraison par espèces, Airtel Money ou Moov Money.
```

```txt
Besoin d’aide ? Contactez-nous directement sur WhatsApp.
```

---

## 31. Objectif final

L’application doit être une vraie plateforme e-commerce professionnelle pour Odm’s Shopping.

Elle doit permettre :

- aux visiteurs de découvrir les produits
- aux clients de commander facilement
- à l’admin de gérer toute la boutique
- au business de vendre efficacement au Gabon
- à la marque Odm’s Shopping de paraître crédible, moderne et fiable

Chaque page doit être propre, responsive, rapide, SEO-friendly et cohérente avec l’identité visuelle bleu nuit, vert et blanc.
