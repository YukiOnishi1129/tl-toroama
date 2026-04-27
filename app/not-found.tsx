import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Search, TrendingUp, Sparkles, Mic, Tag } from "lucide-react";

export const metadata = {
  title: "ページが見つかりません",
  description:
    "お探しのページは移動または削除された可能性があります。トップページや人気ランキング・特集ページから女性向けASMR・乙女ゲームを探してください。",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="text-center">
          <p className="text-6xl font-bold text-primary mb-4">404</p>
          <h1 className="text-2xl font-bold text-foreground font-heading mb-2">
            ページが見つかりません
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            お探しのページは削除されたか、URLが間違っている可能性があります。
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
        </div>

        {/* 行き先候補（離脱防止） */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-bold text-foreground font-heading">
            こちらから探してみてください
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/search">
              <Card className="hover:border-primary/50 transition-all">
                <CardContent className="flex items-center gap-3 p-4">
                  <TrendingUp className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground">作品ランキング</div>
                    <div className="text-xs text-muted-foreground">人気のASMR・乙女ゲーム</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/sale">
              <Card className="hover:border-orange-500/50 transition-all">
                <CardContent className="flex items-center gap-3 p-4">
                  <Sparkles className="h-6 w-6 text-orange-500 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground">セール中の作品</div>
                    <div className="text-xs text-muted-foreground">お得に買える作品</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/cv">
              <Card className="hover:border-purple-500/50 transition-all">
                <CardContent className="flex items-center gap-3 p-4">
                  <Mic className="h-6 w-6 text-purple-500 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground">声優一覧</div>
                    <div className="text-xs text-muted-foreground">人気CVから探す</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/tags">
              <Card className="hover:border-blue-500/50 transition-all">
                <CardContent className="flex items-center gap-3 p-4">
                  <Tag className="h-6 w-6 text-blue-500 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-foreground">ジャンル・タグ</div>
                    <div className="text-xs text-muted-foreground">ジャンル別に探す</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* 特集ページへの誘導 */}
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-foreground font-heading">人気の特集</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <Link href="/tokushu/seiheki">
              <Card className="hover:border-primary/50 transition-all">
                <CardContent className="p-4">
                  <div className="text-sm font-bold text-foreground">🎯 ジャンル特集</div>
                  <div className="mt-1 text-xs text-muted-foreground">耳舐め・甘々など人気ジャンル</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/tokushu/cv">
              <Card className="hover:border-purple-500/50 transition-all">
                <CardContent className="p-4">
                  <div className="text-sm font-bold text-foreground">🎤 声優特集</div>
                  <div className="mt-1 text-xs text-muted-foreground">人気声優の出演作まとめ</div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/circles">
              <Card className="hover:border-pink-500/50 transition-all">
                <CardContent className="p-4">
                  <div className="text-sm font-bold text-foreground">🎨 サークル一覧</div>
                  <div className="mt-1 text-xs text-muted-foreground">人気サークルから探す</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
