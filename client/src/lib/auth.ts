import { supabase } from "./supabase";

/**
 * Trigger Supabase sign-in. Redirects to Google OAuth.
 * @param redirectPath - Path to redirect to after login (e.g. "/dashboard"). Defaults to "/".
 */
export async function signIn(redirectPath = "/") {
  if (!supabase) {
    window.alert("Auth not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
    return;
  }
  const redirectTo = `${window.location.origin}${redirectPath.startsWith("/") ? redirectPath : `/${redirectPath}`}`;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
}
