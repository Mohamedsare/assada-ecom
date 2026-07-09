"use client";

import { useState } from "react";

/**
 * Formulaire d'inscription à la newsletter (front only pour l'instant).
 * NB : l'email n'est pas encore persisté — à brancher sur une table
 * `newsletter_subscribers` + server action si souhaité.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  if (subscribed) {
    return <p className="text-[#D8B778] text-sm font-semibold">✓ Merci, vous êtes bien inscrit !</p>;
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSubscribed(true); }}
      className="flex items-center gap-4"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Entrez votre email *"
        aria-label="Votre adresse email"
        className="min-w-0 flex-1 h-14 rounded-full bg-white px-6 text-[15px] text-[#020B27] placeholder-[#64748B] outline-none focus:ring-2 focus:ring-[#B8925A]"
      />
      <button
        type="submit"
        className="shrink-0 text-base font-bold text-white hover:text-[#B8925A] transition-colors"
      >
        S&apos;abonner
      </button>
    </form>
  );
}
