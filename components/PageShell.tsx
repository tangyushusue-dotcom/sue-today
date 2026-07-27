import Link from "next/link";

export function PageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="relative z-10 mx-auto max-w-3xl px-5 pb-16 pt-8 sm:pt-12">
      <div className="blob bg-rose/30 h-72 w-72 -top-16 -left-20" />
      <div className="blob bg-sky/20 h-64 w-64 bottom-10 right-10" />

      <header className="fade-up flex items-center gap-3">
        <Link
          href="/"
          aria-label="返回首页"
          className="grid h-9 w-9 place-items-center rounded-2xl bg-white/70 text-muted shadow-card transition hover:text-ink"
        >
          ←
        </Link>
        <h1 className="font-serif text-xl font-medium">{title}</h1>
      </header>

      <div className="mt-8">{children}</div>
    </main>
  );
}
