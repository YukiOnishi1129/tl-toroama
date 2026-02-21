import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame, ChevronRight } from "lucide-react";
import type { Work } from "@/lib/types";

interface HeroSaleBannerProps {
  saleWorks: Work[];
}

export function HeroSaleBanner({ saleWorks }: HeroSaleBannerProps) {
  const maxDiscount = Math.max(...saleWorks.map((w) => w.maxDiscountRate || 0));

  return (
    <section className="mb-4 overflow-hidden rounded-xl bg-linear-to-r from-rose-400 via-pink-400 to-orange-300 px-4 py-3 text-white shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 shrink-0 animate-pulse text-yellow-200" />
          <span className="whitespace-nowrap text-lg font-black md:text-xl">
            最大 {maxDiscount}% OFF
          </span>
        </div>

        <Button
          asChild
          size="sm"
          className="shrink-0 bg-white text-rose-500 hover:bg-white/90 font-bold px-3"
        >
          <Link href="/sale">
            見る
            <ChevronRight className="ml-0.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
