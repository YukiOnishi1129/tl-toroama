import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getFeatureRecommendationBySlug,
  getAllFeatureRecommendationSlugs,
  getAllFeatureRecommendations,
  getWorksByIds,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import type { Work } from "@/lib/types";
import {
  Star,
  Clock,
  Headphones,
  Gamepad2,
  Play,
  ExternalLink,
  ThumbsUp,
  Users,
  Sparkles,
  ChevronRight,
  Heart,
  Search,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeaturedBanners } from "@/components/featured-banners";
import { AffiliateLink } from "@/components/affiliate-link";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const slugs = await getAllFeatureRecommendationSlugs();
    console.log(
      `[Seiheki Tokushu] generateStaticParams: ${slugs.length} features found`,
    );
    if (slugs.length === 0) {
      return [{ slug: "__placeholder__" }];
    }
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error("[Seiheki Tokushu] Error in generateStaticParams:", error);
    return [{ slug: "__placeholder__" }];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const feature = await getFeatureRecommendationBySlug(slug);

  if (!feature) {
    return { title: "性癖特集 | とろあま" };
  }

  const totalRecommended = (feature.asmr_works?.length || 0) + (feature.game_works?.length || 0);
  const title = `${feature.name}特集 - おすすめ女性向け作品厳選${totalRecommended}作品 | とろあま`;
  const description =
    feature.description ||
    `${feature.name}の女性向けASMR＆ゲーム作品を厳選。迷ったらここから選べばハズレなし。`;
  const ogImage = feature.thumbnail_url || undefined;
  const keywords = [
    feature.name,
    `${feature.name} TL`,
    `${feature.name} ASMR`,
    `${feature.name} おすすめ`,
    `${feature.name} 乙女`,
    "女性向け ASMR",
    "乙女ゲーム",
  ];

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage && { images: [{ url: ogImage }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

function formatPrice(price: number): string {
  return `\u00A5${price.toLocaleString()}`;
}

// FANZA優先（報酬率が高いため）
function getSampleUrl(work: Work): string | null {
  if (work.fanzaUrl) {
    return work.fanzaUrl;
  }
  if (work.dlsiteProductId) {
    return `https://www.dlsite.com/girls/work/=/product_id/${work.dlsiteProductId}.html`;
  }
  return null;
}

function getCategoryIcon(work: Work) {
  if (work.category === "ゲーム") {
    return <Gamepad2 className="h-3 w-3 mr-1" />;
  }
  return <Headphones className="h-3 w-3 mr-1" />;
}

function getCategoryLabel(work: Work) {
  if (work.category === "ゲーム") return "ゲーム";
  return "ASMR";
}

function RecommendationCard({
  work,
  reason,
  targetAudience,
  rank,
}: {
  work: Work;
  reason: string;
  targetAudience: string;
  rank: number;
}) {
  const rating = work.ratingDlsite || work.ratingFanza || 0;
  const reviewCount = work.reviewCountDlsite || work.reviewCountFanza || 0;
  const originalPrice = work.priceDlsite || work.priceFanza || 0;
  const salePrice = work.lowestPrice || originalPrice;
  const sampleUrl = getSampleUrl(work);

  return (
    <Card className="overflow-hidden border border-border hover:border-primary/50 transition-all">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                rank === 1
                  ? "bg-amber-500 text-white"
                  : rank === 2
                    ? "bg-gray-400 text-white"
                    : rank === 3
                      ? "bg-amber-700 text-white"
                      : "bg-muted text-muted-foreground"
              }`}
            >
              {rank}
            </div>
            <Badge variant="secondary" className="text-xs">
              {getCategoryIcon(work)}
              {getCategoryLabel(work)}
            </Badge>
          </div>
          {work.isOnSale && work.maxDiscountRate && (
            <Badge variant="sale" className="text-xs">
              {work.maxDiscountRate}%OFF
            </Badge>
          )}
        </div>

        <Link href={`/works/${work.id}`}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted mb-3">
            <img
              src={
                work.thumbnailUrl ||
                "https://placehold.co/400x225/fff8f6/8b7d72?text=No"
              }
              alt={work.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            {work.category === "ゲーム"
              ? work.killerWords.playTimeHours && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    <Clock className="h-3 w-3" />
                    {work.killerWords.playTimeHours}時間
                  </div>
                )
              : work.killerWords.durationMinutes && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    <Clock className="h-3 w-3" />
                    {work.killerWords.durationMinutes}分
                  </div>
                )}
          </div>

          <h3 className="text-base font-bold line-clamp-2 text-foreground hover:text-primary transition-colors mb-2">
            {work.title}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-3">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${
                      star <= Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-amber-500">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviewCount}件)
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            {work.isOnSale &&
              work.maxDiscountRate &&
              work.maxDiscountRate > 0 && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            <span
              className={`text-lg font-bold ${work.isOnSale ? "text-sale" : "text-foreground"}`}
            >
              {formatPrice(salePrice)}
            </span>
          </div>
        </div>

        <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">
              おすすめポイント
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{reason}</p>
        </div>

        <div className="mb-3 p-3 bg-card rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">
              こんな人におすすめ
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {targetAudience}
          </p>
        </div>

        <div className="flex gap-2">
          {sampleUrl && (
            <AffiliateLink
              platform={work.fanzaUrl ? "fanza" : "dlsite"}
              url={sampleUrl}
              workId={work.id}
              size="sm"
              className="flex-1 w-full text-xs font-bold"
            >
              <Play className="h-3 w-3 mr-1" />
              試聴してみる
              <ExternalLink className="h-3 w-3 ml-1" />
            </AffiliateLink>
          )}
          <Link href={`/works/${work.id}`} className="flex-1">
            <Button
              size="sm"
              className="w-full bg-sale hover:bg-sale/90 text-white text-xs font-bold"
            >
              詳細を見る
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}

export default async function SeihekiTokushuPage({ params }: Props) {
  const { slug } = await params;
  const feature = await getFeatureRecommendationBySlug(slug);

  if (!feature) {
    notFound();
  }

  const asmrWorkIds = (feature.asmr_works || []).map((w) => w.work_id);
  const gameWorkIds = (feature.game_works || []).map((w) => w.work_id);

  const [
    asmrDbWorks,
    gameDbWorks,
    saleFeature,
    recommendation,
    allFeatures,
  ] = await Promise.all([
    getWorksByIds(asmrWorkIds),
    getWorksByIds(gameWorkIds),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getAllFeatureRecommendations(),
  ]);

  const recommendationFirstWorkId =
    recommendation?.asmr_works?.[0]?.work_id ||
    recommendation?.game_works?.[0]?.work_id;
  const [saleFeatureMainWork, recommendationFirstWork] = await Promise.all([
    saleFeature?.main_work_id ? getWorkById(saleFeature.main_work_id) : null,
    recommendationFirstWorkId ? getWorkById(recommendationFirstWorkId) : null,
  ]);

  const asmrWorks = asmrDbWorks.map(dbWorkToWork);
  const gameWorks = gameDbWorks.map(dbWorkToWork);

  const asmrRecMap = new Map(
    (feature.asmr_works || []).map((r) => [r.work_id, r]),
  );
  const gameRecMap = new Map(
    (feature.game_works || []).map((r) => [r.work_id, r]),
  );

  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || null;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate =
    saleFeatureMainWork?.sale_end_date_dlsite ||
    saleFeatureMainWork?.sale_end_date_fanza;
  const saleMaxDiscountRate = saleFeature?.max_discount_rate;
  const recommendationThumbnail =
    recommendationFirstWork?.thumbnail_url || null;
  const recommendationDate = recommendation?.target_date;

  const otherFeatures = allFeatures
    .filter((f) => f.slug !== feature.slug)
    .slice(0, 6);

  const formatUpdatedAt = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "性癖特集", href: "/tokushu/seiheki" },
            { label: feature.name },
          ]}
        />

        {/* ヘッダー */}
        <div className="mb-6 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-heading">
                {feature.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                性癖・ジャンル別特集
              </p>
            </div>
          </div>

          {/* 統計バッジ */}
          <div className="flex flex-wrap gap-2 mb-4">
            {feature.asmr_count > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Headphones className="h-3 w-3 mr-1" />
                ASMR {feature.asmr_count}作品
              </Badge>
            )}
            {feature.game_count > 0 && (
              <Badge variant="secondary" className="text-xs">
                <Gamepad2 className="h-3 w-3 mr-1" />
                ゲーム {feature.game_count}作品
              </Badge>
            )}
          </div>

          {/* ヘッドライン */}
          <div className="p-4 bg-linear-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary">
                今週のおすすめ
              </span>
            </div>
            <p className="text-base font-bold text-foreground">
              {feature.headline ||
                `${feature.name}のTL作品、厳選おすすめ`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {feature.description ||
                `${feature.name}の作品から迷ったらこれを選べ。`}
            </p>
            {feature.posted_at && (
              <p className="text-xs text-muted-foreground mt-2">
                {formatUpdatedAt(feature.posted_at)} 更新
              </p>
            )}
          </div>
        </div>

        {/* ASMR部門 */}
        {asmrWorks.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Headphones className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground font-heading">
                ASMR部門
              </h2>
              <Badge variant="secondary" className="text-xs">
                {asmrWorks.length}作品
              </Badge>
            </div>
            <div className="grid gap-4">
              {asmrWorks.map((work, index) => {
                const rec = asmrRecMap.get(work.id);
                return (
                  <RecommendationCard
                    key={work.id}
                    work={work}
                    reason={
                      rec?.reason ||
                      work.aiRecommendReason ||
                      "人気の作品です"
                    }
                    targetAudience={
                      rec?.target_audience ||
                      work.aiTargetAudience ||
                      "この作品に興味がある人"
                    }
                    rank={index + 1}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ゲーム部門 */}
        {gameWorks.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground font-heading">
                ゲーム部門
              </h2>
              <Badge variant="secondary" className="text-xs">
                {gameWorks.length}作品
              </Badge>
            </div>
            <div className="grid gap-4">
              {gameWorks.map((work, index) => {
                const rec = gameRecMap.get(work.id);
                return (
                  <RecommendationCard
                    key={work.id}
                    work={work}
                    reason={
                      rec?.reason ||
                      work.aiRecommendReason ||
                      "人気の作品です"
                    }
                    targetAudience={
                      rec?.target_audience ||
                      work.aiTargetAudience ||
                      "この作品に興味がある人"
                    }
                    rank={index + 1}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* このジャンルの作品をもっと見る */}
        <div className="mt-8 mb-10">
          <Link href={`/search?q=${encodeURIComponent(feature.name)}`}>
            <Card className="overflow-hidden border-2 border-primary hover:border-primary/80 transition-all bg-linear-to-r from-primary/10 to-primary/5">
              <div className="flex items-center justify-between p-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">
                      「{feature.name}」の作品をもっと見る
                    </p>
                    <p className="text-sm text-muted-foreground">
                      検索ページで絞り込み・並び替え
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-primary font-bold">
                  <span className="text-sm hidden sm:inline">検索</span>
                  <ChevronRight className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* 他の性癖特集 */}
        {otherFeatures.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-bold text-foreground font-heading">
                他の性癖特集
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {otherFeatures.map((f) => (
                <Link
                  key={f.slug}
                  href={`/tokushu/seiheki/${f.slug}`}
                >
                  <Card className="overflow-hidden border border-border hover:border-primary/50 transition-all">
                    <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={
                          f.thumbnail_url ||
                          "https://placehold.co/200x112/fff8f6/8b7d72?text=TL"
                        }
                        alt={f.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-bold text-foreground truncate">
                        {f.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {f.asmr_count + f.game_count}作品
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/tokushu/seiheki">
                <Button variant="outline" size="sm">
                  全ての性癖特集を見る
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </section>
        )}

        {/* 他のコンテンツへの誘導 */}
        <section className="mt-10">
          <FeaturedBanners
            saleThumbnail={saleThumbnail}
            saleMaxDiscountRate={saleMaxDiscountRate}
            saleTargetDate={saleTargetDate}
            mainWorkSaleEndDate={mainWorkSaleEndDate}
            recommendationThumbnail={recommendationThumbnail}
            recommendationDate={recommendationDate}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
