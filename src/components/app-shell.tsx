import Link from "next/link";
import {
  Archive,
  BookOpen,
  Brain,
  Settings2,
} from "lucide-react";

import { MainNav } from "./main-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const today = new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(new Date());
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );

  return (
    <div className="min-h-screen bg-[#f6f7f4] text-[#1d211f]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col lg:flex-row">
        <aside className="border-b border-[#dfe4dd] bg-[#10231f] px-5 py-5 text-white lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:border-[#203b35]">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-[#b7ead9] text-[#10231f]">
              <Brain size={22} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-lg font-semibold leading-5">
                Signalmind
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-[#9fcabe]">
                AI prehled
              </span>
            </span>
          </Link>

          <MainNav />

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3 text-sm text-[#d7ebe5]">
              <Archive size={18} />
              <span>Archiv: Supabase</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm text-[#d7ebe5]">
              <BookOpen size={18} />
              <span>{hasSupabase ? "Zivy archiv" : "Demo rezim"}</span>
            </div>
            <div className="mt-3 flex items-center gap-3 text-sm text-[#d7ebe5]">
              <Settings2 size={18} />
              <span>{hasSupabase ? "Supabase aktivni" : "Supabase pripraveno"}</span>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex flex-col gap-4 border-b border-[#dfe4dd] bg-white/80 px-5 py-5 backdrop-blur md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="text-sm font-medium text-[#65716b]">
                Osobni prehled AI novinek
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#1d211f]">
                Vyber relevantnich AI novinek
              </h1>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-lg border border-[#dfe4dd] bg-[#f6f7f4] px-3 py-2 text-[#40524b]">
                {today}
              </span>
              <span className="rounded-lg bg-[#ffe6a6] px-3 py-2 font-medium text-[#553b00]">
                Beta provoz
              </span>
            </div>
          </header>
          <main className="flex-1 px-5 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
