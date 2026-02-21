import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { WorkGridWithLoadMore } from "@/components/work-grid-with-load-more";
import { getWorksByActor, getAllActorNames } from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import { notFound } from "next/navigation";

const MAX_SSG_WORKS = 100;

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const dbWorks = await getWorksByActor(decodedName);

  if (dbWorks.length === 0) {
    return { title: "声優が見つかりません | とろあま" };
  }

  const title = `${decodedName}の出演作品（${dbWorks.length}作品） | とろあま`;
  const description = `声優「${decodedName}」のTL・乙女向けASMR＆ゲーム作品${dbWorks.length}作品を掲載。`;

  return { title, description };
}

export async function generateStaticParams() {
  const names = await getAllActorNames();
  return names.map((name) => ({ name }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export default async function CVDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const dbWorks = await getWorksByActor(decodedName);

  if (dbWorks.length === 0) {
    notFound();
  }

  const totalCount = dbWorks.length;
  const limitedDbWorks = dbWorks.slice(0, MAX_SSG_WORKS);
  const works = limitedDbWorks.map(dbWorkToWork);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "声優", href: "/cv" },
            { label: decodedName },
          ]}
        />

        <h1 className="mb-2 text-2xl font-bold text-foreground font-heading">
          {decodedName}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {totalCount}作品
        </p>

        {works.length > 0 ? (
          <>
            <WorkGridWithLoadMore works={works} />
            {totalCount > MAX_SSG_WORKS && (
              <div className="mt-6 text-center">
                <a
                  href={`/search/?q=${encodeURIComponent(decodedName)}`}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  検索ページで全{totalCount}件を見る
                </a>
              </div>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">作品がありません。</p>
        )}
      </main>

      <Footer />
    </div>
  );
}
