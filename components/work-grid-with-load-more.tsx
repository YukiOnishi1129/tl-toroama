"use client";

import { useState, useTransition, useEffect } from "react";
import type { Work } from "@/lib/types";
import { WorkCard } from "@/components/work-card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Loader2 } from "lucide-react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

interface WorkGridWithLoadMoreProps {
  works: Work[];
}

export function WorkGridWithLoadMore({ works }: WorkGridWithLoadMoreProps) {
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  const initialCount = isMobile ? 20 : 50;
  const loadMoreCount = isMobile ? 20 : 50;
  const [displayCount, setDisplayCount] = useState(initialCount);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {works.slice(0, displayCount).map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
      {displayCount < works.length && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            disabled={isPending}
            onClick={() => {
              startTransition(() => {
                setDisplayCount((prev) => Math.min(prev + loadMoreCount, works.length));
              });
            }}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {isPending ? "読み込み中..." : `もっと見る（残り${works.length - displayCount}件）`}
          </Button>
        </div>
      )}
    </>
  );
}
