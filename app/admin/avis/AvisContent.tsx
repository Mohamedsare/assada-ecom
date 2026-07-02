"use client";

import { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import { Star, Check, X, Trash2, MessageSquare } from "lucide-react";
import { adminUpdateReviewApproval, adminDeleteReview } from "@/lib/supabase/actions";
import { formatDate } from "@/lib/utils";
import type { Review } from "@/types";

export default function AvisContent({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const stats = useMemo(() => {
    const approved = reviews.filter((r) => r.is_approved).length;
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
    return { total: reviews.length, approved, pending: reviews.length - approved, avg };
  }, [reviews]);

  const filtered = useMemo(() => reviews.filter((r) =>
    filter === "all" ? true : filter === "approved" ? r.is_approved : !r.is_approved
  ), [reviews, filter]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#020B27]">Avis clients</h1>
        <p className="text-text-secondary text-sm mt-0.5">Modérez les avis laissés sur vos produits</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Kpi label="Total avis" value={String(stats.total)} />
        <Kpi label="Approuvés" value={String(stats.approved)} accent="text-green" />
        <Kpi label="En attente" value={String(stats.pending)} accent="text-orange-600" />
        <Kpi label="Note moyenne" value={stats.avg.toFixed(1)} accent="text-yellow-500" />
      </div>

      <div className="flex gap-1.5 mb-4">
        {([["all", "Tous"], ["pending", "En attente"], ["approved", "Approuvés"]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === k ? "bg-night text-white" : "bg-white border border-gray-200 text-text-secondary hover:bg-gray-50"}`}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#020B27]">Aucun avis</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [pending, startTransition] = useTransition();
  const [removed, setRemoved] = useState(false);
  const [approved, setApproved] = useState(review.is_approved);

  if (removed) return null;

  const name = [review.profile?.first_name, review.profile?.last_name].filter(Boolean).join(" ") || "Client";

  const toggle = (value: boolean) => {
    setApproved(value);
    startTransition(() => { adminUpdateReviewApproval(review.id, value); });
  };
  const remove = () => {
    if (!confirm("Supprimer cet avis ?")) return;
    setRemoved(true);
    startTransition(() => { adminDeleteReview(review.id); });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex gap-4">
      <div className="relative w-14 h-14 bg-[#F8FAFC] rounded-lg overflow-hidden shrink-0 border border-gray-100">
        {review.product?.main_image_url
          ? <Image src={review.product.main_image_url} alt={review.product.name} fill className="object-contain p-1" sizes="56px" />
          : <div className="w-full h-full flex items-center justify-center text-xl">📦</div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#020B27] truncate">{review.product?.name ?? "Produit supprimé"}</p>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${approved ? "bg-green-50 text-green" : "bg-orange-50 text-orange-600"}`}>
            {approved ? "Approuvé" : "En attente"}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star key={n} size={13} className={n <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
            ))}
          </div>
          <span className="text-xs text-text-secondary">par {name} · {formatDate(review.created_at)}</span>
        </div>
        {review.comment && <p className="text-sm text-[#020B27] mt-2">{review.comment}</p>}

        <div className="flex items-center gap-2 mt-3">
          {!approved ? (
            <button onClick={() => toggle(true)} disabled={pending} className="flex items-center gap-1 text-xs font-semibold bg-green text-[#020B27] px-3 py-1.5 rounded-lg hover:bg-[#9E7A45] disabled:opacity-60 transition-colors">
              <Check size={13} /> Approuver
            </button>
          ) : (
            <button onClick={() => toggle(false)} disabled={pending} className="flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors">
              <X size={13} /> Retirer
            </button>
          )}
          <button onClick={remove} disabled={pending} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
            <Trash2 size={13} /> Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, accent = "text-[#020B27]" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <p className={`text-2xl font-extrabold ${accent}`}>{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  );
}
