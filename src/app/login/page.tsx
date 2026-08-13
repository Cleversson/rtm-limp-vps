import Image from "next/image";
import logoCompleto from "@/assets/logo-completo.png";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <Image
          src={logoCompleto}
          alt="RTM Limp"
          className="h-20 w-auto dark:rounded-md dark:bg-white dark:p-2"
          priority
        />

        <LoginForm error={params.error} message={params.message} />
      </div>
    </div>
  );
}
