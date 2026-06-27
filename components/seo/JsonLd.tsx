// Injecte un (ou plusieurs) bloc(s) de données structurées schema.org.
// Server component : le JSON est rendu dans le HTML initial, lisible par les crawlers.
export default function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
