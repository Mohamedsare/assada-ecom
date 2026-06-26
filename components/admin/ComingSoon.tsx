import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
}

export default function ComingSoon({ title, description, icon: Icon, features }: ComingSoonProps) {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#0F172A] mb-1">{title}</h1>
      <p className="text-text-secondary text-sm mb-6">{description}</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
        <div className="w-16 h-16 bg-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon size={30} className="text-green" />
        </div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-2">Module en préparation</h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto mb-6">
          Ce module sera bientôt disponible. Il sera connecté à la base de données Supabase pour gérer vos données en temps réel.
        </p>

        {features && features.length > 0 && (
          <div className="max-w-sm mx-auto mb-6 text-left">
            <p className="text-xs font-semibold text-[#0F172A] mb-2 uppercase tracking-wide">Fonctionnalités prévues</p>
            <ul className="space-y-1.5">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-green shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 bg-green hover:bg-[#15803d] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <ArrowLeft size={15} /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
