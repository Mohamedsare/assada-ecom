"use client";

import { useState, useMemo, useTransition } from "react";
import { MessageSquare, Mail, Trash2, MailOpen, Inbox } from "lucide-react";
import { adminMarkMessageRead, adminDeleteMessage } from "@/lib/supabase/actions";
import { formatDate } from "@/lib/utils";
import type { ContactMessage } from "@/types";

export default function MessagesContent({ messages }: { messages: ContactMessage[] }) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = useMemo(() => messages.filter((m) => !m.is_read).length, [messages]);
  const list = filter === "unread" ? messages.filter((m) => !m.is_read) : messages;

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#020B27]">Messages</h1>
        <p className="text-text-secondary text-sm mt-0.5">{messages.length} message(s) · {unread} non lu(s)</p>
      </div>

      <div className="flex gap-1.5 mb-4">
        {([["all", `Tous (${messages.length})`], ["unread", `Non lus (${unread})`]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${filter === k ? "bg-night text-white" : "bg-white border border-gray-200 text-text-secondary hover:bg-gray-50"}`}>
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-100 p-16 text-center">
          <Inbox size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="font-semibold text-[#020B27]">Aucun message</p>
          <p className="text-text-secondary text-sm mt-1">Les messages du formulaire de contact apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((m) => <MessageCard key={m.id} message={m} />)}
        </div>
      )}
    </div>
  );
}

function MessageCard({ message }: { message: ContactMessage }) {
  const [pending, startTransition] = useTransition();
  const [read, setRead] = useState(message.is_read);
  const [removed, setRemoved] = useState(false);
  if (removed) return null;

  const toggleRead = () => {
    const next = !read;
    setRead(next);
    startTransition(() => { adminMarkMessageRead(message.id, next); });
  };
  const remove = () => {
    if (!confirm("Supprimer ce message ?")) return;
    setRemoved(true);
    startTransition(() => { adminDeleteMessage(message.id); });
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-4 ${read ? "border-gray-100" : "border-green/30 bg-green-50/30"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {!read && <span className="w-2 h-2 rounded-full bg-green shrink-0" />}
            <p className="text-sm font-semibold text-[#020B27]">{message.name}</p>
            {message.email && <span className="text-xs text-text-secondary">· {message.email}</span>}
          </div>
          {message.subject && <p className="text-xs font-medium text-[#020B27] mt-1">Sujet : {message.subject}</p>}
        </div>
        <span className="text-[11px] text-text-secondary shrink-0">{formatDate(message.created_at)}</span>
      </div>

      <p className="text-sm text-[#020B27] mt-2 whitespace-pre-wrap">{message.message}</p>

      <div className="flex items-center gap-2 mt-3">
        {message.email && (
          <a href={`mailto:${message.email}?subject=${encodeURIComponent("Re: " + (message.subject ?? "Votre message"))}`}
            className="flex items-center gap-1 text-xs font-semibold bg-green text-[#020B27] px-3 py-1.5 rounded-lg hover:bg-[#9E7A45] transition-colors">
            <Mail size={13} /> Répondre
          </a>
        )}
        <button onClick={toggleRead} disabled={pending} className="flex items-center gap-1 text-xs font-medium text-text-secondary hover:bg-gray-100 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
          {read ? <><MessageSquare size={13} /> Marquer non lu</> : <><MailOpen size={13} /> Marquer lu</>}
        </button>
        <button onClick={remove} disabled={pending} className="flex items-center gap-1 text-xs font-medium text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg disabled:opacity-60 transition-colors">
          <Trash2 size={13} /> Supprimer
        </button>
      </div>
    </div>
  );
}
