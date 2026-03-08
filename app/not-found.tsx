import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-6xl font-bold text-primary mb-4">404</p>
        <h1 className="text-2xl font-bold text-foreground font-heading mb-2">
          ページが見つかりません
        </h1>
        <p className="text-muted-foreground mb-8">
          お探しのページは移動または削除された可能性があります。
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto">
              <Home className="h-4 w-4 mr-2" />
              トップページへ
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="outline" className="w-full sm:w-auto">
              <Search className="h-4 w-4 mr-2" />
              作品を検索
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
