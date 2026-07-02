"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, ShieldAlert, Search, X, UserPlus, Loader2, Settings2, UserMinus, Lock,
} from "lucide-react";
import {
  PERMISSION_MODULES, PERMISSION_ACTIONS, PERMISSION_ACTION_LABELS, SENSITIVE_PERMISSIONS,
  defaultEmployeePermissions,
} from "@/lib/permissions";
import { adminUpdateEmployeePermissions, adminUpdateUserRole, adminCreateEmployee } from "@/lib/supabase/actions";
import type { Profile, PermissionMatrix } from "@/types";

const nameOf = (p: Profile) => [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email || "Utilisateur";
const initials = (p: Profile) => nameOf(p).slice(0, 2).toUpperCase();

export default function PermissionsContent({
  employees, admins, customers,
}: {
  employees: Profile[]; admins: Profile[]; customers: Profile[];
}) {
  const [editing, setEditing] = useState<Profile | null>(null);
  const [promoting, setPromoting] = useState(false);
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#020B27]">Permissions</h1>
          <p className="text-text-secondary text-sm mt-0.5">Contrôlez précisément les droits de chaque employé</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus size={16} /> Créer un employé
          </button>
          <button
            onClick={() => setPromoting(true)}
            className="flex items-center gap-2 border border-gray-200 text-[#020B27] text-sm font-medium px-4 py-2 rounded-lg hover:border-green hover:text-green transition-colors"
          >
            Promouvoir un client
          </button>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2">
        <ShieldCheck size={16} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-700">
          Les <b>administrateurs</b> ont tous les droits. Les <b>employés</b> n&apos;ont que les droits que vous leur accordez ci-dessous — jamais tous par défaut.
        </p>
      </div>

      {/* Employés */}
      <section>
        <h2 className="text-sm font-semibold text-[#020B27] mb-2">Employés ({employees.length})</h2>
        {employees.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
            <Settings2 size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="font-semibold text-[#020B27] mb-1">Aucun employé</p>
            <p className="text-text-secondary text-sm">Ajoutez un employé pour lui attribuer des permissions ciblées.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees.map((e) => <EmployeeCard key={e.id} profile={e} onConfigure={() => setEditing(e)} />)}
          </div>
        )}
      </section>

      {/* Admins (lecture seule) */}
      {admins.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#020B27] mb-2">Administrateurs ({admins.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {admins.map((a) => (
              <div key={a.id} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-xs shrink-0">{initials(a)}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[#020B27] truncate">{nameOf(a)}</p>
                  <p className="text-xs text-text-secondary truncate">{a.email ?? "—"}</p>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 flex items-center gap-1"><ShieldCheck size={11} /> Tous droits</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {editing && <PermissionModal profile={editing} onClose={() => setEditing(null)} />}
      {promoting && <PromoteModal customers={customers} onClose={() => setPromoting(false)} />}
      {creating && <CreateEmployeeModal onClose={() => setCreating(false)} />}
    </div>
  );
}

function EmployeeCard({ profile, onConfigure }: { profile: Profile; onConfigure: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const grantedCount = useMemo(() => {
    const perms = profile.permissions ?? {};
    let n = 0;
    for (const [mod, actions] of Object.entries(perms)) {
      if (mod === "sensitive") continue;
      n += Object.values(actions).filter(Boolean).length;
    }
    return n;
  }, [profile.permissions]);

  const revoke = () => {
    if (!confirm(`Retirer le statut d'employé à ${nameOf(profile)} ?`)) return;
    startTransition(async () => { await adminUpdateUserRole(profile.id, "customer"); router.refresh(); });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-night rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">{initials(profile)}</div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[#020B27] truncate">{nameOf(profile)}</p>
          <p className="text-xs text-text-secondary truncate">{profile.email ?? "—"}</p>
        </div>
      </div>
      <p className="text-xs text-text-secondary mt-3">{grantedCount} droit(s) accordé(s)</p>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
        <button onClick={onConfigure} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-night text-white px-2 py-1.5 rounded-lg hover:bg-[#1e293b] transition-colors">
          <Settings2 size={13} /> Configurer
        </button>
        <button onClick={revoke} disabled={pending} className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-50" title="Retirer l'accès">
          <UserMinus size={14} />
        </button>
      </div>
    </div>
  );
}

function PermissionModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [matrix, setMatrix] = useState<PermissionMatrix>(() =>
    JSON.parse(JSON.stringify(profile.permissions ?? {}))
  );

  const isOn = (mod: string, action: string) => Boolean(matrix[mod]?.[action]);
  const toggle = (mod: string, action: string) => {
    setMatrix((prev) => {
      const next = { ...prev, [mod]: { ...(prev[mod] ?? {}) } };
      next[mod][action] = !next[mod][action];
      return next;
    });
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      const res = await adminUpdateEmployeePermissions(profile.id, matrix);
      if (res?.error) setError(res.error);
      else { router.refresh(); onClose(); }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-[#020B27]">Permissions — {nameOf(profile)}</h2>
            <p className="text-xs text-text-secondary">Cochez les droits accordés à cet employé</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-[#020B27] transition-colors"><X size={20} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Matrice module × action */}
          <div className="overflow-x-auto border border-gray-100 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left text-xs text-text-secondary font-medium py-2.5 px-3">Module</th>
                  {PERMISSION_ACTIONS.map((a) => (
                    <th key={a} className="text-center text-xs text-text-secondary font-medium py-2.5 px-2 w-16">{PERMISSION_ACTION_LABELS[a]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {PERMISSION_MODULES.map((m) => (
                  <tr key={m.key} className="hover:bg-gray-50/50">
                    <td className="py-2 px-3 font-medium text-[#020B27]">{m.label}</td>
                    {PERMISSION_ACTIONS.map((a) => (
                      <td key={a} className="text-center py-2 px-2">
                        <input
                          type="checkbox"
                          checked={isOn(m.key, a)}
                          onChange={() => toggle(m.key, a)}
                          className="accent-green w-4 h-4 cursor-pointer"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Permissions sensibles */}
          <div>
            <h3 className="text-sm font-semibold text-[#020B27] flex items-center gap-1.5 mb-2">
              <ShieldAlert size={15} className="text-orange-500" /> Permissions sensibles
            </h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {SENSITIVE_PERMISSIONS.map((s) => (
                <label key={s.key} className="flex items-center gap-2 text-sm text-[#020B27] border border-gray-100 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={isOn("sensitive", s.key)}
                    onChange={() => toggle("sensitive", s.key)}
                    className="accent-green w-4 h-4"
                  />
                  <Lock size={12} className="text-gray-400" /> {s.label}
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={save}
            disabled={pending}
            className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            {pending ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />} Enregistrer les permissions
          </button>
          <button onClick={onClose} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
        </div>
      </div>
    </div>
  );
}

function PromoteModal({ customers, onClose }: { customers: Profile[]; onClose: () => void }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? customers.filter((c) => [c.first_name, c.last_name, c.email, c.phone].filter(Boolean).some((v) => v!.toLowerCase().includes(q)))
      : customers;
    return list.slice(0, 8);
  }, [customers, search]);

  const promote = () => {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await adminUpdateUserRole(selected.id, "employee");
      if (res?.error) { setError(res.error); return; }
      // Droits par défaut d'un nouvel employé (jamais tous).
      await adminUpdateEmployeePermissions(selected.id, defaultEmployeePermissions());
      router.refresh();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#020B27]">Ajouter un employé</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#020B27] transition-colors"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {customers.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-4">Aucun client à promouvoir. L&apos;employé doit d&apos;abord créer un compte client.</p>
          ) : (
            <>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
                  placeholder="Nom, email ou téléphone…"
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
              {error && <p className="text-xs text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={promote}
                  disabled={!selected || pending}
                  className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  {pending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                  {selected ? `Nommer ${nameOf(selected)} employé` : "Sélectionnez un client"}
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

function CreateEmployeeModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ email: string; password: string } | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  const submit = (formData: FormData) => {
    setError(null);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    startTransition(async () => {
      const res = await adminCreateEmployee(formData);
      if (res?.error) setError(res.error);
      else { setDone({ email, password }); router.refresh(); }
    });
  };

  const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-[#020B27]">Créer un employé</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#020B27] transition-colors"><X size={20} /></button>
        </div>

        {done ? (
          <div className="p-5 space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <p className="text-sm font-semibold text-[#020B27] flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-green" /> Compte créé avec succès
              </p>
              <p className="text-xs text-text-secondary mb-3">
                Communiquez ces identifiants à l&apos;employé. Il pourra se connecter immédiatement.
              </p>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2">
                  <span className="text-text-secondary">Email</span>
                  <span className="font-medium text-[#020B27] break-all">{done.email}</span>
                </div>
                <div className="flex justify-between gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2">
                  <span className="text-text-secondary">Mot de passe</span>
                  <span className="font-medium text-[#020B27]">{done.password}</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-text-secondary">
              Vous pouvez maintenant configurer ses permissions depuis la carte de l&apos;employé.
            </p>
            <button onClick={onClose} className="w-full bg-green hover:bg-[#9E7A45] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors">
              Terminé
            </button>
          </div>
        ) : (
          <form action={submit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-[#020B27] mb-1.5">Prénom</label>
                <input id="first_name" name="first_name" className={inputCls} />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-[#020B27] mb-1.5">Nom</label>
                <input id="last_name" name="last_name" className={inputCls} />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#020B27] mb-1.5">Téléphone</label>
              <input id="phone" name="phone" type="tel" placeholder="612 345 678" className={inputCls} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#020B27] mb-1.5">Email <span className="text-red-500">*</span></label>
              <input id="email" name="email" type="email" required placeholder="employe@assada.ma" className={inputCls} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#020B27] mb-1.5">Mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <input id="password" name="password" type={showPwd ? "text" : "password"} required minLength={6} placeholder="Min. 6 caractères" className={`${inputCls} pr-11`} />
                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-medium">
                  {showPwd ? "Cacher" : "Voir"}
                </button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1">Ces identifiants seront à transmettre à l&apos;employé.</p>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="flex items-center gap-2 bg-green hover:bg-[#9E7A45] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                {pending ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Créer le compte
              </button>
              <button type="button" onClick={onClose} className="text-text-secondary text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Annuler</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
