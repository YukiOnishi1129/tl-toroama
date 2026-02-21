import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { WorkGridWithLoadMore } from "@/components/work-grid-with-load-more";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCircleWithWorks, getAllCircleNames } from "@/lib/db";
import { dbCircleToCircle, dbWorkToWork } from "@/lib/types";
import { notFound } from "next/navigation";

const MAX_SSG_WORKS = 100;

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const { circle: dbCircle, works: dbWorks } = await getCircleWithWorks(decodedName);

  if (!dbCircle) {
    return { title: "サークルが見つかりません | とろあま" };
  }

  const genreText = dbCircle.main_genre ? `（${dbCircle.main_genre}）` : "";
  const title = `${decodedName}${genreText}の作品一覧（${dbWorks.length}作品） | とろあま`;
  const description = `サークル「${decodedName}」のTL・乙女向けASMR＆ゲーム作品${dbWorks.length}作品を掲載。`;

  return { title, description };
}

export async function generateStaticParams() {
  const names = await getAllCircleNames();
  return names.map((name) => ({ name }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export default async function CircleDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const { circle: dbCircle, works: dbWorks } = await getCircleWithWorks(decodedName);

  if (!dbCircle) {
    notFound();
  }

  const circle = dbCircleToCircle(dbCircle);
  const totalCount = dbWorks.length;
  const limitedDbWorks = dbWorks.slice(0, MAX_SSG_WORKS);
  const works = limitedDbWorks.map(dbWorkToWork);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "サークル", href: "/circles" },
            { label: circle.name },
          ]}
        />

        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-foreground font-heading">{circle.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            {circle.mainGenre && (
              <Badge variant="secondary">{circle.mainGenre}</Badge>
            )}
            <span className="text-muted-foreground">
              {circle.workCount}作品
            </span>
          </div>

          <div className="mt-4 flex gap-3">
            {circle.dlsiteId && (
              <a
                href={`https://www.dlsite.com/girls/circle/profile/=/maker_id/${circle.dlsiteId}.html`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  DLsite
                </Button>
              </a>
            )}
            {circle.fanzaId && (
              <a
                href={`https://www.dmm.co.jp/dc/doujin/-/maker/=/article=maker/id=${circle.fanzaId}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  FANZA
                </Button>
              </a>
            )}
          </div>
        </div>

        <h2 className="mb-4 text-xl font-bold text-foreground font-heading">作品一覧</h2>

        {works.length > 0 ? (
          <>
            <WorkGridWithLoadMore works={works} />
            {totalCount > MAX_SSG_WORKS && (
              <div className="mt-6 text-center">
                <a
                  href={`/search/?q=${encodeURIComponent(decodedName)}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  検索ページで全{totalCount}件を見る
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            このサークルの作品はまだ登録されていません。
          </p>
        )}
      </main>

      <Footer />
    </div>
  );
}
