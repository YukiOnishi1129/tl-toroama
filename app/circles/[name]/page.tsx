import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { WorkGridWithLoadMore } from "@/components/work-grid-with-load-more";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BreadcrumbJsonLd } from "@/components/json-ld";
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
    return { title: "サークルが見つかりません" };
  }

  const works = dbWorks.map(dbWorkToWork);
  const ratedWorks = works.filter((w) => w.ratingDlsite !== null && w.ratingDlsite !== undefined);
  const avgRating =
    ratedWorks.length > 0
      ? (ratedWorks.reduce((s, w) => s + (w.ratingDlsite ?? 0), 0) / ratedWorks.length).toFixed(1)
      : null;
  const saleCount = works.filter((w) => w.isOnSale).length;
  const topActors = Array.from(
    new Set(works.slice(0, 10).flatMap((w) => w.actors || []).filter(Boolean))
  ).slice(0, 5);

  // layout.tsx の template "%s | とろあま" が自動付与される
  const title = `${decodedName}の女性向けASMR・乙女ゲームおすすめ${dbWorks.length}選 レビュー・感想・セール情報`;
  const ratingText = avgRating ? `平均評価★${avgRating}。` : "";
  const saleText = saleCount > 0 ? `セール中${saleCount}作品。` : "";
  const actorText = topActors.length > 0 ? `人気CVは${topActors.join("・")}など。` : "";
  const description = `サークル「${decodedName}」の女性向けASMR・TL・乙女ゲーム${dbWorks.length}作品を厳選レビュー。${ratingText}${saleText}${actorText}DLsite・FANZAで人気の${decodedName}作品の評価・あらすじ・感想を毎日更新。`.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/circles/${name}/` },
    openGraph: { title, description, type: "website" },
  };
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

  const allWorks = dbWorks.map(dbWorkToWork);
  const ratedWorks = allWorks.filter((w) => w.ratingDlsite !== null && w.ratingDlsite !== undefined);
  const avgRating =
    ratedWorks.length > 0
      ? ratedWorks.reduce((s, w) => s + (w.ratingDlsite ?? 0), 0) / ratedWorks.length
      : null;
  const saleCount = allWorks.filter((w) => w.isOnSale).length;
  const topActors = Array.from(
    new Set(allWorks.slice(0, 10).flatMap((w) => w.actors || []).filter(Boolean))
  ).slice(0, 5);

  const breadcrumbItems = [
    { label: "トップ", href: "/" },
    { label: "サークル", href: "/circles" },
    { label: circle.name },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-foreground font-heading">
            {circle.name}の女性向けASMR・乙女ゲームおすすめ{totalCount}選
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalCount}作品 / レビュー・感想・セール情報
          </p>
          {/* SEOリード文 */}
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            サークル<span className="font-semibold text-foreground">「{circle.name}」</span>の女性向けASMR・TL・乙女ゲーム作品
            <span className="font-semibold text-foreground">{totalCount}作品</span>を厳選レビュー。
            {avgRating !== null && (
              <>
                平均評価
                <span className="font-semibold text-foreground">★{avgRating.toFixed(1)}</span>
                。
              </>
            )}
            {saleCount > 0 && (
              <>
                現在<span className="font-semibold text-foreground">{saleCount}作品がセール中</span>。
              </>
            )}
            {topActors.length > 0 && (
              <>
                人気CVは<span className="text-foreground">{topActors.join("・")}</span>など。
              </>
            )}
            DLsite・FANZAで人気の{circle.name}作品の評価・あらすじ・感想を毎日更新中。
          </p>
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
