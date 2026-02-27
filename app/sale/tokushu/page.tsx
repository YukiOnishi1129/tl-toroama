import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HorizontalScrollSection } from "@/components/horizontal-scroll-section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSaleWorks,
  getLatestSaleFeature,
  getWorkById,
  getWorksByIds,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import type { Work } from "@/lib/types";
import { AffiliateLink } from "@/components/affiliate-link";
import Link from "next/link";
import {
  Flame,
  Sparkles,
  Star,
  Tag,
  Play,
  ExternalLink,
  Clock,
  Headphones,
  Gamepad2,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const saleFeature = await getLatestSaleFeature();

  const title = "セール特集 | とろあま";
  const description = saleFeature?.main_headline
    ? `${saleFeature.main_headline} - セール中のおすすめTL・乙女作品を厳選。迷ったらここから選べばハズレなし。`
    : "今お得に買えるTL・乙女向けASMR＆ゲーム作品をまとめてチェック。割引率・価格順で並び替え可能。";

  const ogpImageUrl = saleFeature?.ogp_image_url || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogpImageUrl
        ? [{ url: ogpImageUrl, width: 1200, height: 630 }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogpImageUrl ? [ogpImageUrl] : [],
    },
  };
}

export const dynamic = "force-static";

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function getSampleUrl(work: Work): string | null {
  if (work.dlsiteProductId) {
    return `https://www.dlsite.com/girls/work/=/product_id/${work.dlsiteProductId}.html`;
  }
  if (work.fanzaUrl) {
    return work.fanzaUrl;
  }
  return null;
}

// メイン特集カード
function FeaturedWorkCard({
  work,
  headline,
  reason,
  label,
}: {
  work: Work;
  headline?: string | null;
  reason?: string | null;
  label: string;
}) {
  const rating = work.ratingDlsite || work.ratingFanza || 0;
  const reviewCount = work.reviewCountDlsite || work.reviewCountFanza || 0;
  const originalPrice = work.priceDlsite || work.priceFanza || 0;
  const salePrice = work.lowestPrice || originalPrice;
  const sampleUrl = getSampleUrl(work);
  const isASMR = work.category === "ASMR";

  return (
    <Card className="overflow-hidden border-2 border-primary/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-linear-to-r from-primary to-accent text-white border-0 text-xs">
            {label}
          </Badge>
          {work.isOnSale && work.maxDiscountRate && (
            <Badge variant="sale" className="text-xs">
              {work.maxDiscountRate}%OFF
            </Badge>
          )}
        </div>

        {headline && (
          <p className="text-sm font-bold text-primary mb-2">{headline}</p>
        )}

        <Link href={`/works/${work.id}`}>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted mb-3">
            <img
              src={
                work.thumbnailUrl ||
                "https://placehold.co/400x225/fff8f6/8b7d72?text=No+Image"
              }
              alt={work.title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            <div className="absolute bottom-2 right-2 flex gap-1">
              {work.killerWords.durationMinutes && (
                <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3" />
                  {work.killerWords.durationMinutes}分
                </div>
              )}
              {work.killerWords.playTimeHours && (
                <div className="flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <Clock className="h-3 w-3" />
                  {work.killerWords.playTimeHours}時間
                </div>
              )}
            </div>
          </div>
          <h3 className="text-base font-bold line-clamp-2 text-foreground hover:text-primary transition-colors mb-2">
            {work.title}
          </h3>
        </Link>

        {/* 評価・価格 */}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-500">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({reviewCount}件)
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            {work.isOnSale && originalPrice > salePrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span
              className={`text-lg font-bold ${work.isOnSale ? "text-red-500" : "text-foreground"}`}
            >
              {formatPrice(salePrice)}
            </span>
          </div>
        </div>

        {reason && (
          <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground leading-relaxed">{reason}</p>
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-2">
          {sampleUrl && (
            <AffiliateLink
              platform={work.dlsiteProductId ? "dlsite" : "fanza"}
              url={sampleUrl}
              workId={work.id}
              size="sm"
              variant="outline"
              className="flex-1 w-full text-xs font-bold border-2 border-cta text-cta hover:bg-cta/10"
            >
              <Play className="h-3 w-3 mr-1" />
              {isASMR ? "試聴してみる" : "体験版で遊ぶ"}
              <ExternalLink className="h-3 w-3 ml-1" />
            </AffiliateLink>
          )}
          <Link href={`/works/${work.id}`} className="flex-1">
            <button className="w-full rounded-xl bg-cta hover:bg-cta-hover text-white text-xs font-bold py-2 px-3 transition-colors shadow-sm">
              詳細を見る
            </button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SalePage() {
  const [dbSaleWorks, saleFeature] = await Promise.all([
    getSaleWorks(200),
    getLatestSaleFeature(),
  ]);

  const saleWorks = dbSaleWorks.map(dbWorkToWork);

  // 特集のメイン・サブ作品を取得
  const featureWorkIds = [
    saleFeature?.main_work_id,
    saleFeature?.sub1_work_id,
    saleFeature?.sub2_work_id,
  ].filter((id): id is number => id !== null);

  const featureDbWorks =
    featureWorkIds.length > 0 ? await getWorksByIds(featureWorkIds) : [];
  const featureWorkMap = new Map(
    featureDbWorks.map((w) => [w.id, dbWorkToWork(w)])
  );

  const mainWork = saleFeature?.main_work_id
    ? featureWorkMap.get(saleFeature.main_work_id)
    : null;
  const sub1Work = saleFeature?.sub1_work_id
    ? featureWorkMap.get(saleFeature.sub1_work_id)
    : null;
  const sub2Work = saleFeature?.sub2_work_id
    ? featureWorkMap.get(saleFeature.sub2_work_id)
    : null;

  // 横スクロール用リスト取得
  const cheapestIds = saleFeature?.cheapest_work_ids || [];
  const highDiscountIds = saleFeature?.high_discount_work_ids || [];
  const highRatingIds = saleFeature?.high_rating_work_ids || [];

  const [cheapestDbWorks, highDiscountDbWorks, highRatingDbWorks] =
    await Promise.all([
      getWorksByIds(cheapestIds),
      getWorksByIds(highDiscountIds),
      getWorksByIds(highRatingIds),
    ]);

  const cheapestWorks = cheapestDbWorks.map(dbWorkToWork);
  const highDiscountWorks = highDiscountDbWorks.map(dbWorkToWork);
  const highRatingWorks = highRatingDbWorks.map(dbWorkToWork);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* ページヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-6 w-6 text-red-500" />
            <h1 className="text-xl font-bold text-foreground font-heading">
              セール特集
            </h1>
          </div>
          {saleFeature && (
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>
                計{saleFeature.total_sale_count}作品がセール中
              </span>
              {saleFeature.max_discount_rate > 0 && (
                <Badge variant="sale" className="text-xs">
                  最大{saleFeature.max_discount_rate}%OFF
                </Badge>
              )}
              <span className="text-xs">
                {saleFeature.target_date} 更新
              </span>
            </div>
          )}
        </div>

        {/* 編集部ピックアップ */}
        {mainWork && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground font-heading">
                編集部ピックアップ
              </h2>
            </div>

            <div className="space-y-4">
              <FeaturedWorkCard
                work={mainWork}
                headline={saleFeature?.main_headline}
                reason={saleFeature?.main_reason}
                label="イチオシ"
              />
              {sub1Work && (
                <FeaturedWorkCard
                  work={sub1Work}
                  headline={saleFeature?.sub1_one_liner}
                  label="注目"
                />
              )}
              {sub2Work && (
                <FeaturedWorkCard
                  work={sub2Work}
                  headline={saleFeature?.sub2_one_liner}
                  label="注目"
                />
              )}
            </div>
          </section>
        )}

        {/* ワンコイン以下 */}
        {cheapestWorks.length > 0 && (
          <HorizontalScrollSection
            title="ワンコインで手に入る"
            subtitle="500円以下のセール作品"
            href="/search?max=500&sale=true"
            works={cheapestWorks}
          />
        )}

        {/* 高割引率 */}
        {highDiscountWorks.length > 0 && (
          <HorizontalScrollSection
            title="大幅値下げ中"
            subtitle="70%OFF以上の作品"
            href="/search?sale=true&sort=discount"
            works={highDiscountWorks}
          />
        )}

        {/* 高評価セール */}
        {highRatingWorks.length > 0 && (
          <HorizontalScrollSection
            title="高評価でお買い得"
            subtitle="評価4.5以上のセール作品"
            href="/search?sale=true&sort=rating"
            works={highRatingWorks}
          />
        )}

        {/* セール中全作品 */}
        {saleWorks.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-bold text-foreground font-heading">
                セール中の全作品
              </h2>
              <span className="text-sm text-muted-foreground">
                ({saleWorks.length}件)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {saleWorks.slice(0, 30).map((work) => {
                const rating =
                  work.ratingDlsite || work.ratingFanza || 0;
                const originalPrice =
                  work.priceDlsite || work.priceFanza || 0;
                const salePrice = work.lowestPrice || originalPrice;

                return (
                  <Link
                    key={work.id}
                    href={`/works/${work.id}`}
                    className="group"
                  >
                    <Card className="overflow-hidden border border-border hover:border-primary/40 transition-all h-full">
                      <div className="relative aspect-square overflow-hidden bg-muted">
                        <img
                          src={
                            work.thumbnailUrl ||
                            "https://placehold.co/200x200/fff8f6/8b7d72?text=No+Image"
                          }
                          alt={work.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {work.maxDiscountRate && (
                          <div className="absolute top-1.5 left-1.5">
                            <Badge
                              variant="sale"
                              className="text-[10px] px-1.5 py-0.5"
                            >
                              {work.maxDiscountRate}%OFF
                            </Badge>
                          </div>
                        )}
                        <div className="absolute bottom-1.5 right-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0.5"
                          >
                            {work.category === "ASMR" ? (
                              <Headphones className="h-2.5 w-2.5 mr-0.5" />
                            ) : (
                              <Gamepad2 className="h-2.5 w-2.5 mr-0.5" />
                            )}
                            {work.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-2.5">
                        <h3 className="text-xs font-bold line-clamp-2 text-foreground mb-1.5 leading-tight">
                          {work.title}
                        </h3>
                        <div className="flex items-baseline gap-1.5">
                          {originalPrice > salePrice && (
                            <span className="text-[10px] text-muted-foreground line-through">
                              {formatPrice(originalPrice)}
                            </span>
                          )}
                          <span className="text-sm font-bold text-red-500">
                            {formatPrice(salePrice)}
                          </span>
                        </div>
                        {rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs text-amber-500 font-medium">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
            {saleWorks.length > 30 && (
              <div className="mt-4 text-center">
                <Link
                  href="/sale"
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  すべてのセール作品を見る ({saleWorks.length}件)
                </Link>
              </div>
            )}
          </section>
        )}

        {/* データがない場合 */}
        {!saleFeature && saleWorks.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">
              現在セール中の作品はありません
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
