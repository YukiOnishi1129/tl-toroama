import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getActors, getAllVoiceActorFeatures } from "@/lib/db";
import { dbActorToActor } from "@/lib/types";
import { Mic, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

export default async function CVPage() {
  const [dbActors, voiceActorFeatures] = await Promise.all([
    getActors(),
    getAllVoiceActorFeatures(),
  ]);
  const actors = dbActors.map(dbActorToActor);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "声優一覧" }]}
        />

        {/* 声優特集への導線 */}
        {voiceActorFeatures.length > 0 && (
          <Link href="/tokushu/cv">
            <Card className="mb-6 overflow-hidden border border-primary/30 hover:border-primary/50 transition-all">
              {voiceActorFeatures[0]?.representative_thumbnail_url ? (
                <div className="relative aspect-21/9 overflow-hidden">
                  <img
                    src={voiceActorFeatures[0].representative_thumbnail_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-linear-to-b from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-sm font-bold text-white bg-primary" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                    🎤 人気声優特集
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-bold text-white mb-1" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                          人気声優のおすすめ作品を厳選紹介
                        </p>
                        <p className="text-sm text-white/80" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
                          {voiceActorFeatures.length}人の人気声優を特集中
                        </p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-white shrink-0" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20 shrink-0">
                    <Mic className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Mic className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-primary">人気声優特集</span>
                      <Badge variant="outline" className="text-xs">
                        {voiceActorFeatures.length}人
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      人気声優のおすすめ作品を厳選紹介
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-primary shrink-0" />
                </div>
              )}
            </Card>
          </Link>
        )}

        <h1 className="mb-6 text-2xl font-bold text-foreground font-heading">
          声優一覧
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          {actors.length}名
        </p>

        <div className="flex flex-wrap gap-2">
          {actors.map((actor) => (
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
      </main>

      <Footer />
    </div>
  );
}
