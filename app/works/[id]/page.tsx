import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { WorkCard } from "@/components/work-card";
import { AffiliateLink } from "@/components/affiliate-link";
import { SaleTimer } from "@/components/sale-timer";
import { SaleBannerCountdown } from "@/components/sale-banner-countdown";
import { FixedPurchaseCta } from "@/components/fixed-purchase-cta";
import { SampleImageGallery } from "@/components/sample-image-gallery";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getWorkById,
  getWorkByRjCode,
  getAllWorkIds,
  getRelatedWorks,
  getPopularWorksByCircle,
  getPopularWorksByActor,
  getSimilarWorksByTags,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function getCategoryLabel(genre: string | null | undefined, category: string | null | undefined): string | null {
  if (genre) {
    if (genre.includes("音声")) return "ASMR";
    if (genre.includes("ゲーム")) return "ゲーム";
  }
  return category || null;
}

function getCtaLabel(genre: string | null | undefined, category: string | null | undefined): string {
  if (genre) {
    if (genre.includes("音声")) return "試聴してみる";
    if (genre.includes("ゲーム")) return "体験版で遊ぶ";
  }
  if (category) {
    const cat = category.toLowerCase();
    if (cat === "asmr" || cat === "音声作品") return "試聴してみる";
    if (cat === "game" || cat === "ゲーム") return "体験版で遊ぶ";
    if (cat === "動画" || cat === "video") return "サンプルを見る";
  }
  return "詳細を見る";
}

async function getWork(idOrRjCode: string) {
  if (/^RJ\d+$/i.test(idOrRjCode)) {
    return await getWorkByRjCode(idOrRjCode.toUpperCase());
  }
  const numericId = parseInt(idOrRjCode, 10);
  if (!Number.isNaN(numericId)) {
    return await getWorkById(numericId);
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const dbWork = await getWork(id);

  if (!dbWork) {
    return { title: "作品が見つかりません | とろあま" };
  }

  const work = dbWorkToWork(dbWork);

  const salePrefix =
    work.isOnSale && work.maxDiscountRate
      ? `【${work.maxDiscountRate}%OFF】`
      : "";
  const title = `${salePrefix}${work.title} | とろあま`;

  const ratingText = work.ratingDlsite ? `評価${work.ratingDlsite.toFixed(1)}` : "";
  const baseDescription =
    work.aiAppealPoints || work.aiRecommendReason || work.aiSummary || "";
  const description = baseDescription
    ? `${ratingText ? `${ratingText}の` : ""}${baseDescription}`
    : `${work.title}の価格比較・セール情報・レビューをチェック`;

  const ogImage = work.thumbnailUrl || work.sampleImages[0] || null;

  const keywords = [
    ...(work.aiTags || []),
    ...(work.actors || []),
    work.circleName,
    work.category,
    "TL",
    "乙女",
    "DLsite",
    "FANZA",
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords: keywords.join(", "),
    openGraph: {
      title,
      description,
      type: "website",
      ...(ogImage && {
        images: [{ url: ogImage, width: 800, height: 450, alt: work.title }],
      }),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export async function generateStaticParams() {
  const ids = await getAllWorkIds();
  return ids.map((id) => ({ id: id.toString() }));
}

export const dynamic = "force-static";

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  const dbWork = await getWork(id);

  if (!dbWork) {
    notFound();
  }

  const work = dbWorkToWork(dbWork);

  const dbRelatedWorks = await getRelatedWorks(work.id, 4);
  const relatedWorks = dbRelatedWorks.map(dbWorkToWork);

  const mainActor = work.actors?.[0];
  const [dbCircleWorks, dbActorWorks, dbSimilarWorks] = await Promise.all([
    work.circleId ? getPopularWorksByCircle(work.circleId, work.id, 4) : Promise.resolve([]),
    mainActor ? getPopularWorksByActor(mainActor, work.id, 4) : Promise.resolve([]),
    getSimilarWorksByTags(work.id, work.aiTags || [], 4),
  ]);
  const circleWorks = dbCircleWorks.map(dbWorkToWork);
  const actorWorks = dbActorWorks.map(dbWorkToWork);
  const similarWorks = dbSimilarWorks.map(dbWorkToWork);

  const isOnSale = work.isOnSale;
  const saleEndDate = work.saleEndDateDlsite || work.saleEndDateFanza || null;
  const hasBothPrices = work.priceDlsite && work.priceFanza;

  const dlsiteFinalPrice = work.priceDlsite && work.discountRateDlsite
    ? Math.round(work.priceDlsite * (1 - work.discountRateDlsite / 100))
    : work.priceDlsite;
  const fanzaFinalPrice = work.priceFanza && work.discountRateFanza
    ? Math.round(work.priceFanza * (1 - work.discountRateFanza / 100))
    : work.priceFanza;
  const cheaperPlatform = hasBothPrices && dlsiteFinalPrice! <= fanzaFinalPrice! ? "DLsite" : "FANZA";

  const breadcrumbItems = [
    { label: "トップ", href: "/" },
    { label: "作品一覧", href: "/search" },
    { label: work.title },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* セール中スティッキーバナー（モバイル） */}
      {isOnSale && saleEndDate && work.maxDiscountRate && work.maxDiscountRate > 0 && (
        <div className="sticky top-14 z-40 bg-linear-to-r from-rose-500 to-orange-500 text-white py-1.5 px-4 shadow-md md:hidden">
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="font-bold">{work.maxDiscountRate}%OFF</span>
            <span>終了まで</span>
            <SaleBannerCountdown endDate={saleEndDate} />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* ヒーローセクション */}
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <img
            src={work.thumbnailUrl || "https://placehold.co/800x450/fff8f6/8b7d72?text=No+Image"}
            alt={work.title}
            className="w-full max-h-[500px] object-contain bg-secondary/30"
          />
          {isOnSale && work.maxDiscountRate && work.maxDiscountRate > 0 && (
            <Badge variant="sale" className="absolute top-4 left-4 text-lg px-3 py-1">
              {work.maxDiscountRate}%OFF
            </Badge>
          )}
          {getCategoryLabel(work.genre, work.category) && (
            <Badge variant="secondary" className="absolute top-4 right-4 text-sm">
              {getCategoryLabel(work.genre, work.category)}
            </Badge>
          )}
          <div className="absolute bottom-4 left-4 flex gap-2">
            {work.ratingDlsite && work.ratingDlsite >= 4.5 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/90 text-white text-xs font-bold">
                ★ 高評価
              </div>
            )}
          </div>
        </div>

        {/* サンプル画像 */}
        {work.sampleImages.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-bold text-foreground font-heading">サンプル画像</h2>
            <SampleImageGallery images={work.sampleImages} title={work.title} />
          </div>
        )}

        <div className="space-y-6">
          {/* タイトル・基本情報 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              {getCategoryLabel(work.genre, work.category) && (
                <Badge variant="outline">{getCategoryLabel(work.genre, work.category)}</Badge>
              )}
              {(work.ratingDlsite || work.ratingFanza) && (() => {
                const rating = work.ratingDlsite || work.ratingFanza || 0;
                const reviewCount = work.reviewCountDlsite || work.reviewCountFanza || 0;
                return (
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">評価：</span>
                    <span className="text-2xl font-bold text-primary">{rating.toFixed(2)}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="h-5 w-5" viewBox="0 0 20 20">
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            fill={star <= Math.round(rating) ? "#f6b7c3" : "#f0e0d8"}
                            stroke="#e8a0bf"
                            strokeWidth="0.5"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">({reviewCount.toLocaleString()})</span>
                  </div>
                );
              })()}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading">{work.title}</h1>

            {work.circleName && (
              <p>
                <Link href={`/circles/${encodeURIComponent(work.circleName)}`} className="text-primary hover:underline">
                  {work.circleName}
                </Link>
              </p>
            )}

            {work.actors.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">出演:</span>
                {work.actors.map((actor) => (
                  <Link key={actor} href={`/cv/${encodeURIComponent(actor)}`}>
                    <Badge variant="cv">{actor}</Badge>
                  </Link>
                ))}
              </div>
            )}

            {/* CTA */}
            {(() => {
              const dlPrice = dlsiteFinalPrice || work.priceDlsite;
              const fzPrice = fanzaFinalPrice || work.priceFanza;
              let ctaPlatform: "dlsite" | "fanza" = "dlsite";
              let ctaUrl = work.dlsiteUrl;
              let ctaPrice = dlPrice;
              let ctaOriginalPrice = work.priceDlsite;
              let ctaDiscountRate = work.discountRateDlsite;

              if (dlPrice && fzPrice) {
                if (fzPrice < dlPrice) {
                  ctaPlatform = "fanza";
                  ctaUrl = work.fanzaUrl;
                  ctaPrice = fzPrice;
                  ctaOriginalPrice = work.priceFanza;
                  ctaDiscountRate = work.discountRateFanza;
                }
              } else if (!dlPrice && fzPrice) {
                ctaPlatform = "fanza";
                ctaUrl = work.fanzaUrl;
                ctaPrice = fzPrice;
                ctaOriginalPrice = work.priceFanza;
                ctaDiscountRate = work.discountRateFanza;
              }

              const ctaIsOnSale = ctaDiscountRate && ctaDiscountRate > 0;

              if (!ctaUrl) return null;

              return (
                <Card className={`overflow-hidden ${ctaIsOnSale ? "border-orange-500/50 bg-linear-to-r from-orange-50 to-red-50" : "border-primary/30 bg-linear-to-r from-pink-50 to-rose-50"}`}>
                  <CardContent className="p-4">
                    {ctaIsOnSale && (
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="sale" className="text-sm px-2 py-1">{ctaDiscountRate}%OFF</Badge>
                        <span className="text-sm font-bold text-orange-600">今だけの特別価格！</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-2 mb-3">
                      {ctaIsOnSale && ctaOriginalPrice && (
                        <span className="text-base text-muted-foreground line-through">{formatPrice(ctaOriginalPrice)}</span>
                      )}
                      <span className={`text-2xl font-bold ${ctaIsOnSale ? "text-sale" : "text-foreground"}`}>
                        {ctaPrice ? formatPrice(ctaPrice) : "価格を確認"}
                      </span>
                      <span className="text-xs text-muted-foreground">({ctaPlatform === "dlsite" ? "DLsite" : "FANZA"})</span>
                    </div>
                    <AffiliateLink
                      platform={ctaPlatform}
                      url={ctaUrl || ""}
                      productId={ctaPlatform === "dlsite" ? work.dlsiteProductId || undefined : undefined}
                      workId={work.id}
                      disabled={!ctaUrl}
                      className={`w-full py-4 text-lg font-bold text-white ${ctaIsOnSale ? "bg-orange-500 hover:bg-orange-600" : "bg-primary hover:bg-primary/90"}`}
                    >
                      {getCtaLabel(work.genre, work.category)}
                    </AffiliateLink>
                    <p className="mt-2 text-center text-xs text-muted-foreground">無料の体験版・サンプルで確認できます</p>
                  </CardContent>
                </Card>
              );
            })()}

            {/* タグ */}
            {work.aiTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {work.aiTags.map((tag) => (
                  <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
                    <Badge variant="tag" className="cursor-pointer hover:opacity-80">{tag}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* AIおすすめ理由 */}
          {work.aiRecommendReason && (
            <Card className="bg-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">おすすめの理由</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{work.aiRecommendReason}</p>
              </CardContent>
            </Card>
          )}

          {/* 要約 */}
          {work.aiSummary && (
            <Card className="bg-secondary/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">要約</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{work.aiSummary}</p>
              </CardContent>
            </Card>
          )}

          {/* こんな人におすすめ */}
          {work.aiTargetAudience && (
            <Card className="bg-pink-50 border-pink-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">こんな人におすすめ</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{work.aiTargetAudience}</p>
              </CardContent>
            </Card>
          )}

          {/* ここが魅力！ */}
          {work.aiAppealPoints && (
            <Card className="bg-rose-50 border-rose-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">ここが魅力！</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">{work.aiAppealPoints}</p>
              </CardContent>
            </Card>
          )}

          {/* とろあま編集部レビュー */}
          {work.aiReview && (
            <Card className="bg-linear-to-br from-pink-50 to-rose-50 border-pink-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">とろあま編集部レビュー</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{work.aiReview}</p>
              </CardContent>
            </Card>
          )}

          {/* ユーザー評価 */}
          {(work.ratingDlsite || work.ratingFanza) && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ユーザー評価</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-6">
                  {work.ratingDlsite && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">DLsite:</span>
                      <span className="text-xl font-bold text-amber-500">
                        ★ {work.ratingDlsite.toFixed(1)}
                      </span>
                      {work.reviewCountDlsite && (
                        <span className="text-sm text-muted-foreground">
                          ({work.reviewCountDlsite}件)
                        </span>
                      )}
                    </div>
                  )}
                  {work.ratingFanza && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">FANZA:</span>
                      <span className="text-xl font-bold text-amber-500">
                        ★ {work.ratingFanza.toFixed(1)}
                      </span>
                      {work.reviewCountFanza && (
                        <span className="text-sm text-muted-foreground">
                          ({work.reviewCountFanza}件)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* セールタイマー */}
          {isOnSale && saleEndDate && (
            <SaleTimer
              endDate={saleEndDate}
              discountRate={work.maxDiscountRate}
            />
          )}

          {/* 購入者の声から分かったこと */}
          {(work.aiAppealPoints || work.aiRecommendReason) && (
            <div className="p-4 rounded-xl bg-linear-to-r from-pink-50 to-rose-50 border border-pink-200">
              <p className="text-sm font-bold text-foreground mb-1">
                購入者の声から分かったこと
              </p>
              <p className="text-sm text-foreground">
                {work.aiAppealPoints || work.aiRecommendReason}
              </p>
            </div>
          )}

          {/* 価格比較テーブル */}
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-medium text-muted-foreground">
                      <span className="hidden sm:inline">プラットフォーム</span>
                      <span className="sm:hidden">販売</span>
                    </th>
                    <th className="flex px-2 sm:px-4 py-3 text-right text-xs sm:text-sm font-medium text-muted-foreground justify-center">価格</th>
                    <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-medium text-muted-foreground">無料版あり</th>
                  </tr>
                </thead>
                <tbody>
                  {work.priceDlsite !== null && work.priceDlsite !== undefined && (
                    <tr className={`border-t border-border ${hasBothPrices && cheaperPlatform === "DLsite" ? "bg-pink-50" : ""}`}>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">DLsite</span>
                          {hasBothPrices && cheaperPlatform === "DLsite" && (
                            <Badge variant="outline" className="w-fit text-[10px] border-primary text-primary">最安</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-right">
                        <div className="flex items-end justify-center gap-4">
                          <div>
                            {work.discountRateDlsite && work.discountRateDlsite > 0 && (
                              <p className="text-[10px] text-muted-foreground line-through">{formatPrice(work.priceDlsite)}</p>
                            )}
                            <p className={`text-lg font-bold sm:text-xl ${work.discountRateDlsite && work.discountRateDlsite > 0 ? "text-sale" : "text-foreground"}`}>
                              {formatPrice(dlsiteFinalPrice || work.priceDlsite)}
                            </p>
                          </div>
                          <div className="flex items-end gap-1.5 justify-center mb-1">
                            {work.discountRateDlsite && work.discountRateDlsite > 0 && (
                              <Badge variant="sale" className="text-[9px] px-1">{work.discountRateDlsite}%OFF</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <AffiliateLink
                          platform="dlsite"
                          url={work.dlsiteUrl || ""}
                          productId={work.dlsiteProductId || undefined}
                          workId={work.id}
                          disabled={!work.dlsiteUrl}
                          className={`font-bold text-white ${work.discountRateDlsite && work.discountRateDlsite > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-primary hover:bg-primary/90"}`}
                        >
                          {getCtaLabel(work.genre, work.category)}
                        </AffiliateLink>
                      </td>
                    </tr>
                  )}
                  {work.priceFanza !== null && work.priceFanza !== undefined && (
                    <tr className={`border-t border-border ${hasBothPrices && cheaperPlatform === "FANZA" ? "bg-pink-50" : ""}`}>
                      <td className="px-2 sm:px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">FANZA</span>
                          {hasBothPrices && cheaperPlatform === "FANZA" && (
                            <Badge variant="outline" className="w-fit text-[10px] border-primary text-primary">最安</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-right">
                        <div className="flex items-end justify-center gap-4">
                          <div>
                            {work.discountRateFanza && work.discountRateFanza > 0 && (
                              <p className="text-[10px] text-muted-foreground line-through">{formatPrice(work.priceFanza)}</p>
                            )}
                            <p className={`text-lg font-bold sm:text-xl ${work.discountRateFanza && work.discountRateFanza > 0 ? "text-sale" : "text-foreground"}`}>
                              {formatPrice(fanzaFinalPrice || work.priceFanza)}
                            </p>
                          </div>
                          <div className="flex items-end gap-1.5 justify-center mb-1">
                            {work.discountRateFanza && work.discountRateFanza > 0 && (
                              <Badge variant="sale" className="text-[9px] px-1">{work.discountRateFanza}%OFF</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 sm:px-4 py-3 text-center">
                        <AffiliateLink
                          platform="fanza"
                          url={work.fanzaUrl || ""}
                          workId={work.id}
                          disabled={!work.fanzaUrl}
                          className={`font-bold text-white ${work.discountRateFanza && work.discountRateFanza > 0 ? "bg-orange-500 hover:bg-orange-600" : "bg-primary hover:bg-primary/90"}`}
                        >
                          {getCtaLabel(work.genre, work.category)}
                        </AffiliateLink>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* 大きなCTAセクション（価格テーブル後） */}
          {(() => {
            const dlPrice = dlsiteFinalPrice || work.priceDlsite;
            const fzPrice = fanzaFinalPrice || work.priceFanza;
            let ctaPlatform: "dlsite" | "fanza" = "dlsite";
            let ctaUrl = work.dlsiteUrl;
            let ctaPrice = dlPrice;
            let ctaOriginalPrice = work.priceDlsite;
            let ctaDiscountRate = work.discountRateDlsite;

            if (dlPrice && fzPrice) {
              if (fzPrice < dlPrice) {
                ctaPlatform = "fanza";
                ctaUrl = work.fanzaUrl;
                ctaPrice = fzPrice;
                ctaOriginalPrice = work.priceFanza;
                ctaDiscountRate = work.discountRateFanza;
              }
            } else if (!dlPrice && fzPrice) {
              ctaPlatform = "fanza";
              ctaUrl = work.fanzaUrl;
              ctaPrice = fzPrice;
              ctaOriginalPrice = work.priceFanza;
              ctaDiscountRate = work.discountRateFanza;
            }

            const ctaIsOnSale = ctaDiscountRate && ctaDiscountRate > 0;
            const rating = work.ratingDlsite || work.ratingFanza;
            const reviewCount = work.reviewCountDlsite || work.reviewCountFanza;

            if (!ctaUrl) return null;

            return (
              <Card className={`overflow-hidden ${ctaIsOnSale ? "border-orange-500/50 bg-linear-to-r from-orange-50 to-red-50" : "border-primary/30 bg-linear-to-r from-pink-50 to-rose-50"}`}>
                <CardContent className="p-4 sm:p-6">
                  {ctaIsOnSale && (
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="sale" className="text-sm px-2 py-1">{ctaDiscountRate}%OFF</Badge>
                      <span className="text-sm font-bold text-orange-600">今だけの特別価格！</span>
                    </div>
                  )}
                  {rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">★</span>
                        <span className="font-bold text-foreground">{rating.toFixed(1)}</span>
                      </div>
                      {reviewCount && reviewCount > 0 && (
                        <span className="text-sm text-muted-foreground">
                          ({reviewCount.toLocaleString()}件のレビュー)
                        </span>
                      )}
                      {rating >= 4.5 && (
                        <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">高評価</Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-baseline gap-2 mb-4">
                    {ctaIsOnSale && ctaOriginalPrice && (
                      <span className="text-lg text-muted-foreground line-through">{formatPrice(ctaOriginalPrice)}</span>
                    )}
                    <span className={`text-3xl font-bold ${ctaIsOnSale ? "text-sale" : "text-foreground"}`}>
                      {ctaPrice ? formatPrice(ctaPrice) : "価格を確認"}
                    </span>
                    <span className="text-sm text-muted-foreground">({ctaPlatform === "dlsite" ? "DLsite" : "FANZA"})</span>
                  </div>
                  <AffiliateLink
                    platform={ctaPlatform}
                    url={ctaUrl || ""}
                    productId={ctaPlatform === "dlsite" ? work.dlsiteProductId || undefined : undefined}
                    workId={work.id}
                    disabled={!ctaUrl}
                    className={`w-full py-5 text-xl font-bold text-white ${ctaIsOnSale ? "bg-orange-500 hover:bg-orange-600" : "bg-primary hover:bg-primary/90"}`}
                  >
                    {getCtaLabel(work.genre, work.category)}
                  </AffiliateLink>
                  <p className="mt-3 text-center text-xs text-muted-foreground">無料の体験版・サンプルで確認できます</p>
                </CardContent>
              </Card>
            );
          })()}

          {/* 発売日 */}
          {work.releaseDate && (
            <p className="text-sm text-muted-foreground">発売日: {work.releaseDate}</p>
          )}

          {/* 同じCVの人気作品 */}
          {actorWorks.length > 0 && mainActor && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-foreground font-heading">{mainActor}の他の人気作品</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {actorWorks.map((actorWork) => (
                  <WorkCard key={actorWork.id} work={actorWork} />
                ))}
              </div>
            </section>
          )}

          {/* 同じサークルの人気作品 */}
          {circleWorks.length > 0 && work.circleName && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-foreground font-heading">{work.circleName}の他の人気作品</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {circleWorks.map((circleWork) => (
                  <WorkCard key={circleWork.id} work={circleWork} />
                ))}
              </div>
            </section>
          )}

          {/* この作品が好きな人はこれも */}
          {similarWorks.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-foreground font-heading">この作品が好きな人はこれも</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {similarWorks.map((similarWork) => (
                  <WorkCard key={similarWork.id} work={similarWork} />
                ))}
              </div>
            </section>
          )}

          {/* こちらもおすすめ */}
          {relatedWorks.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-foreground font-heading">こちらもおすすめ</h2>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {relatedWorks.map((relatedWork) => (
                  <WorkCard key={relatedWork.id} work={relatedWork} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* モバイル固定購入CTA */}
      <FixedPurchaseCta
        priceDlsite={dlsiteFinalPrice}
        priceFanza={fanzaFinalPrice}
        originalPriceDlsite={work.priceDlsite}
        originalPriceFanza={work.priceFanza}
        dlsiteUrl={work.dlsiteUrl}
        fanzaUrl={work.fanzaUrl}
        discountRateDlsite={work.discountRateDlsite}
        discountRateFanza={work.discountRateFanza}
        saleEndDateDlsite={work.saleEndDateDlsite}
        saleEndDateFanza={work.saleEndDateFanza}
        genre={work.genre}
        category={work.category}
      />
    </div>
  );
}
