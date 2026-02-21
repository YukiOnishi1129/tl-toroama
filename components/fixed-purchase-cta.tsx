"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

function extractProductId(url: string, platform: string): string | undefined {
  if (platform === "DLsite") {
    const match = url.match(/RJ\d+/i);
    return match ? match[0].toUpperCase() : undefined;
  } else {
    const match = url.match(/d_\d+/);
    return match ? match[0] : undefined;
  }
}

interface FixedPurchaseCtaProps {
  priceDlsite: number | null | undefined;
  priceFanza: number | null | undefined;
  originalPriceDlsite: number | null | undefined;
  originalPriceFanza: number | null | undefined;
  dlsiteUrl: string | null;
  fanzaUrl: string | null;
  discountRateDlsite: number | null;
  discountRateFanza: number | null;
  saleEndDateDlsite: string | null;
  saleEndDateFanza: string | null;
  genre: string | null | undefined;
  category: string | null | undefined;
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

function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

function formatSaleEndDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  return `${month}/${day} ${hours}時まで`;
}

export function FixedPurchaseCta({
  priceDlsite,
  priceFanza,
  originalPriceDlsite,
  originalPriceFanza,
  dlsiteUrl,
  fanzaUrl,
  discountRateDlsite,
  discountRateFanza,
  saleEndDateDlsite,
  saleEndDateFanza,
  genre,
  category,
}: FixedPurchaseCtaProps) {
  const getCheaperOption = () => {
    if (priceDlsite && priceFanza) {
      if (priceDlsite <= priceFanza) {
        return {
          platform: "DLsite",
          price: priceDlsite,
          originalPrice: originalPriceDlsite,
          url: dlsiteUrl,
          discountRate: discountRateDlsite,
          saleEndDate: saleEndDateDlsite,
        };
      }
      return {
        platform: "FANZA",
        price: priceFanza,
        originalPrice: originalPriceFanza,
        url: fanzaUrl,
        discountRate: discountRateFanza,
        saleEndDate: saleEndDateFanza,
      };
    }
    if (priceDlsite)
      return {
        platform: "DLsite",
        price: priceDlsite,
        originalPrice: originalPriceDlsite,
        url: dlsiteUrl,
        discountRate: discountRateDlsite,
        saleEndDate: saleEndDateDlsite,
      };
    if (priceFanza)
      return {
        platform: "FANZA",
        price: priceFanza,
        originalPrice: originalPriceFanza,
        url: fanzaUrl,
        discountRate: discountRateFanza,
        saleEndDate: saleEndDateFanza,
      };
    return null;
  };

  const cheaper = getCheaperOption();
  const discountRate = cheaper?.discountRate;
  const isOnSale =
    discountRate !== null && discountRate !== undefined && discountRate > 0;

  if (!cheaper || !cheaper.url) return null;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-40 border-t border-border bg-background p-3 shadow-lg md:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            {isOnSale && cheaper.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(cheaper.originalPrice)}
              </span>
            )}
            <span
              className={`text-xl font-bold ${isOnSale ? "text-sale" : "text-foreground"}`}
            >
              {formatPrice(cheaper.price)}
            </span>
            {isOnSale && discountRate && (
              <Badge variant="sale" className="text-[10px] px-1.5 py-0">
                {discountRate}%OFF
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">
              {cheaper.platform}で購入
            </span>
            {isOnSale && cheaper.saleEndDate && (
              <span className="text-xs text-sale font-medium">
                {formatSaleEndDate(cheaper.saleEndDate)}
              </span>
            )}
          </div>
        </div>

        <Button
          asChild
          className={`flex-shrink-0 gap-2 font-bold ${
            isOnSale
              ? "bg-orange-500 hover:bg-orange-600"
              : "bg-primary hover:bg-rose-400"
          }`}
        >
          <a
            href={cheaper.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              if (typeof window !== "undefined" && window.gtag && cheaper.url) {
                const platform = cheaper.platform === "DLsite" ? "dlsite" : "fanza";
                const productId = extractProductId(cheaper.url, cheaper.platform);
                window.gtag("event", `${platform}_click`, {
                  product_id: productId,
                  source: "fixed_cta",
                });
              }
            }}
          >
            {getCtaLabel(genre, category)}
          </a>
        </Button>
      </div>
    </div>
  );
}
