/**
 * データローダー
 *
 * prebuild-data.mjsで生成されたJSONキャッシュからデータを読み込む。
 * ビルド時に一度だけ読み込んでメモリにキャッシュする。
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// キャッシュディレクトリのパス
const CACHE_DIR = join(process.cwd(), ".cache/data");

// キャッシュ用
let worksCache: DbWork[] | null = null;
let circlesCache: DbCircle[] | null = null;

// 型定義
export interface DbWork {
  id: number;
  circle_id: number | null;
  circle_name: string | null;
  title: string;
  genre: string | null;
  category: string | null;
  release_date: string | null;
  dlsite_product_id: string | null;
  dlsite_url: string | null;
  fanza_url: string | null;
  fanza_product_id: string | null;
  thumbnail_url: string | null;
  sample_images: string | string[] | null;
  price_dlsite: number | null;
  price_fanza: number | null;
  discount_rate_dlsite: number | null;
  discount_rate_fanza: number | null;
  sale_end_date_dlsite: string | null;
  sale_end_date_fanza: string | null;
  lowest_price: number | null;
  max_discount_rate: number | null;
  is_on_sale: boolean;
  dlsite_rank: number | null;
  fanza_rank: number | null;
  dlsite_rank_date: string | null;
  fanza_rank_date: string | null;
  ai_summary: string | null;
  ai_recommend_reason: string | null;
  ai_click_title: string | null;
  ai_tags: string[] | null;
  ai_target_audience: string | null;
  ai_appeal_points: string | null;
  ai_warnings: string | null;
  ai_review: string | null;
  cv_names: string[] | null;
  duration_minutes: number | null;
  situations: string[] | null;
  fetish_tags: string[] | null;
  cg_count: number | null;
  cg_diff_count: number | null;
  h_scene_count: number | null;
  play_time_hours: number | null;
  game_features: string[] | null;
  rating_dlsite: number | null;
  rating_fanza: number | null;
  review_count_dlsite: number | null;
  review_count_fanza: number | null;
  user_reviews: string | UserReview[] | null;
  is_available: boolean;
}

// user_reviews内のレビュー型
export interface UserReview {
  rating: number;
  text: string;
  date?: string | null;
  is_purchased?: boolean;
  helpful_count?: number;
  title?: string | null;
}

export interface DbCircle {
  id: number;
  name: string;
  dlsite_id: string | null;
  fanza_id: string | null;
  main_genre: string | null;
  work_count: number;
}

/**
 * JSONキャッシュファイルを読み込む
 */
function loadJson<T>(filename: string): T[] {
  const filePath = join(CACHE_DIR, filename);
  if (!existsSync(filePath)) {
    console.warn(`Cache file not found: ${filePath}`);
    return [];
  }
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content) as T[];
}

/**
 * 作品データを取得（キャッシュ付き）
 */
export async function getWorks(): Promise<DbWork[]> {
  if (worksCache === null) {
    worksCache = loadJson<DbWork>("works.json");
    console.log(`Loaded ${worksCache.length} works from cache`);
  }
  return worksCache;
}

/**
 * サークルデータを取得（キャッシュ付き）
 */
export async function getCirclesData(): Promise<DbCircle[]> {
  if (circlesCache === null) {
    circlesCache = loadJson<DbCircle>("circles.json");
    console.log(`Loaded ${circlesCache.length} circles from cache`);
  }
  return circlesCache;
}

/**
 * キャッシュをクリアする（テスト用）
 */
export function clearCache(): void {
  worksCache = null;
  circlesCache = null;
}
