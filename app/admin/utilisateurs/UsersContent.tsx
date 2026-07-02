"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCog, ShieldCheck, Search, X, UserPlus, Loader2 } from "lucide-react";
import { adminUpdateUserRole, adminToggleUserActive } from "@/lib/supabase/actions";
import type { Profile, UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "customer", label: "Client" },
  { value: "delivery_agent", label: "Livreur" },
  { value: "admin", label: "Administrateur" },
  { value: "super_admin", label: "Super Admin" },
];

const STAFF_ROLE_OPTIONS = ROLE_OPTIONS.filter((r) => r.value !== "customer");

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-purple-50 text-purple-700",
  admin: "bg-blue-50 text-blue-700",
  delivery_agent: "bg-orange-50 text-orange-700",
  customer: "bg-gray-100 text-gray-600",
};

const roleLabel = (role: string) => ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role;

export default function UsersContent({
  staff,
  customers,
  currentUserId,
}: {
  staff: Profile[];
  customers: Profile[];
  currentUserId: string;
}) {
  const [search, setSearch] = useState("");
  const [promoting, setPromoting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((u) =>
      [u.first_name, u.last_name, u.email].filter(Boolean).some((v) => v!.toLowerCase().includes(q))
    );
  }, [staff, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#020B27]">Utilisateurs admins</h1>
          <p className="text-text-secondary text-sm mt-0.5">{staff.length} membre(s) du staff · gérez les rôles et accès</p>
        </div>
        <button
          onClick={() => setPromoting(true)}
          className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] text-[#020B27] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={16} /> Promouvoir un client
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2">
        <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Les rôles <b>admin</b> et <b>super admin</b> donnent accès au back-office. Soyez prudent : ne retirez pas votre propre accès.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un membre…"
          className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
        />
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <UserCog size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#020B27] mb-1">Aucun membre du staff</p>
          <p className="text-text-secondary text-sm mb-5">Promouvez un client pour lui donner accès au back-office.</p>
          <button onClick={() => setPromoting(true)} className="bg-green hover:bg-[#9E7A45] text-[#020B27] text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Promouvoir un client
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Membre", "Rôle actuel", "Modifier le rôle", "Accès", "Membre depuis"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-text-secondary text-sm">Aucun membre ne correspond à « {search} ».</td></tr>
                ) : filtered.map((u) => <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {promoting && <PromoteModal customers={customers} onClose={() => setPromoting(false)} />}
    </div>
  );
}

function UserRow({ user, isSelf }: { user: Profile; isSelf: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>(user.role);
  const [active, setActive] = useState(user.is_active);
  const [pending, startTransition] = useTransition();

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Utilisateur";
  const initials = (name.slice(0, 2)).toUpperCase();

  const changeRole = (next: UserRole) => {
    setRole(next);
    startTransition(async () => {
      await adminUpdateUserRole(user.id, next);
      router.refresh();
    });
  };
  const toggleActive = () => {
    const next = !active;
    setActive(next);
    startTransition(() => { adminToggleUserActive(user.id, next); });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-night rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">{initials}</div>
          <div>
            <p className="text-sm font-medium text-[#020B27]">{name}{isSelf && <span className="text-[10px] text-green ml-1">(vous)</span>}</p>
            <p className="text-xs text-text-secondary">{user.email ?? "—"}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[role] ?? "bg-gray-100"}`}>
          {roleLabel(role)}
        </span>
      </td>
      <td className="py-3 px-4">
        <select
          value={role}
          disabled={isSelf || pending}
          onChange={(e) => changeRole(e.target.value as UserRole)}
          className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-green cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </td>
      <td className="py-3 px-4">
        <button
          onClick={toggleActive}
          disabled={isSelf || pending}
          className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${active ? "bg-green-50 text-green hover:bg-green-100" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
        >
          {active ? "Actif" : "Bloqué"}
        </button>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-text-secondary whitespace-nowrap">
          {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </td>
    </tr>
  );
}

function PromoteModal({ customers, onClose }: { customers: Profile[]; onClose: () => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>("admin");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers.slice(0, 8);
    return customers
      .filter((c) => [c.first_name, c.last_name, c.email, c.phone].filter(Boolean).some((v) => v!.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [customers, search]);

  const promote = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await adminUpdateUserRole(selected.id, role);
      if (res?.error) setError(res.error);
      else { router.refresh(); onClose(); }
    });
  };

  const nameOf = (c: Profile) => [c.first_name, c.last_name].filter(Boolean).join(" ") || c.email || "Utilisateur";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#020B27]">Promouvoir un client</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#020B27] transition-colors"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-4">
          {customers.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">Aucun client à promouvoir pour le moment.</p>
          ) : (
            <>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
                  placeholder="Nom, email ou téléphone du client…"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-green transition-colors"
                />
              </div>

              <div className="border border-gray-100 rounded-lg divide-y divide-gray-50 max-h-52 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-4">Aucun client trouvé.</p>
                ) : results.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors ${selected?.id === c.id ? "bg-green-50" : "hover:bg-gray-50"}`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#020B27] truncate">{nameOf(c)}</p>
                      <p className="text-xs text-text-secondary truncate">{c.email ?? c.phone ?? "—"}</p>
                    </div>
                    {selected?.id === c.id && <ShieldCheck size={16} className="text-green shrink-0" />}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#020B27] mb-1.5">Rôle à attribuer</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green bg-white"
                >
                  {STAFF_ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={promote}
                  disabled={!selected || pending}
                  className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] disabled:opacity-50 disabled:cursor-not-allowed text-[#020B27] text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  {pending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                  {selected ? `Promouvoir ${nameOf(selected)}` : "Sélectionnez un client"}
                </button>
                <button onClick={onClose} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
