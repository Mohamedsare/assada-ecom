"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, MapPin, CreditCard, Truck, ArrowRight, Sparkles } from "lucide-react";
import { getWhatsAppUrl, WHATSAPP_DEFAULT_MESSAGE } from "@/lib/utils";

const STEPS = [
  {
    icon: ShoppingCart,
    title: "Choisissez vos produits",
    desc: "Parcourez le catalogue et ajoutez vos coups de cœur au panier.",
  },
  {
    icon: MapPin,
    title: "Renseignez vos infos",
    desc: "Nom, téléphone et adresse — sans avoir à créer de compte.",
  },
  {
    icon: CreditCard,
    title: "Payez à la livraison",
    desc: "En espèces à la réception, en toute confiance.",
  },
  {
    icon: Truck,
    title: "Recevez chez vous",
    desc: "Livraison partout au Maroc en 24 à 72h. Gratuite à partir de 300 DH pour tout le Maroc.",
  },
];

export default function OrderStepsSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white to-gray-light py-14 px-4 border-t border-gray-100">
      {/* Halos décoratifs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-green/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-green/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A6D3F] bg-green/15 px-3 py-1 rounded-full">
            <Sparkles size={13} /> Simple &amp; rapide
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#020B27]">
            Commander en quelques clics
          </h2>
          <p className="mt-2 text-sm sm:text-base text-text-secondary max-w-xl mx-auto">
            Un parcours pensé pour vous : de votre coup de cœur à votre porte, en 4 étapes.
          </p>
        </div>

        {/* Schéma du process */}
        <div className="relative">
          {/* Connecteur horizontal (desktop) */}
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-linear-to-r from-green/25 via-green/60 to-green/25" />
          {/* Connecteur vertical (mobile) */}
          <div className="md:hidden absolute left-8 top-6 bottom-6 w-0.5 bg-linear-to-b from-green/50 to-green/10" />

          <div className="grid gap-8 md:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: i * 0.12, ease: "easeOut" }}
                  className="group relative flex items-start md:flex-col md:items-center gap-4 md:gap-0 md:text-center"
                >
                  {/* Tuile icône + numéro */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-night to-night-2 flex items-center justify-center ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                      <Icon size={26} className="text-green-light" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-green text-[#020B27] text-xs font-bold flex items-center justify-center ring-2 ring-white shadow">
                      {i + 1}
                    </span>
                  </div>

                  {/* Texte */}
                  <div className="md:mt-5 md:px-2">
                    <h3 className="font-bold text-[#020B27] text-base leading-tight">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-text-secondary leading-snug">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/boutique"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#B8925A] btn-sweep hover:bg-[#9E7A45] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-colors active:scale-95"
          >
            Découvrir la boutique <ArrowRight size={17} />
          </Link>
          <a
            href={getWhatsAppUrl(WHATSAPP_DEFAULT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-whatsapp hover:bg-whatsapp-dark text-white px-6 py-3 rounded-2xl font-bold text-sm transition-colors active:scale-95"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            Commander via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
