import { Truck, CreditCard, MessageCircle, ShieldCheck } from "lucide-react";

const advantages = [
  {
    icon: CreditCard,
    title: "Paiement à la livraison",
    description: "En espèces à la réception",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    description: "Partout au Maroc en 24 à 72h, gratuite dès 500 DH",
    color: "text-green bg-green/10",
  },
  {
    icon: MessageCircle,
    title: "Support WhatsApp",
    description: "Réponse rapide 7j/7",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    icon: ShieldCheck,
    title: "Produits authentiques",
    description: "100% originaux, satisfait ou remboursé",
    color: "text-purple-600 bg-purple-50",
  },
];

export default function AdvantagesSection() {
  return (
    <section className="py-6 px-4 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3">
        {advantages.map((adv) => {
          const Icon = adv.icon;
          return (
            <div
              key={adv.title}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${adv.color}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#020B27] text-xs leading-tight">{adv.title}</p>
                <p className="text-text-secondary text-[11px] mt-0.5 leading-tight">{adv.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
