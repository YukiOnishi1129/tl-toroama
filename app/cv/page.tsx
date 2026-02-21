import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { getActors } from "@/lib/db";
import { dbActorToActor } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-static";

export default async function CVPage() {
  const dbActors = await getActors();
  const actors = dbActors.map(dbActorToActor);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[{ label: "トップ", href: "/" }, { label: "声優一覧" }]}
        />

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
