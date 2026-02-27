import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HeroSaleBanner } from "@/components/hero-sale-banner";
import { FeaturedBanners } from "@/components/featured-banners";
import { HorizontalScrollSection } from "@/components/horizontal-scroll-section";
import {
  VoiceActorFeatureCarousel,
  VoiceActorFeatureGridCarousel,
} from "@/components/voice-actor-feature-carousel";
import { Badge } from "@/components/ui/badge";
import {
  getNewWorks,
  getSaleWorks,
  getBargainWorks,
  getActors,
  getTags,
  getDlsiteRankingWorks,
  getFanzaRankingWorks,
  getVoiceRankingWorks,
  getGameRankingWorks,
  getHighRatedWorks,
  getLatestSaleFeature,
  getLatestDailyRecommendation,
  getWorkById,
  getWorksByIds,
  getAllVoiceActorFeatures,
} from "@/lib/db";
import { dbWorkToWork, dbActorToActor, dbTagToTag } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function Home() {
  const [
    dbSaleWorks,
    dbNewWorks,
    dbVoiceRanking,
    dbGameRanking,
    dbHighRated,
    dbBargainWorks,
    dbDlsiteRanking,
    dbFanzaRanking,
    dbActors,
    dbTags,
    saleFeature,
    dailyRecommendation,
    voiceActorFeatures,
  ] = await Promise.all([
    getSaleWorks(12),
    getNewWorks(12),
    getVoiceRankingWorks(12),
    getGameRankingWorks(12),
    getHighRatedWorks(4.5, 12),
    getBargainWorks(500, 12),
    getDlsiteRankingWorks(12),
    getFanzaRankingWorks(12),
    getActors(),
    getTags(),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
    getAllVoiceActorFeatures(),
  ]);

  // セール特集のメイン作品のサムネイルを取得
  const saleFeatureMainWork = saleFeature?.main_work_id
    ? await getWorkById(saleFeature.main_work_id)
    : null;

  // おすすめのASMR1位作品のサムネイルを取得
  const recommendationWorkIds = dailyRecommendation?.asmr_works?.[0]?.work_id
    ? [dailyRecommendation.asmr_works[0].work_id]
    : [];
  const recommendationWorks = recommendationWorkIds.length > 0
    ? await getWorksByIds(recommendationWorkIds)
    : [];

  // 型変換
  const saleWorks = dbSaleWorks.map(dbWorkToWork);
  const newWorks = dbNewWorks.map(dbWorkToWork);
  const voiceRanking = dbVoiceRanking.map(dbWorkToWork);
  const gameRanking = dbGameRanking.map(dbWorkToWork);
  const highRatedWorks = dbHighRated.map(dbWorkToWork);
  const bargainWorks = dbBargainWorks.map(dbWorkToWork);
  const dlsiteRanking = dbDlsiteRanking.map(dbWorkToWork);
  const fanzaRanking = dbFanzaRanking.map(dbWorkToWork);
  const actors = dbActors.slice(0, 12).map(dbActorToActor);
  const tags = dbTags.slice(0, 20).map(dbTagToTag);

  // バナー用サムネイル
  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || dbSaleWorks[0]?.thumbnail_url;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate = saleFeatureMainWork?.sale_end_date_dlsite || saleFeatureMainWork?.sale_end_date_fanza;
  const recommendationThumbnail = recommendationWorks[0]?.thumbnail_url || dbVoiceRanking[0]?.thumbnail_url;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-4">
        {/* セールバナー（コンパクト） */}
        {saleWorks.length > 0 && <HeroSaleBanner saleWorks={saleWorks} />}

        {/* 今日のおすすめ & セール特集 */}
        <FeaturedBanners
          saleThumbnail={saleThumbnail}
          saleMaxDiscountRate={saleFeature?.max_discount_rate}
          saleTargetDate={saleTargetDate}
          mainWorkSaleEndDate={mainWorkSaleEndDate}
          recommendationThumbnail={recommendationThumbnail}
          recommendationDate={dailyRecommendation?.target_date}
        />

        {/* 声優特集カルーセル */}
        {voiceActorFeatures.length > 0 && (
          <div className="mb-6">
            {/* スマホ: カルーセル */}
            <div className="md:hidden">
              <VoiceActorFeatureCarousel voiceActorFeatures={voiceActorFeatures} />
            </div>
            {/* PC: 横スライドカルーセル（5カラム表示） */}
            <div className="hidden md:block">
              <VoiceActorFeatureGridCarousel voiceActorFeatures={voiceActorFeatures} />
            </div>
          </div>
        )}

        {/* ボイス・ASMRランキング */}
        {voiceRanking.length > 0 && (
          <HorizontalScrollSection
            title="いま人気のボイス作品"
            subtitle="ASMR売上ランキング"
            href="/search?genre=voice&sort=rank"
            works={voiceRanking}
            showRankBadge
            rankBadgeColor="pink"
          />
        )}

        {/* ゲームランキング */}
        {gameRanking.length > 0 && (
          <HorizontalScrollSection
            title="おすすめゲーム"
            subtitle="ゲーム売上ランキング"
            href="/search?genre=game&sort=rank"
            works={gameRanking}
            showRankBadge
            rankBadgeColor="rose"
          />
        )}

        {/* 高評価 */}
        {highRatedWorks.length > 0 && (
          <HorizontalScrollSection
            title="みんなが選んだ高評価"
            subtitle="評価4.5以上の厳選作品"
            href="/search?sort=rating"
            works={highRatedWorks}
          />
        )}

        {/* DLsiteランキング */}
        {dlsiteRanking.length > 0 && (
          <HorizontalScrollSection
            title="DLsiteで人気"
            subtitle="ランキング上位"
            href="/search?platform=dlsite&sort=rank"
            works={dlsiteRanking}
            showRankBadge
            rankBadgeColor="coral"
          />
        )}

        {/* FANZAランキング */}
        {fanzaRanking.length > 0 && (
          <HorizontalScrollSection
            title="FANZAで人気"
            subtitle="ランキング上位"
            href="/search?platform=fanza&sort=rank"
            works={fanzaRanking}
            showRankBadge
            rankBadgeColor="coral"
          />
        )}

        {/* ワンコイン */}
        {bargainWorks.length > 0 && (
          <HorizontalScrollSection
            title="ワンコインで買える"
            subtitle="500円以下のお得な作品"
            href="/search?max=500"
            works={bargainWorks}
          />
        )}

        {/* セール中 */}
        {saleWorks.length > 0 && (
          <HorizontalScrollSection
            title="セール中"
            subtitle="今だけお得な作品"
            href="/search?sort=discount"
            works={saleWorks}
          />
        )}

        {/* 新着作品 */}
        <HorizontalScrollSection
          title="新着作品"
          subtitle="最新リリース"
          href="/search?sort=new"
          works={newWorks}
        />

        {/* 人気声優 */}
        {actors.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground font-heading">人気声優</h2>
              <Link
                href="/cv"
                className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
              >
                もっと見る
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {actors.slice(0, 8).map((actor) => (
                <Link
                  key={actor.name}
                  href={`/cv/${encodeURIComponent(actor.name)}`}
                >
                  <Badge
                    variant="cv"
                    className="cursor-pointer hover:opacity-80 text-sm py-1.5 px-3"
                  >
                    {actor.name}
                    <span className="ml-1 opacity-70">({actor.workCount})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 人気タグ */}
        {tags.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground font-heading">人気タグ</h2>
              <Link
                href="/tags"
                className="flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
              >
                もっと見る
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 20).map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                >
                  <Badge
                    variant="tag"
                    className="cursor-pointer hover:opacity-80 text-sm py-1.5 px-3"
                  >
                    {tag.name}
                    <span className="ml-1 opacity-70">({tag.workCount})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
