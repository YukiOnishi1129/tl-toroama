import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { FeaturedBanners } from "@/components/featured-banners";
import {
  getAllFeatureRecommendations,
  getLatestSaleFeature,
  getWorkById,
  getLatestDailyRecommendation,
} from "@/lib/db";
import {
  Heart,
  Headphones,
  Gamepad2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "性癖特集一覧 - おすすめ女性向け作品をジャンル別に厳選 | とろあま",
  description:
    "ラブラブ、年上、連続絶頂、幼なじみ…人気の性癖・シチュエーション別にTL作品を厳選。あなたの推し性癖から迷わず作品を選べます。",
  openGraph: {
    title: "性癖特集一覧 - おすすめ女性向け作品をジャンル別に厳選 | とろあま",
    description:
      "ラブラブ、年上、連続絶頂、幼なじみ…人気の性癖・シチュエーション別にTL作品を厳選。あなたの推し性癖から迷わず作品を選べます。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "性癖特集一覧 - おすすめ女性向け作品をジャンル別に厳選 | とろあま",
    description:
      "ラブラブ、年上、連続絶頂、幼なじみ…人気の性癖・シチュエーション別にTL作品を厳選。あなたの推し性癖から迷わず作品を選べます。",
  },
};

export default async function SeihekiTokushuListPage() {
  const [allFeatures, saleFeature, recommendation] = await Promise.all([
    getAllFeatureRecommendations(),
    getLatestSaleFeature(),
    getLatestDailyRecommendation(),
  ]);

  const recommendationFirstWorkId =
    recommendation?.asmr_works?.[0]?.work_id ||
    recommendation?.game_works?.[0]?.work_id;

  const [saleFeatureMainWork, recommendationFirstWork] = await Promise.all([
    saleFeature?.main_work_id ? getWorkById(saleFeature.main_work_id) : null,
    recommendationFirstWorkId ? getWorkById(recommendationFirstWorkId) : null,
  ]);

  const saleThumbnail = saleFeatureMainWork?.thumbnail_url || null;
  const saleTargetDate = saleFeature?.target_date;
  const mainWorkSaleEndDate =
    saleFeatureMainWork?.sale_end_date_dlsite ||
    saleFeatureMainWork?.sale_end_date_fanza;
  const saleMaxDiscountRate = saleFeature?.max_discount_rate;
  const recommendationThumbnail = recommendationFirstWork?.thumbnail_url || null;
  const recommendationDate = recommendation?.target_date;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-4">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "性癖特集一覧" }]}
        />

        {/* ヘッダー */}
        <div className="mb-6 mt-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-heading">
                性癖・ジャンル別特集
              </h1>
              <p className="text-sm text-muted-foreground">
                {allFeatures.length}ジャンルの特集を掲載中
              </p>
            </div>
          </div>

          <div className="p-4 bg-linear-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-primary">
                性癖特集とは
              </span>
            </div>
            <p className="text-sm text-foreground">
              あなたの推し性癖・シチュエーションから厳選した作品を紹介。
              <br />
              ジャンルをタップして、おすすめ作品をチェック！
            </p>
          </div>
        </div>

        {/* 性癖特集グリッド */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allFeatures.map((feature) => (
              <Link
                key={feature.slug}
                href={`/tokushu/seiheki/${feature.slug}`}
              >
                <Card className="overflow-hidden border border-border hover:border-primary/50 transition-all">
                  <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                    <img
                      src={
                        feature.thumbnail_url ||
                        "https://placehold.co/200x112/fff8f6/8b7d72?text=TL"
                      }
                      alt={feature.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-foreground truncate">
                      {feature.name}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {feature.asmr_count > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Headphones className="h-3 w-3 mr-0.5" />
                          {feature.asmr_count}
                        </span>
                      )}
                      {feature.game_count > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Gamepad2 className="h-3 w-3 mr-0.5" />
                          {feature.game_count}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

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
