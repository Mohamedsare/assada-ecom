"use client";

import Link from "next/link";
import { MapPin, Clock, Package } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/utils";
import type { Order } from "@/types";

interface Props {
  recentDelivery?: Order | null;
}

export default function DeliveryTrackingCard({ recentDelivery }: Props) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <h3 className="font-bold text-[#020B27]">Suivi des livraisons en cours</h3>
        <Link href="/admin/livraisons" className="text-sm text-green hover:underline">
          Voir toutes les livraisons
        </Link>
      </div>

      <div className="grid md:grid-cols-[1.6fr_1fr]">
        {/* Carte décorative */}
        <div className="relative bg-night min-h-64 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e3a5f" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          <svg viewBox="0 0 400 260" className="absolute inset-0 w-full h-full">
            <path
              d="M 60 200 Q 150 180 200 130 T 340 70"
              fill="none"
              stroke="#22C55E"
              strokeWidth="3"
              strokeDasharray="2 8"
              strokeLinecap="round"
            />
            <circle cx="60" cy="200" r="8" fill="#020B27" />
            <circle cx="60" cy="200" r="14" fill="#020B27" opacity="0.25" />
            <g transform="translate(200 130)">
              <circle r="10" fill="#22C55E" />
              <circle r="18" fill="#22C55E" opacity="0.2">
                <animate attributeName="r" values="14;22;14" dur="2s" repeatCount="indefinite" />
              </circle>
              <text textAnchor="middle" y="4" fontSize="11">🛵</text>
            </g>
            <g transform="translate(340 70)">
              <path d="M0 -14 C -8 -14 -12 -8 -12 -2 C -12 6 0 14 0 14 C 0 14 12 6 12 -2 C 12 -8 8 -14 0 -14 Z" fill="#EF4444" />
              <circle cy="-3" r="4" fill="#fff" />
            </g>
            <text x="60" y="225" textAnchor="middle" fill="#94a3b8" fontSize="10">Boutique</text>
            <text x="340" y="95" textAnchor="middle" fill="#94a3b8" fontSize="10">Client</text>
          </svg>

          <span className="absolute top-3 left-3 bg-white/10 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">
            Casablanca
          </span>
          <span className="absolute bottom-3 right-3 bg-green/20 backdrop-blur text-green text-xs px-2.5 py-1 rounded-full font-medium">
            Module livraison V2
          </span>
        </div>

        {/* Détail commande */}
        <div className="p-5">
          {recentDelivery ? (
            <>
              <p className="text-xs text-text-secondary mb-1">Dernière livraison en cours</p>
              <p className="font-bold text-[#020B27] mb-0.5">{recentDelivery.order_number}</p>
              <p className="text-sm text-text-secondary mb-4">
                Client : {recentDelivery.customer_name}
              </p>

              <div className="space-y-2.5 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    <MapPin size={13} /> Ville
                  </span>
                  <span className="font-semibold text-[#020B27]">{recentDelivery.delivery_city}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    <Clock size={13} /> Livraison estimée
                  </span>
                  <span className="font-semibold text-[#020B27]">
                    {recentDelivery.estimated_delivery_date ?? "À confirmer"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-text-secondary">
                    <Package size={13} /> Articles
                  </span>
                  <span className="font-semibold text-[#020B27]">
                    {recentDelivery.items?.length ?? "—"}
                  </span>
                </div>
              </div>

              <Link href="/admin/livraisons"
                className="block w-full bg-green hover:bg-[#15803D] text-[#020B27] text-center text-sm font-semibold py-2.5 rounded-lg transition-colors mb-2">
                Gérer les livraisons
              </Link>
              <Link
                href={getWhatsAppUrl(`Bonjour, concernant la livraison de la commande ${recentDelivery.order_number}`)}
                target="_blank"
                className="flex items-center justify-center gap-1.5 w-full border border-gray-200 text-[#020B27] text-sm font-medium py-2.5 rounded-lg hover:border-green transition-colors"
              >
                <MapPin size={14} /> Contacter le client
              </Link>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-8 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Package size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-[#020B27] mb-1">Aucune livraison en cours</p>
              <p className="text-xs text-text-secondary mb-4">
                Les commandes &quot;En cours de livraison&quot; apparaîtront ici.
              </p>
              <Link href="/admin/commandes"
                className="text-sm text-green hover:underline font-medium">
                Voir les commandes →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
