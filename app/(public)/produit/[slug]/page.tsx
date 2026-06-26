import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug, getProductSlugs, getRelatedProducts } from "@/lib/supabase/queries";
import ProductPageContent from "./ProductPageContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "Produit introuvable | Odm's Shopping" };

  const title = `${product.name} au Gabon | Odm's Shopping`;
  const description = product.short_description
    ?? `Achetez ${product.name} au Gabon avec Odm's Shopping. Livraison rapide à Libreville, paiement à la livraison.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand?.name ?? "",
      product.category?.name ?? "",
      "Gabon", "Libreville", "boutique en ligne Gabon", "Odm's Shopping",
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      images: product.main_image_url ? [{ url: product.main_image_url, alt: product.name }] : [],
      type: "website",
      locale: "fr_GA",
      siteName: "Odm's Shopping",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description ?? product.description,
    image: product.images?.map((img) => img.image_url) ?? (product.main_image_url ? [product.main_image_url] : []),
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: `/produit/${product.slug}`,
      priceCurrency: "XAF",
      price: product.current_price,
      priceValidUntil: "2026-12-31",
      availability: product.stock_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: "Odm's Shopping" },
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageContent product={product} relatedProducts={relatedProducts} />
    </>
  );
}
