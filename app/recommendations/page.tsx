import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  getLatestDailyRecommendation,
  getLatestSaleFeature,
  getWorksByIds,
} from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import type { Work } from "@/lib/types";
import { AffiliateLink } from "@/components/affiliate-link";
import Link from "next/link";
import {
  Star,
  Clock,
  Headphones,
  Gamepad2,
  Play,
  ExternalLink,
  Trophy,
  ThumbsUp,
  Users,
  Sparkles,
  ChevronRight,
  Flame,
} from "lucide-react";

export const metadata: Metadata = {
  title: "今日のおすすめ | とろあま",
  description:
    "編集部が厳選した今日のおすすめTL・乙女向けASMR＆ゲーム作品。TOP5をご紹介。",
};

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

// おすすめカード
function RecommendationCard({
  work,
  reason,
  targetAudience,
  rank,
  isASMR,
}: {
  work: Work;
  reason: string;
  targetAudience: string;
  rank: number;
  isASMR: boolean;
}) {
  const rating = work.ratingDlsite || work.ratingFanza || 0;
  const reviewCount = work.reviewCountDlsite || work.reviewCountFanza || 0;
  const originalPrice = work.priceDlsite || work.priceFanza || 0;
  const salePrice = work.lowestPrice || originalPrice;
  const sampleUrl = getSampleUrl(work);

  return (
    <Card className="overflow-hidden border border-border hover:border-primary/50 transition-all">
      <CardContent className="p-4">
        {/* ランクバッジ */}
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
              {isASMR ? (
                <>
                  <Headphones className="h-3 w-3 mr-1" />
                  ASMR
                </>
              ) : (
                <>
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  ゲーム
                </>
              )}
            </Badge>
          </div>
          {work.isOnSale && work.maxDiscountRate && (
            <Badge variant="sale" className="text-xs">
              {work.maxDiscountRate}%OFF
            </Badge>
          )}
        </div>

        <Link href={`/works/${work.id}`}>
          {/* サムネイル */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted mb-3">
            <img
              src={
                work.thumbnailUrl ||
                "https://placehold.co/400x225/f4f4f5/71717a?text=No"
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

          {/* タイトル */}
          <h3 className="text-base font-bold line-clamp-2 text-foreground hover:text-primary transition-colors mb-2">
            {work.title}
          </h3>
        </Link>

        {/* 評価・価格 */}
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

        {/* おすすめ理由 */}
        <div className="mb-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-bold text-primary">
              おすすめポイント
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{reason}</p>
        </div>

        {/* こんな人におすすめ */}
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

// カテゴリセクション
function CategorySection({
  title,
  icon: Icon,
  works,
  recommendations,
  isASMR,
}: {
  title: string;
  icon: typeof Headphones;
  works: Work[];
  recommendations: {
    work_id: number;
    reason: string;
    target_audience: string;
  }[];
  isASMR: boolean;
}) {
  if (works.length === 0) return null;

  const recMap = new Map(recommendations.map((r) => [r.work_id, r]));

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon
          className={`h-5 w-5 ${isASMR ? "text-purple-500" : "text-emerald-500"}`}
        />
        <h2 className="text-lg font-bold text-foreground font-heading">
          {title}
        </h2>
        <Badge variant="secondary" className="text-xs">
          TOP {works.length}
        </Badge>
      </div>
      <div className="grid gap-4">
        {works.map((work, index) => {
          const rec = recMap.get(work.id);
          return (
            <RecommendationCard
              key={work.id}
              work={work}
              reason={
                rec?.reason || work.aiRecommendReason || "人気の作品です"
              }
              targetAudience={
                rec?.target_audience ||
                work.aiTargetAudience ||
                "この作品に興味がある人"
              }
              rank={index + 1}
              isASMR={isASMR}
            />
          );
        })}
      </div>
    </section>
  );
}

export default async function RecommendationsPage() {
  const [recommendation, saleFeature] = await Promise.all([
    getLatestDailyRecommendation(),
    getLatestSaleFeature(),
  ]);

  if (!recommendation) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <p className="text-muted-foreground">
            おすすめデータがまだありません
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // 作品データを取得（全work_idをまとめて取得し、genreで再分類）
  const allRecWorkIds = [
    ...(recommendation.asmr_works || []).map((w) => w.work_id),
    ...(recommendation.game_works || []).map((w) => w.work_id),
  ];
  const uniqueIds = [...new Set(allRecWorkIds)];
  const allDbWorks = await getWorksByIds(uniqueIds);

  // genreベースで再分類（バッチの分類に依存しない）
  const asmrWorks = allDbWorks
    .filter((w) => w.genre === "音声")
    .map(dbWorkToWork);
  const gameWorks = allDbWorks
    .filter((w) => w.genre === "ゲーム")
    .map(dbWorkToWork);

  // おすすめ理由のマップ（元のasmr_works/game_worksから統合）
  const allRecommendations = [
    ...(recommendation.asmr_works || []),
    ...(recommendation.game_works || []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        {/* ページヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold text-foreground font-heading">
              {recommendation.headline || "今日のおすすめ"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            迷ったらここから選べばハズレなし。厳選{asmrWorks.length + gameWorks.length}作品。
          </p>
          <div className="mt-2 text-xs text-muted-foreground">
            {recommendation.target_date} 更新
          </div>
        </div>

        {/* ASMR部門 */}
        <CategorySection
          title="癒されたいならこの音声"
          icon={Headphones}
          works={asmrWorks}
          recommendations={allRecommendations}
          isASMR={true}
        />

        {/* ゲーム部門 */}
        <CategorySection
          title="遊ぶならこのゲーム"
          icon={Gamepad2}
          works={gameWorks}
          recommendations={allRecommendations}
          isASMR={false}
        />

        {/* セール特集への誘導 */}
        {saleFeature && (
          <section className="mt-10">
            <Link href="/sale">
              <Card className="overflow-hidden border border-red-300/50 hover:border-red-400/70 transition-all">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 shrink-0">
                    <Flame className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-bold text-red-500">
                        セール特集
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {saleFeature.total_sale_count}作品がセール中
                      {saleFeature.max_discount_rate > 0 &&
                        ` ・ 最大${saleFeature.max_discount_rate}%OFF`}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-red-500 shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
