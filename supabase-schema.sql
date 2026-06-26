-- =============================================
-- ODM'S SHOPPING — Schéma base de données
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
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
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

-- =============================================
-- DONNÉES INITIALES
-- =============================================

-- Catégories
insert into public.categories (name, slug, sort_order) values
  ('Chaussures Homme', 'chaussures-homme', 1),
  ('Chaussures Femme', 'chaussures-femme', 2),
  ('Vêtements Homme', 'vetements-homme', 3),
  ('Vêtements Femme', 'vetements-femme', 4),
  ('Accessoires Homme', 'accessoires-homme', 5),
  ('Accessoires Femme', 'accessoires-femme', 6),
  ('Électroniques', 'electroniques', 7),
  ('Accessoires Téléphone', 'accessoires-telephone', 8),
  ('PC & Accessoires', 'pc-accessoires', 9),
  ('Audio', 'audio', 10);

-- Marques
insert into public.brands (name, slug) values
  ('Nike', 'nike'),
  ('Adidas', 'adidas'),
  ('Apple', 'apple'),
  ('Samsung', 'samsung'),
  ('HP', 'hp'),
  ('Lenovo', 'lenovo'),
  ('JBL', 'jbl'),
  ('Oraimo', 'oraimo'),
  ('Tecno', 'tecno'),
  ('Infinix', 'infinix');

-- Paramètres boutique par défaut
insert into public.settings (key, value) values
  ('shop_name', '"Odm''s Shopping"'),
  ('shop_email', '"odms-shopping@gmail.com"'),
  ('shop_phone', '"+24162573748"'),
  ('shop_whatsapp', '"24162573748"'),
  ('shop_address', '"Libreville, Gabon"'),
  ('shop_city', '"Libreville"'),
  ('shop_country', '"Gabon"'),
  ('delivery_fee', '2000'),
  ('free_delivery_threshold', '100000'),
  ('currency', '"FCFA"'),
  ('whatsapp_default_message', '"Bonjour Odm''s Shopping, je suis intéressé par vos produits."');

-- =============================================
-- STORAGE BUCKETS (à créer dans Supabase Dashboard)
-- =============================================
-- Allez dans Storage → Create bucket :
-- 1. "products"   — Public, pour les images produits
-- 2. "avatars"    — Public, pour les photos de profil
-- 3. "categories" — Public, pour les images catégories
-- 4. "brands"     — Public, pour les logos marques
