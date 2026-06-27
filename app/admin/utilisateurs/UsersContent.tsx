"use client";

import { useState, useTransition } from "react";
import { UserCog, ShieldCheck } from "lucide-react";
import { adminUpdateUserRole, adminToggleUserActive } from "@/lib/supabase/actions";
import type { Profile, UserRole } from "@/types";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "customer", label: "Client" },
  { value: "delivery_agent", label: "Livreur" },
  { value: "admin", label: "Administrateur" },
  { value: "super_admin", label: "Super Admin" },
];

const ROLE_BADGE: Record<string, string> = {
  super_admin: "bg-purple-50 text-purple-700",
  admin: "bg-blue-50 text-blue-700",
  delivery_agent: "bg-orange-50 text-orange-700",
  customer: "bg-gray-100 text-gray-600",
};

export default function UsersContent({ staff, currentUserId }: { staff: Profile[]; currentUserId: string }) {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#0F172A]">Utilisateurs admins</h1>
        <p className="text-text-secondary text-sm mt-0.5">{staff.length} membre(s) du staff · gérez les rôles et accès</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-5 flex items-start gap-2">
        <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Les rôles <b>admin</b> et <b>super admin</b> donnent accès au back-office. Soyez prudent : ne retirez pas votre propre accès.
        </p>
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <UserCog size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#0F172A] mb-1">Aucun membre du staff</p>
          <p className="text-text-secondary text-sm">Promouvez un client depuis la liste des clients ou ici.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Membre", "Rôle actuel", "Modifier le rôle", "Accès", "Membre depuis"].map((h) => (
                    <th key={h} className="text-left text-xs text-text-secondary font-medium py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {staff.map((u) => <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function UserRow({ user, isSelf }: { user: Profile; isSelf: boolean }) {
  const [role, setRole] = useState<UserRole>(user.role);
  const [active, setActive] = useState(user.is_active);
  const [pending, startTransition] = useTransition();

  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email || "Utilisateur";
  const initials = (name.slice(0, 2)).toUpperCase();

  const changeRole = (next: UserRole) => {
    setRole(next);
    startTransition(() => { adminUpdateUserRole(user.id, next); });
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
            <p className="text-sm font-medium text-[#0F172A]">{name}{isSelf && <span className="text-[10px] text-green ml-1">(vous)</span>}</p>
            <p className="text-xs text-text-secondary">{user.email ?? "—"}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${ROLE_BADGE[role] ?? "bg-gray-100"}`}>
          {ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role}
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
        <span className="text-sm text-text-secondary">
          {new Date(user.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </td>
    </tr>
  );
}
