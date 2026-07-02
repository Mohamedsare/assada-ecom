import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const next = searchParams.get("next") ?? "/compte";

  // Google (ou l'utilisateur) a refusé / annulé la connexion
  if (oauthError) {
    return NextResponse.redirect(`${origin}/connexion?error=oauth`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const user = data.user;
      const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;

      // Récupérer le profil (créé automatiquement par le trigger SQL)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();

      // Compléter le profil avec les informations Google manquantes
      const fullName = meta.full_name ?? meta.name ?? "";
      const updates: Record<string, string> = {};

      if (!profile?.first_name) {
        const firstName = meta.given_name ?? fullName.split(" ")[0];
        if (firstName) updates.first_name = firstName;
      }
      if (!profile?.last_name) {
        const lastName =
          meta.family_name ?? fullName.split(" ").slice(1).join(" ");
        if (lastName) updates.last_name = lastName;
      }
      if (!profile?.avatar_url) {
        const avatar = meta.avatar_url ?? meta.picture;
        if (avatar) updates.avatar_url = avatar;
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from("profiles").update(updates).eq("id", user.id);
      }

      // Rediriger le staff (admin/employé) vers l'espace admin, sinon la destination demandée
      const destination =
        ["admin", "super_admin", "employee"].includes(profile?.role ?? "")
          ? "/admin"
          : next;

      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/connexion?error=callback`);
}
