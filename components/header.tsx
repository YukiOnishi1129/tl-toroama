import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* ロゴ */}
        <Link href="/" className="flex flex-col">
          <span className="text-lg font-bold md:text-xl font-heading">
            <span className="text-primary">とろ</span>
            <span className="text-foreground">あま</span>
          </span>
          <span className="text-[9px] text-muted-foreground md:text-[10px]">
            TL・乙女向けASMR＆ゲームまとめ
          </span>
        </Link>

        {/* ナビゲーション */}
        <nav className="hidden items-center gap-8 lg:flex">
          <NavLink href="/sale">セール</NavLink>
          <NavLink href="/recommendations">おすすめ</NavLink>
          <NavLink href="/search">検索</NavLink>
          <NavLink href="/circles">サークル</NavLink>
          <NavLink href="/cv">声優</NavLink>
          <NavLink href="/tags">タグ</NavLink>
        </nav>

        {/* 検索リンク（モバイル） */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/search"
            className="rounded-full bg-secondary p-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors",
        "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
