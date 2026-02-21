import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { getCircles } from "@/lib/db";
import { dbCircleToCircle } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function CirclesPage() {
  const dbCircles = await getCircles();
  const circles = dbCircles.map(dbCircleToCircle);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "サークル一覧" }]}
        />

        <h1 className="mb-6 text-2xl font-bold text-foreground font-heading">
          サークル一覧
        </h1>
        <p className="mb-4 text-sm text-muted-foreground">
          {circles.length}サークル
        </p>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {circles.map((circle) => (
            <Link
              key={circle.id}
              href={`/circles/${encodeURIComponent(circle.name)}`}
            >
              <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50">
                <h2 className="font-medium text-foreground">{circle.name}</h2>
                <div className="mt-2 flex items-center gap-2">
                  {circle.mainGenre && (
                    <Badge variant="secondary" className="text-xs">
                      {circle.mainGenre}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {circle.workCount}作品
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
