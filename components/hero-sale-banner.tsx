"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Flame, Clock, ChevronRight } from "lucide-react";
import type { Work } from "@/lib/types";

interface HeroSaleBannerProps {
  saleWorks: Work[];
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateTimeLeft(endDate: string): TimeLeft {
  const end = new Date(endDate).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
}

export function HeroSaleBanner({ saleWorks }: HeroSaleBannerProps) {
  const saleEndDate = useMemo(() => {
    return saleWorks
      .map((w) => w.saleEndDateDlsite || w.saleEndDateFanza)
      .filter(Boolean)
      .sort()[0];
  }, [saleWorks]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!saleEndDate) return;

    setTimeLeft(calculateTimeLeft(saleEndDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(saleEndDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [saleEndDate]);

  const maxDiscount = Math.max(
    ...saleWorks.map((w) => w.maxDiscountRate || 0)
  );

  return (
    <section className="mb-4 overflow-hidden rounded-2xl bg-linear-to-r from-rose-400 via-pink-400 to-orange-300 px-4 py-3 text-white shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* 左側: セール情報 */}
        <div className="flex items-center gap-3">
          <Flame className="h-5 w-5 shrink-0 animate-pulse text-yellow-200" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-black md:text-xl">
              最大
              <span className="mx-1 text-yellow-200">{maxDiscount}%</span>
              OFF
            </span>
            <span className="hidden text-sm text-white/80 sm:inline">
              · {saleWorks.length}作品
            </span>
          </div>
        </div>

        {/* 中央: カウントダウン */}
        {isMounted && timeLeft && !timeLeft.expired && (
          <div className="flex items-center gap-1 md:gap-2">
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-yellow-200" />
            <div className="flex items-center gap-0.5 font-mono text-xs md:text-sm font-bold tabular-nums">
              {timeLeft.days > 0 && (
                <>
                  <span className="rounded bg-white/20 px-1 md:px-1.5 py-0.5">
                    {timeLeft.days}
                  </span>
                  <span className="text-[10px] md:text-xs mx-0.5">日</span>
                </>
              )}
              <span className="rounded bg-white/20 px-1 md:px-1.5 py-0.5">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="rounded bg-white/20 px-1 md:px-1.5 py-0.5">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="hidden sm:inline">:</span>
              <span className="hidden sm:inline rounded bg-white/20 px-1 md:px-1.5 py-0.5">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {/* 右側: CTAボタン */}
        <Button
          asChild
          size="sm"
          className="shrink-0 bg-white text-rose-500 hover:bg-white/90 font-bold px-2 sm:px-3 rounded-full"
        >
          <Link href="/sale">
            <span className="hidden sm:inline">見る</span>
            <span className="sm:hidden">見る</span>
            <ChevronRight className="ml-0.5 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
