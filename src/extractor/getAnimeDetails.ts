import * as cheerio from "cheerio";

// ─── Interfaces ────────────────────────────────────────────────
interface SidebarItem {
  title: string;
  jpTitle: string | null;
  link: string | null;
  image: string | null;
  type: string | null;
  episodes: string | null;
  yearOrDuration: string | null;
  score: string | null;
}

interface AnimeDetails {
  id: string | null;
  slug: string | null;
  title: string;
  jpTitle: string | null;
  alternativeNames: string[];
  image: string | null;
  type: string | null;
  premiered: {
    season: string | null;
    year: string | null;
  };
  aired: string | null;
  status: string | null;
  genres: string[];
  malScore: string | null;
  duration: string | null;
  episodes: string | null;
  studios: string[];
  producers: string[];
  synopsis: string | null;
  rating: string | null;
  quality: string | null;
  subAvailable: boolean;
  dubAvailable: boolean;
  score: string | null;
  scoreVotes: string | null;
}

interface ScrapedAnimePage {
  anime: AnimeDetails;
  trending: SidebarItem[];
  recommended: SidebarItem[];
}

// ─── Helper: parse a sidebar item (trending / recommended) ───
function parseSidebarItem($: cheerio.CheerioAPI, el: cheerio.Element): SidebarItem {
  const $el = $(el);
  const link = $el.attr("href") || null;
  const image = $el.find("img").attr("src") || null;
  const title = $el.find(".name.d-title").text().trim();
  const jpTitle = $el.find(".name.d-title").attr("data-jp") || null;
  const metaDots = $el.find(".meta .dot").toArray();
  let type: string | null = null,
    episodes: string | null = null,
    yearOrDuration: string | null = null,
    score: string | null = null;

  if (metaDots.length > 0) {
    const first = $(metaDots[0]).text().trim();
    // Some items have a score dot (.score), others start with type.
    if ($(metaDots[0]).hasClass("score") || first.match(/^\d+(\.\d+)?$/)) {
      score = first.replace(/[★☆]/g, "").trim();
      type = metaDots[1] ? $(metaDots[1]).text().trim() : null;
      episodes = metaDots[2] ? $(metaDots[2]).text().trim() : null;
    } else {
      type = first;
      episodes = metaDots[1] ? $(metaDots[1]).text().trim() : null;
      yearOrDuration = metaDots[2] ? $(metaDots[2]).text().trim() : null;
    }
  }

  // Fallback for score from .score span
  if (!score) {
    const scoreSpan = $el.find(".meta .score span").text().trim();
    if (scoreSpan) score = scoreSpan;
  }

  return { title, jpTitle, link, image, type, episodes, yearOrDuration, score };
}

// ─── Main scraper ─────────────────────────────────────────────
export default function scrapeAnimeDetails(html: string): ScrapedAnimePage {
  const $ = cheerio.load(html);

  // ─── ID & Slug ──────────────────────────────────────────────
  const mainWatch = $("#watch-main");
  const id = mainWatch.attr("data-id") || null;
  const watchUrl = mainWatch.attr("data-url") || "";
  const slug = watchUrl.split("/").pop() || null;

  // ─── Anime basic info ───────────────────────────────────────
  const title = $("#w-info .info h1.title").text().trim();
  const jpTitle = $("#w-info .info h1.title").attr("data-jp") || null;
  const alternativeNames = $("#w-info .info .names")
    .text()
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  const image = $("#w-info .poster img").attr("src") || null;

  const metaIcons = $("#w-info .meta.icons");
  const rating = metaIcons.find("i.rating").text().trim() || null;
  const quality = metaIcons.find("i.quality").text().trim() || null;
  const subAvailable = metaIcons.find("i.sub").length > 0;
  const dubAvailable = metaIcons.find("i.dub").length > 0;

  const synopsis = $("#w-info .synopsis .content").text().trim() || null;

  // ─── Detailed meta tables ──────────────────────────────────
  const metaBlocks = $("#w-info .bmeta .meta");

  // Meta block 1
  const meta1 = metaBlocks.first();
  const type = meta1.find('div:contains("Type:") span').text().trim() || null;

  const premieredRaw = meta1.find('div:contains("Premiered:") span').text().trim();
  let premiered = { season: null as string | null, year: null as string | null };
  if (premieredRaw) {
    const parts = premieredRaw.split(" ");
    premiered.season = parts[0]?.toLowerCase() || null;
    premiered.year = parts[1] || null;
  }

  const aired = meta1.find('div:contains("Aired:") span').text().trim() || null;
  const status = meta1.find('div:contains("Status:") span a').text().trim() || null;
  const genres = meta1
    .find('div:contains("Genres:") span a')
    .map((_, el) => $(el).text().trim())
    .get();

  // Meta block 2
  const meta2 = metaBlocks.eq(1);
  const malScore = meta2.find('div:contains("MAL:") span').text().trim() || null;
  const duration = meta2.find('div:contains("Duration:") span').text().trim() || null;
  const episodes = meta2.find('div:contains("Episodes:") span').text().trim() || null;
  const studios = meta2
    .find('div:contains("Studios:") span a')
    .map((_, el) => $(el).text().trim())
    .get();
  const producers = meta2
    .find('div:contains("Producers:") span a')
    .map((_, el) => $(el).text().trim())
    .get();

  // ─── Site rating ───────────────────────────────────────────
  const score = $("#w-rating .score .value span[itemprop='ratingValue']").text().trim() || null;
  const scoreVotes = $("#w-rating .by span[itemprop='reviewCount']").text().trim() || null;

  const anime: AnimeDetails = {
    id,
    slug,
    title,
    jpTitle,
    alternativeNames,
    image,
    type,
    premiered,
    aired,
    status,
    genres,
    malScore,
    duration,
    episodes,
    studios,
    producers,
    synopsis,
    rating,
    quality,
    subAvailable,
    dubAvailable,
    score,
    scoreVotes,
  };

  // ─── Trending (sidebar, top right) ─────────────────────────
  const trending: SidebarItem[] = [];
  $("#watch-order .w-side-section .scaff.side.items a.item").each((_, el) => {
    trending.push(parseSidebarItem($, el));
  });

  // ─── Recommended (below comments, sidebar) ─────────────────
  const recommended: SidebarItem[] = [];
  $("#watch-second .sidebar .w-side-section .scaff.side.items a.item").each((_, el) => {
    recommended.push(parseSidebarItem($, el));
  });

  return { anime, trending, recommended };
}