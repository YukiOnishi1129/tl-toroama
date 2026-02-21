import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Breadcrumb } from "@/components/breadcrumb";
import { WorkGridWithLoadMore } from "@/components/work-grid-with-load-more";
import { Badge } from "@/components/ui/badge";
import { getWorksByTag, getAllTagNames, getRelatedTags } from "@/lib/db";
import { dbWorkToWork } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";

const MAX_SSG_WORKS = 100;

interface Props {
  params: Promise<{ name: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const dbWorks = await getWorksByTag(decodedName);

  if (dbWorks.length === 0) {
    return { title: "タグが見つかりません | とろあま" };
  }

  const title = `「${decodedName}」タグの作品（${dbWorks.length}作品） | とろあま`;
  const description = `「${decodedName}」タグのTL・乙女向けASMR＆ゲーム作品${dbWorks.length}作品を掲載。`;

  return { title, description };
}

export async function generateStaticParams() {
  const names = await getAllTagNames();
  return names.map((name) => ({ name }));
}

export const dynamic = "force-static";
export const dynamicParams = false;

export default async function TagDetailPage({ params }: Props) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const [dbWorks, relatedTags] = await Promise.all([
    getWorksByTag(decodedName),
    getRelatedTags(decodedName, 10),
  ]);

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
            { label: "タグ", href: "/tags" },
            { label: decodedName },
          ]}
        />

        <h1 className="mb-2 text-2xl font-bold text-foreground font-heading">
          {decodedName}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {totalCount}作品
        </p>

        {/* 関連タグ */}
        {relatedTags.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">関連タグ</h2>
            <div className="flex flex-wrap gap-2">
              {relatedTags.map((tag) => (
                <Link
                  key={tag.name}
                  href={`/tags/${encodeURIComponent(tag.name)}`}
                >
                  <Badge
                    variant="tag"
                    className="cursor-pointer hover:opacity-80"
                  >
                    {tag.name}
                    <span className="ml-1 opacity-70">({tag.count})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

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
