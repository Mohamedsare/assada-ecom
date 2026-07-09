import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getRelatedProducts } from "@/lib/supabase/queries";
import { SITE_URL, SITE_NAME } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import ProductPageContent from "./ProductPageContent";

const SITE = SITE_URL.replace(/\/$/, "");

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Produit introuvable | RYTA" };

  const title = `${product.name} à Casablanca | RYTA`;
  const description = product.short_description
    ?? `Achetez ${product.name} avec RYTA. Livraison partout au Maroc en 24 à 72h, paiement à la livraison.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand?.name ?? "",
      product.category?.name ?? "",
      "Casablanca", "Casablanca", "boutique en ligne Casablanca", "RYTA",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      images: product.main_image_url ? [{ url: product.main_image_url, alt: product.name }] : [],
      type: "website",
      locale: "fr_MA",
      siteName: "RYTA",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.main_image_url ? [product.main_image_url] : [],
    },
    alternates: { canonical: `/produit/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const relatedProducts = await getRelatedProducts(product.id, product.category_id, 4);

  const productUrl = `${SITE}/produit/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: product.short_description ?? product.description,
    image: product.images?.map((img) => img.image_url) ?? (product.main_image_url ? [product.main_image_url] : []),
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "MAD",
      price: product.current_price,
      priceValidUntil: "2026-12-31",
      availability: product.stock_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: SITE_NAME },
    },
    aggregateRating: product.rating && product.review_count
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.review_count,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE },
      { "@type": "ListItem", position: 2, name: "Boutique", item: `${SITE}/boutique` },
      ...(product.category
        ? [{ "@type": "ListItem", position: 3, name: product.category.name, item: `${SITE}/boutique?categorie=${product.category.slug}` }]
        : []),
      { "@type": "ListItem", position: product.category ? 4 : 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <>
      <JsonLd data={[productJsonLd, breadcrumbJsonLd]} />
      <ProductPageContent product={product} relatedProducts={relatedProducts} />
    </>
  );
}
