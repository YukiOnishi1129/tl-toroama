import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/50 py-8">
      <div className="mx-auto max-w-7xl px-6 text-center text-sm text-foreground/60">
        <p className="mb-2 font-heading">とろあま - TL・乙女向け作品まとめ</p>
        <div className="mb-4 flex justify-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            プライバシーポリシー
          </Link>
        </div>
        <p className="mt-4 text-xs text-foreground/40">
          Powered by{" "}
          <a
            href="https://affiliate.dmm.com/api/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground/60"
          >
            FANZA Webサービス
          </a>
        </p>
      </div>
    </footer>
  );
}
