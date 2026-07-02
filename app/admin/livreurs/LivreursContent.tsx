"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Truck, Search, X, UserPlus, Loader2, Phone, MapPin, Package,
  CheckCircle2, Wallet, Pencil, Trash2, MessageCircle,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import {
  adminCreateDeliveryAgent, adminUpdateDeliveryAgent,
  adminToggleDeliveryAgentActive, adminDeleteDeliveryAgent,
} from "@/lib/supabase/actions";
import type { DeliveryAgent } from "@/types";

type AgentStats = Record<string, { assigned: number; delivered: number; collected: number }>;
const EMPTY = { assigned: 0, delivered: 0, collected: 0 };

export default function LivreursContent({ agents, stats }: { agents: DeliveryAgent[]; stats: AgentStats }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<DeliveryAgent | null>(null);
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter((a) =>
      [a.name, a.phone, a.zones].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  }, [agents, search]);

  const totalCollected = agents.reduce((s, a) => s + (stats[a.id]?.collected ?? 0), 0);
  const totalDelivered = agents.reduce((s, a) => s + (stats[a.id]?.delivered ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#020B27]">Livreurs</h1>
          <p className="text-text-secondary text-sm mt-0.5">{agents.length} livreur(s) · {totalDelivered} livraisons · {formatPrice(totalCollected)} encaissés</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={16} /> Ajouter un livreur
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un livreur (nom, téléphone, zone)…"
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
        />
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Truck size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#020B27] mb-1">Aucun livreur</p>
          <p className="text-text-secondary text-sm mb-5">Ajoutez vos livreurs pour assigner les commandes et suivre les encaissements.</p>
          <button onClick={() => setCreating(true)} className="bg-green hover:bg-[#9E7A45] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Ajouter un livreur
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <p className="text-text-secondary text-sm col-span-full py-8 text-center">Aucun livreur ne correspond à « {search} ».</p>
          ) : filtered.map((a) => (
            <AgentCard key={a.id} agent={a} stats={stats[a.id] ?? EMPTY} onEdit={() => setEditing(a)} />
          ))}
        </div>
      )}

      {(creating || editing) && (
        <AgentModal agent={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      )}
    </div>
  );
}

function AgentCard({
  agent, stats, onEdit,
}: {
  agent: DeliveryAgent; stats: { assigned: number; delivered: number; collected: number }; onEdit: () => void;
}) {
  const router = useRouter();
  const [active, setActive] = useState(agent.is_active);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !active;
    setActive(next);
    startTransition(async () => { await adminToggleDeliveryAgentActive(agent.id, next); router.refresh(); });
  };
  const remove = () => {
    if (!confirm(`Supprimer le livreur « ${agent.name} » ?`)) return;
    startTransition(async () => { await adminDeleteDeliveryAgent(agent.id); router.refresh(); });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-night rounded-full flex items-center justify-center text-white shrink-0">
            <Truck size={18} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#020B27] truncate">{agent.name}</p>
            <p className="text-xs text-text-secondary flex items-center gap-1"><Phone size={11} /> {agent.phone}</p>
          </div>
        </div>
        <button
          onClick={toggle}
          disabled={pending}
          className={`text-[11px] font-medium px-2 py-0.5 rounded-full transition-colors disabled:opacity-50 ${active ? "bg-green-50 text-green hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          {active ? "Actif" : "Inactif"}
        </button>
      </div>

      {agent.zones && (
        <p className="text-xs text-text-secondary flex items-start gap-1 mt-3">
          <MapPin size={12} className="mt-0.5 shrink-0" /> <span>{agent.zones}</span>
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <Stat icon={<Package size={13} />} value={String(stats.assigned)} label="Assignées" />
        <Stat icon={<CheckCircle2 size={13} />} value={String(stats.delivered)} label="Livrées" />
        <Stat icon={<Wallet size={13} />} value={formatPrice(stats.collected)} label="Encaissé" />
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
        <a
          href={`https://wa.me/${agent.phone.replace(/[^0-9]/g, "") || WHATSAPP_NUMBER}`}
          target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium border border-gray-200 text-[#020B27] px-2 py-1.5 rounded-lg hover:border-green hover:text-green transition-colors"
        >
          <MessageCircle size={13} /> WhatsApp
        </a>
        <button onClick={onEdit} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-[#020B27] hover:border-gray-300 transition-colors"><Pencil size={14} /></button>
        <button onClick={remove} disabled={pending} className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-gray-50 rounded-lg py-2">
      <div className="flex items-center justify-center gap-1 text-gray-400 mb-0.5">{icon}</div>
      <p className="text-sm font-bold text-[#020B27] leading-none">{value}</p>
      <p className="text-[10px] text-text-secondary mt-0.5">{label}</p>
    </div>
  );
}

function AgentModal({ agent, onClose }: { agent: DeliveryAgent | null; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const submit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = agent
        ? await adminUpdateDeliveryAgent(agent.id, formData)
        : await adminCreateDeliveryAgent(formData);
      if (res?.error) setError(res.error);
      else { router.refresh(); onClose(); }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#020B27]">{agent ? "Modifier le livreur" : "Nouveau livreur"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#020B27] transition-colors"><X size={20} /></button>
        </div>
        <form action={submit} className="p-5 space-y-4">
          <Field label="Nom complet" name="name" defaultValue={agent?.name ?? ""} required />
          <Field label="Téléphone" name="phone" type="tel" defaultValue={agent?.phone ?? ""} required />
          <Field label="Zones couvertes" name="zones" defaultValue={agent?.zones ?? ""} placeholder="Derb Ghalef, Maârif, Anfa…" />
          <Field label="Note interne" name="note" defaultValue={agent?.note ?? ""} />
          {!agent && (
            <label className="flex items-center gap-2 text-sm text-[#020B27]">
              <input type="checkbox" name="is_active" defaultChecked className="accent-green w-4 h-4" /> Livreur actif
            </label>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              {pending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
              {agent ? "Enregistrer" : "Ajouter"}
            </button>
            <button type="button" onClick={onClose} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label, name, defaultValue, type = "text", required = false, placeholder,
}: {
  label: string; name: string; defaultValue: string; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[#020B27] mb-1.5">{label}</label>
      <input
        id={name} name={name} type={type} defaultValue={defaultValue} required={required} placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
      />
    </div>
  );
}
