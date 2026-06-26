import type { Metadata } from "next";
import { MessageCircle, Search, Users } from "lucide-react";
import Link from "next/link";
import { formatPrice, getWhatsAppUrl } from "@/lib/utils";
import { getAdminProfiles } from "@/lib/supabase/queries";

export const metadata: Metadata = { title: "Gestion clients" };

export default async function AdminClientsPage() {
  const profiles = await getAdminProfiles();
  const customers = profiles.filter((p) => p.role === "customer");

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">Clients</h1>
          <p className="text-text-secondary text-sm mt-0.5">{customers.length} clients enregistrés</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-56">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="bg-transparent text-sm outline-none flex-1 text-[#0F172A]"
          />
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Users size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0F172A] mb-2">Aucun client</p>
          <p className="text-text-secondary text-sm">Les clients apparaîtront ici après inscription</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Client", "Téléphone", "Rôle", "Statut", "Membre depuis", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {customers.map((c) => {
                  const initials = [c.first_name, c.last_name]
                    .filter(Boolean)
                    .map((n) => n![0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?";
                  const displayName = [c.first_name, c.last_name].filter(Boolean).join(" ") || "Utilisateur";
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-green rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">{displayName}</p>
                            <p className="text-xs text-text-secondary">{c.email ?? "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-text-secondary">{c.phone ?? "—"}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs text-text-secondary capitalize">{c.role}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.is_active ? "bg-green-50 text-green" : "bg-gray-100 text-gray-500"}`}>
                          {c.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-text-secondary">
                          {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {c.phone && (
                            <Link
                              href={getWhatsAppUrl(`Bonjour ${c.first_name ?? ""}`)}
                              target="_blank"
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#25D366] transition-colors"
                              title="WhatsApp"
                            >
                              <MessageCircle size={15} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
