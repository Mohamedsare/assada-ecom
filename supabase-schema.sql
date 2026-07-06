-- =============================================
-- RYTA — Schéma base de données
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- Extensions nécessaires
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLE : profiles (utilisateurs)
-- =============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  email text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'admin', 'super_admin', 'delivery_agent')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger : crée automatiquement un profil à l'inscription
-- Gère l'inscription email/mot de passe (first_name/last_name) ET
-- l'inscription Google OAuth (given_name/family_name/name/picture).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'given_name',
      split_part(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), ' ', 1)
    ),
    coalesce(
      new.raw_user_meta_data->>'last_name',
      new.raw_user_meta_data->>'family_name'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    )
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- TABLE : addresses
-- =============================================
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  full_name text not null,
  phone text not null,
  city text not null,
  district text not null,
  address_details text,
  landmark text,
  latitude numeric,
  longitude numeric,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLE : categories
-- =============================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLE : brands
-- =============================================
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLE : products
-- =============================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  current_price numeric not null check (current_price >= 0),
  old_price numeric check (old_price >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  sku text,
  main_image_url text,
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_promo boolean not null default false,
  status text not null default 'active' check (status in ('active', 'draft', 'out_of_stock', 'hidden')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLE : product_images
-- =============================================
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLE : product_variants
-- =============================================
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color text,
  size text,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  price_adjustment numeric not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLE : carts
-- =============================================
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLE : cart_items
-- =============================================
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLE : orders
-- =============================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
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
  payment_method text not null check (payment_method in ('cash_on_delivery', 'airtel_money', 'moov_money')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded', 'cash_on_delivery')),
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
  subtotal numeric not null check (subtotal >= 0),
  delivery_fee numeric not null default 0 check (delivery_fee >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  total_amount numeric not null check (total_amount >= 0),
  customer_note text,
  admin_note text,
  estimated_delivery_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- TABLE : order_items
-- =============================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  product_image_url text,
  color text,
  size text,
  unit_price numeric not null check (unit_price >= 0),
  quantity int not null check (quantity > 0),
  total_price numeric not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLE : payments
-- =============================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  method text not null check (method in ('cash_on_delivery', 'airtel_money', 'moov_money')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded', 'cash_on_delivery')),
  amount numeric not null check (amount >= 0),
  reference text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLE : order_tracking
-- =============================================
create table public.order_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  message text,
  latitude numeric,
  longitude numeric,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLE : wishlist_items
-- =============================================
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- =============================================
-- TABLE : reviews
-- =============================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  product_id uuid not null references public.products(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLE : coupons
-- =============================================
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  min_order_amount numeric default 0,
  max_uses int,
  used_count int not null default 0,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- =============================================
-- TABLE : settings
-- =============================================
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================
-- INDEXES pour les performances
-- =============================================
create index idx_products_category on public.products(category_id);
create index idx_products_brand on public.products(brand_id);
create index idx_products_status on public.products(status);
create index idx_products_slug on public.products(slug);
create index idx_products_is_featured on public.products(is_featured);
create index idx_products_is_new on public.products(is_new);
create index idx_products_is_promo on public.products(is_promo);
create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(order_status);
create index idx_orders_number on public.orders(order_number);
create index idx_order_items_order on public.order_items(order_id);
create index idx_cart_items_cart on public.cart_items(cart_id);
create index idx_wishlist_user on public.wishlist_items(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.order_tracking enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.settings enable row level security;

-- Helper : est-ce que l'utilisateur est admin ?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
  );
$$ language sql security definer stable;

-- ---- PROFILES ----
create policy "Lecture publique profil" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "Modifier son profil" on public.profiles
  for update using (id = auth.uid());

create policy "Admin tout" on public.profiles
  for all using (public.is_admin());

-- ---- ADDRESSES ----
create policy "Voir ses adresses" on public.addresses
  for select using (user_id = auth.uid() or public.is_admin());

create policy "Gérer ses adresses" on public.addresses
  for all using (user_id = auth.uid());

create policy "Admin tout" on public.addresses
  for all using (public.is_admin());

-- ---- CATEGORIES ----
create policy "Lecture publique catégories actives" on public.categories
  for select using (is_active = true or public.is_admin());

create policy "Admin gère catégories" on public.categories
  for all using (public.is_admin());

-- ---- BRANDS ----
create policy "Lecture publique marques actives" on public.brands
  for select using (is_active = true or public.is_admin());

create policy "Admin gère marques" on public.brands
  for all using (public.is_admin());

-- ---- PRODUCTS ----
create policy "Lecture publique produits actifs" on public.products
  for select using (status = 'active' or public.is_admin());

create policy "Admin gère produits" on public.products
  for all using (public.is_admin());

-- ---- PRODUCT_IMAGES ----
create policy "Lecture publique images" on public.product_images
  for select using (true);

create policy "Admin gère images" on public.product_images
  for all using (public.is_admin());

-- ---- PRODUCT_VARIANTS ----
create policy "Lecture publique variants" on public.product_variants
  for select using (true);

create policy "Admin gère variants" on public.product_variants
  for all using (public.is_admin());

-- ---- CARTS ----
create policy "Voir son panier" on public.carts
  for select using (user_id = auth.uid() or public.is_admin());

create policy "Gérer son panier" on public.carts
  for all using (user_id = auth.uid());

-- ---- CART_ITEMS ----
create policy "Voir ses articles panier" on public.cart_items
  for select using (
    cart_id in (select id from public.carts where user_id = auth.uid())
    or public.is_admin()
  );

create policy "Gérer ses articles panier" on public.cart_items
  for all using (
    cart_id in (select id from public.carts where user_id = auth.uid())
  );

-- ---- ORDERS ----
create policy "Voir ses commandes" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

create policy "Créer une commande" on public.orders
  for insert with check (user_id = auth.uid() or user_id is null);

create policy "Admin gère commandes" on public.orders
  for all using (public.is_admin());

-- ---- ORDER_ITEMS ----
create policy "Voir ses articles commande" on public.order_items
  for select using (
    order_id in (select id from public.orders where user_id = auth.uid())
    or public.is_admin()
  );

create policy "Admin gère order_items" on public.order_items
  for all using (public.is_admin());

-- ---- PAYMENTS ----
create policy "Voir ses paiements" on public.payments
  for select using (
    order_id in (select id from public.orders where user_id = auth.uid())
    or public.is_admin()
  );

create policy "Admin gère paiements" on public.payments
  for all using (public.is_admin());

-- ---- ORDER_TRACKING ----
create policy "Voir le suivi de sa commande" on public.order_tracking
  for select using (
    order_id in (select id from public.orders where user_id = auth.uid())
    or public.is_admin()
  );

create policy "Admin gère tracking" on public.order_tracking
  for all using (public.is_admin());

-- ---- WISHLIST ----
create policy "Voir ses favoris" on public.wishlist_items
  for select using (user_id = auth.uid());

create policy "Gérer ses favoris" on public.wishlist_items
  for all using (user_id = auth.uid());

-- ---- REVIEWS ----
create policy "Lecture publique avis approuvés" on public.reviews
  for select using (is_approved = true or user_id = auth.uid() or public.is_admin());

create policy "Créer un avis" on public.reviews
  for insert with check (user_id = auth.uid());

create policy "Admin gère avis" on public.reviews
  for all using (public.is_admin());

-- ---- SETTINGS ----
create policy "Admin lit les paramètres" on public.settings
  for select using (public.is_admin());

create policy "Admin gère paramètres" on public.settings
  for all using (public.is_admin());

-- ---- COUPONS ----
-- (RLS était activé sans policy : la table était inaccessible. Ajout des policies.)
create policy "Lecture publique coupons actifs" on public.coupons
  for select using (is_active = true or public.is_admin());

create policy "Admin gère coupons" on public.coupons
  for all using (public.is_admin());

-- =============================================
-- TABLE : contact_messages (formulaire de contact)
-- =============================================
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  subject text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- N'importe qui peut envoyer un message via le formulaire de contact
create policy "Envoyer un message" on public.contact_messages
  for insert with check (true);

-- Seuls les admins peuvent lire / gérer les messages reçus
create policy "Admin gère messages" on public.contact_messages
  for all using (public.is_admin());

create index if not exists idx_contact_messages_created on public.contact_messages(created_at desc);

-- =============================================
-- DONNÉES INITIALES
-- =============================================

-- Catégories
-- Niveau 1 — catalogues de tête
insert into public.categories (name, slug, sort_order) values
  ('Parfums', 'parfums', 1),
  ('Maquillage', 'maquillage', 2),
  ('Soins du visage', 'soins-visage', 3),
  ('Soins du corps', 'soins-corps', 4),
  ('Soins des cheveux', 'soins-cheveux', 5),
  ('Hygiène', 'hygiene', 6),
  ('Accessoires', 'accessoires', 7),
  ('Cadeaux', 'cadeaux', 8),
  ('Bien-être', 'bien-etre', 9);

-- Niveau 2 — sous-catégories
insert into public.categories (name, slug, sort_order, parent_id) values
  -- Parfums
  ('Homme',              'parfums-homme',    1, (select id from public.categories where slug = 'parfums')),
  ('Enfant',             'parfums-enfant',   2, (select id from public.categories where slug = 'parfums')),
  ('Luxe',               'parfums-luxe',     3, (select id from public.categories where slug = 'parfums')),
  ('Niche',              'parfums-niche',    4, (select id from public.categories where slug = 'parfums')),
  ('Coffrets',           'parfums-coffrets', 5, (select id from public.categories where slug = 'parfums')),
  -- Maquillage
  ('Teint',              'maquillage-teint',  1, (select id from public.categories where slug = 'maquillage')),
  ('Yeux',               'maquillage-yeux',   2, (select id from public.categories where slug = 'maquillage')),
  ('Lèvres',             'maquillage-levres', 3, (select id from public.categories where slug = 'maquillage')),
  ('Ongles',             'maquillage-ongles', 4, (select id from public.categories where slug = 'maquillage')),
  -- Soins du visage
  ('Nettoyants',         'soins-visage-nettoyants',         1, (select id from public.categories where slug = 'soins-visage')),
  ('Hydratants',         'soins-visage-hydratants',         2, (select id from public.categories where slug = 'soins-visage')),
  ('Sérums',             'soins-visage-serums',             3, (select id from public.categories where slug = 'soins-visage')),
  ('Masques',            'soins-visage-masques',            4, (select id from public.categories where slug = 'soins-visage')),
  ('Contour des yeux',   'soins-visage-contour-yeux',       5, (select id from public.categories where slug = 'soins-visage')),
  ('Anti-âge',           'soins-visage-anti-age',           6, (select id from public.categories where slug = 'soins-visage')),
  ('Protection solaire', 'soins-visage-protection-solaire', 7, (select id from public.categories where slug = 'soins-visage')),
  -- Soins du corps
  ('Laits & crèmes',     'soins-corps-laits-cremes', 1, (select id from public.categories where slug = 'soins-corps')),
  ('Huiles',             'soins-corps-huiles',       2, (select id from public.categories where slug = 'soins-corps')),
  ('Gommages',           'soins-corps-gommages',     3, (select id from public.categories where slug = 'soins-corps')),
  ('Déodorants',         'soins-corps-deodorants',   4, (select id from public.categories where slug = 'soins-corps')),
  ('Savons',             'soins-corps-savons',       5, (select id from public.categories where slug = 'soins-corps')),
  -- Soins des cheveux
  ('Shampoings',            'soins-cheveux-shampoings',       1, (select id from public.categories where slug = 'soins-cheveux')),
  ('Après-shampoings',      'soins-cheveux-apres-shampoings', 2, (select id from public.categories where slug = 'soins-cheveux')),
  ('Masques',               'soins-cheveux-masques',          3, (select id from public.categories where slug = 'soins-cheveux')),
  ('Huiles',                'soins-cheveux-huiles',           4, (select id from public.categories where slug = 'soins-cheveux')),
  ('Produits coiffants',    'soins-cheveux-coiffants',        5, (select id from public.categories where slug = 'soins-cheveux')),
  ('Traitement particulier','soins-cheveux-traitement',       6, (select id from public.categories where slug = 'soins-cheveux')),
  -- Hygiène
  ('Gel douche',            'hygiene-gel-douche',    1, (select id from public.categories where slug = 'hygiene')),
  ('Hygiène intime',        'hygiene-intime',        2, (select id from public.categories where slug = 'hygiene')),
  ('Hygiène bucco-dentaire','hygiene-bucco-dentaire',3, (select id from public.categories where slug = 'hygiene')),
  ('Désinfectants',         'hygiene-desinfectants', 4, (select id from public.categories where slug = 'hygiene')),
  -- Accessoires
  ('Trousses',              'accessoires-trousses',      1, (select id from public.categories where slug = 'accessoires')),
  ('Vaporisateurs',         'accessoires-vaporisateurs', 2, (select id from public.categories where slug = 'accessoires')),
  ('Pinceaux',              'accessoires-pinceaux',      3, (select id from public.categories where slug = 'accessoires')),
  ('Miroirs',               'accessoires-miroirs',       4, (select id from public.categories where slug = 'accessoires')),
  ('Éponges',               'accessoires-eponges',       5, (select id from public.categories where slug = 'accessoires')),
  -- Cadeaux
  ('Coffrets cadeaux',      'cadeaux-coffrets',          1, (select id from public.categories where slug = 'cadeaux')),
  ('Paniers cadeaux',       'cadeaux-paniers',           2, (select id from public.categories where slug = 'cadeaux')),
  ('Cartes cadeaux',        'cadeaux-cartes',            3, (select id from public.categories where slug = 'cadeaux')),
  ('Miniatures',            'cadeaux-miniatures',        4, (select id from public.categories where slug = 'cadeaux')),
  ('Éditions limitées',     'cadeaux-editions-limitees', 5, (select id from public.categories where slug = 'cadeaux')),
  ('Cadeaux par occasion',  'cadeaux-occasions',         6, (select id from public.categories where slug = 'cadeaux')),
  -- Bien-être
  ('Aromathérapie',              'bien-etre-aromatherapie', 1, (select id from public.categories where slug = 'bien-etre')),
  ('Aérothérapie',               'bien-etre-aerotherapie',  2, (select id from public.categories where slug = 'bien-etre')),
  ('Phytothérapie',              'bien-etre-phytotherapie', 3, (select id from public.categories where slug = 'bien-etre')),
  ('Neurothérapie',              'bien-etre-neurotherapie', 4, (select id from public.categories where slug = 'bien-etre')),
  ('Psychothérapie & relaxation','bien-etre-psychotherapie',5, (select id from public.categories where slug = 'bien-etre'));

-- Niveau 3 — détail du catalogue bien-être
insert into public.categories (name, slug, sort_order, parent_id) values
  -- Aromathérapie
  ('Huiles essentielles',       'bien-etre-aromatherapie-huiles-essentielles', 1, (select id from public.categories where slug = 'bien-etre-aromatherapie')),
  ('Synergies',                 'bien-etre-aromatherapie-synergies',           2, (select id from public.categories where slug = 'bien-etre-aromatherapie')),
  ('Roll-on bien-être',         'bien-etre-aromatherapie-roll-on',             3, (select id from public.categories where slug = 'bien-etre-aromatherapie')),
  ('Diffuseurs & accessoires',  'bien-etre-aromatherapie-diffuseurs',          4, (select id from public.categories where slug = 'bien-etre-aromatherapie')),
  ('Sprays d''ambiance',        'bien-etre-aromatherapie-sprays',              5, (select id from public.categories where slug = 'bien-etre-aromatherapie')),
  -- Aérothérapie
  ('Diffusion atmosphérique',        'bien-etre-aerotherapie-diffusion',        1, (select id from public.categories where slug = 'bien-etre-aerotherapie')),
  ('Inhalation & soins respiratoires','bien-etre-aerotherapie-inhalation',      2, (select id from public.categories where slug = 'bien-etre-aerotherapie')),
  ('Sprays purifiants d''air',       'bien-etre-aerotherapie-sprays-purifiants',3, (select id from public.categories where slug = 'bien-etre-aerotherapie')),
  ('Mélanges respiratoires',         'bien-etre-aerotherapie-melanges',         4, (select id from public.categories where slug = 'bien-etre-aerotherapie')),
  ('Dispositifs de diffusion',       'bien-etre-aerotherapie-dispositifs',      5, (select id from public.categories where slug = 'bien-etre-aerotherapie')),
  -- Phytothérapie
  ('Tisanes & infusions',            'bien-etre-phytotherapie-tisanes',      1, (select id from public.categories where slug = 'bien-etre-phytotherapie')),
  ('Plantes médicinales',            'bien-etre-phytotherapie-plantes',      2, (select id from public.categories where slug = 'bien-etre-phytotherapie')),
  ('Extraits naturels',              'bien-etre-phytotherapie-extraits',     3, (select id from public.categories where slug = 'bien-etre-phytotherapie')),
  ('Compléments à base de plantes',  'bien-etre-phytotherapie-complements',  4, (select id from public.categories where slug = 'bien-etre-phytotherapie')),
  ('Huiles végétales thérapeutiques','bien-etre-phytotherapie-huiles-vegetales',5,(select id from public.categories where slug = 'bien-etre-phytotherapie')),
  -- Neurothérapie
  ('Relaxation mentale',             'bien-etre-neurotherapie-relaxation',    1, (select id from public.categories where slug = 'bien-etre-neurotherapie')),
  ('Concentration cognitive',        'bien-etre-neurotherapie-concentration', 2, (select id from public.categories where slug = 'bien-etre-neurotherapie')),
  -- Psychothérapie & relaxation
  ('Gestion du stress & anxiété',    'bien-etre-psychotherapie-stress',     1, (select id from public.categories where slug = 'bien-etre-psychotherapie')),
  ('Massage bien-être',              'bien-etre-psychotherapie-massage',    2, (select id from public.categories where slug = 'bien-etre-psychotherapie')),
  ('Sophrologie',                    'bien-etre-psychotherapie-sophrologie',3, (select id from public.categories where slug = 'bien-etre-psychotherapie')),
  ('Produits spa',                   'bien-etre-psychotherapie-spa',        4, (select id from public.categories where slug = 'bien-etre-psychotherapie'));

-- Marques
insert into public.brands (name, slug) values
  ('L''Oréal Paris', 'loreal-paris'),
  ('Garnier', 'garnier'),
  ('Nivea', 'nivea'),
  ('Dove', 'dove'),
  ('Maybelline', 'maybelline'),
  ('Bioderma', 'bioderma'),
  ('La Roche-Posay', 'la-roche-posay'),
  ('Vaseline', 'vaseline'),
  ('Fair & White', 'fair-and-white'),
  ('Palmer''s', 'palmers');

-- Paramètres boutique par défaut
insert into public.settings (key, value) values
  ('shop_name', '"RYTA"'),
  ('shop_email', '"contact@ryta.ma"'),
  ('shop_phone', '"+21200000000"'),
  ('shop_whatsapp', '"21200000000"'),
  ('shop_address', '"Boulevard Abdelmoumen, N10, Galerie Derb Ghalef, Kissariat Zemmouri, 20102 Derb Ghalef, Casablanca, Maroc"'),
  ('shop_city', '"Casablanca"'),
  ('shop_country', '"Maroc"'),
  ('delivery_fee', '2000'),
  ('free_delivery_threshold', '100000'),
  ('currency', '"DH"'),
  ('whatsapp_default_message', '"Bonjour RYTA, je suis intéressé par vos produits."');

-- =============================================
-- STORAGE BUCKETS (à créer dans Supabase Dashboard)
-- =============================================
-- Allez dans Storage → Create bucket :
-- 1. "products"   — Public, pour les images produits
-- 2. "avatars"    — Public, pour les photos de profil
-- 3. "categories" — Public, pour les images catégories
-- 4. "brands"     — Public, pour les logos marques
