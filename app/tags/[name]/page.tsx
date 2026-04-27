import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { WorkGridWithLoadMore } from "@/components/work-grid-with-load-more";
import { Badge } from "@/components/ui/badge";
import { BreadcrumbJsonLd } from "@/components/json-ld";
import { getWorksByTag, getAllTagNames, getRelatedTags } from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";

const MAX_SSG_WORKS = 100;

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const dbWorks = await getWorksByTag(decodedName);

  if (dbWorks.length === 0) {
    return { title: "タグが見つかりません" };
  }

  const works = dbWorks.map(dbWorkToWork);
  const ratedWorks = works.filter((w) => w.ratingDlsite !== null && w.ratingDlsite !== undefined);
  const avgRating =
    ratedWorks.length > 0
      ? (ratedWorks.reduce((s, w) => s + (w.ratingDlsite ?? 0), 0) / ratedWorks.length).toFixed(1)
      : null;
  const saleCount = works.filter((w) => w.isOnSale).length;
  const topCircles = Array.from(
    new Set(works.slice(0, 10).map((w) => w.circleName).filter(Boolean))
  ).slice(0, 5);

  // layout.tsx の template "%s | とろあま" が自動付与される
  const title = `${decodedName}の女性向けASMR・乙女ゲームおすすめ${dbWorks.length}選 レビュー・感想・セール情報`;
  const ratingText = avgRating ? `平均評価★${avgRating}。` : "";
  const saleText = saleCount > 0 ? `セール中${saleCount}作品。` : "";
  const circleText = topCircles.length > 0 ? `人気サークルは${topCircles.join("・")}など。` : "";
  const description = `「${decodedName}」ジャンルの女性向けASMR・TL・乙女ゲーム${dbWorks.length}作品を厳選レビュー。${ratingText}${saleText}${circleText}DLsite・FANZAで人気の${decodedName}作品の評価・あらすじ・感想を毎日更新。`.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/tags/${name}/` },
    openGraph: { title, description, type: "website" },
  };
}

export async function generateStaticParams() {
  const names = await getAllTagNames();
  return names.map((name) => ({ name }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export default async function TagDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const [dbWorks, relatedTags] = await Promise.all([
    getWorksByTag(decodedName),
    getRelatedTags(decodedName, 10),
  ]);

  if (dbWorks.length === 0) {
    notFound();
  }

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
  const topCircles = Array.from(
    new Set(allWorks.slice(0, 10).map((w) => w.circleName).filter(Boolean))
  ).slice(0, 5);

  const breadcrumbItems = [
    { label: "トップ", href: "/" },
    { label: "タグ", href: "/tags" },
    { label: decodedName },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        <h1 className="mb-1 text-2xl font-bold text-foreground font-heading">
          #{decodedName} の女性向けASMR・乙女ゲームおすすめ{totalCount}選
        </h1>
        <p className="mb-3 text-sm text-muted-foreground">
          {totalCount}作品 / レビュー・感想・セール情報
        </p>
        {/* SEOリード文 */}
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          「<span className="font-semibold text-foreground">{decodedName}</span>」ジャンルの女性向けASMR・TL・乙女ゲーム作品
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
          {topCircles.length > 0 && (
            <>
              人気サークルは<span className="text-foreground">{topCircles.join("・")}</span>など。
            </>
          )}
          DLsite・FANZAで人気の{decodedName}ジャンル作品の評価・あらすじ・感想を毎日更新中。
        </p>

        {/* 関連タグ */}
        {relatedTags.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">関連タグ</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                >
                  <Badge
                    variant="tag"
                    className="cursor-pointer hover:opacity-80"
                  >
                    {tag.name}
                    <span className="ml-1 opacity-70">({tag.count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

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
          <p className="text-muted-foreground">作品がありません。</p>
        )}
      </main>

      <Footer />
    </div>
  );
}
