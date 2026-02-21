import Link from "next/link";
import { Sparkles, Trophy, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FeaturedBannersProps {
  saleThumbnail?: string | null;
  saleMaxDiscountRate?: number | null;
  saleTargetDate?: string | null;
  mainWorkSaleEndDate?: string | null;
  recommendationThumbnail?: string | null;
  recommendationDate?: string | null;
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function FeaturedBanners({
  saleThumbnail,
  saleMaxDiscountRate,
  saleTargetDate,
  mainWorkSaleEndDate,
  recommendationThumbnail,
  recommendationDate,
}: FeaturedBannersProps) {
  const saleTitle = saleTargetDate
    ? `${formatShortDate(saleTargetDate)}のセール特集`
    : "セール特集";

  let saleSubtext = "厳選おすすめ作品";
  if (saleMaxDiscountRate && mainWorkSaleEndDate) {
    saleSubtext = `${formatShortDate(mainWorkSaleEndDate)}まで最大${saleMaxDiscountRate}%OFF！`;
  } else if (saleMaxDiscountRate) {
    saleSubtext = `最大${saleMaxDiscountRate}%OFF！`;
  }

  const recommendationSubtext = recommendationDate
    ? "迷ったらここから選べばハズレなし"
    : "TL音声・ゲーム厳選おすすめ";

  return (
    <div className="mb-6 space-y-3 md:space-y-4">
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {/* 今日のおすすめ（左） */}
        <Link href="/recommendations">
          <Card className="overflow-hidden border border-amber-500/30 hover:border-amber-500/50 transition-all h-full">
            {/* スマホ: 画像大きめ + オーバーレイテキスト */}
            <div className="relative md:hidden">
              {recommendationThumbnail ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={recommendationThumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md text-sm font-bold text-white bg-amber-500" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    🏆 今日のおすすめ
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Trophy className="h-3.5 w-3.5 text-amber-400" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                      <span className="text-xs font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>今日の間違いないやつ</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/80" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                      {recommendationSubtext}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 shrink-0">
                    <Trophy className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-amber-500">今日のおすすめ</span>
                  </div>
                </div>
              )}
            </div>

            {/* PC: 横並びレイアウト */}
            <div className="hidden md:flex items-center gap-4 p-4">
              {recommendationThumbnail ? (
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={recommendationThumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-amber-500/20 to-transparent" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 shrink-0">
                  <Trophy className="h-6 w-6 text-amber-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  <span className="text-base font-bold text-amber-500">今日のおすすめ</span>
                </div>
                <p className="text-sm font-bold text-muted-foreground">
                  {recommendationSubtext}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-amber-500 shrink-0" />
            </div>
          </Card>
        </Link>

        {/* セール特集（右） */}
        <Link href="/sale">
          <Card className="overflow-hidden border border-rose-500/30 hover:border-rose-500/50 transition-all h-full">
            {/* スマホ: 画像大きめ + オーバーレイテキスト */}
            <div className="relative md:hidden">
              {saleThumbnail ? (
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={saleThumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md text-sm font-bold text-white bg-rose-500" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    🔥 セール特集
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-rose-400" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                      <span className="text-xs font-bold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>{saleTitle}</span>
                    </div>
                    <p className="text-[10px] font-bold text-white/80" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                      {saleSubtext}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 shrink-0">
                    <Sparkles className="h-5 w-5 text-rose-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-rose-500">{saleTitle}</span>
                  </div>
                </div>
              )}
            </div>

            {/* PC: 横並びレイアウト */}
            <div className="hidden md:flex items-center gap-4 p-4">
              {saleThumbnail ? (
                <div className="relative w-20 h-20 shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={saleThumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-rose-500/20 to-transparent" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 shrink-0">
                  <Sparkles className="h-6 w-6 text-rose-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-rose-500" />
                  <span className="text-base font-bold text-rose-500">{saleTitle}</span>
                </div>
                <p className="text-sm font-bold text-muted-foreground">
                  {saleSubtext}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-rose-500 shrink-0" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
