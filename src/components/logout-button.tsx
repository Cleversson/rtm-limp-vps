"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }
  return (
    <button onClick={handleLogout}
      className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      Sair da conta
    </button>
  );
}