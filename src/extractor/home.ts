import * as cheerio from "cheerio";

interface AnimeItem {
  title: string;
  jpTitle: string | null;
  link: string | null;
  image: string | null;
  type: string | null;
  episodeCount: string | null;
  subEpisodes: string | null;
  dubEpisodes: string | null;
  rating: string | null;
  languages: string[];
  genres: string[];
  date: string | null;
  synopsis: string | null;
  quality: string | null;
  isAdult: boolean;
}

interface TabData {
  tab: string;
  items: AnimeItem[];
}

interface HomePageData {
  hotest: AnimeItem[];
  recentUpdate: AnimeItem[];
  upcoming: AnimeItem[];
  topTables: {
    newRelease: AnimeItem[];
    newAdded: AnimeItem[];
    completed: AnimeItem[];
  };
  topAnime: {
    day: AnimeItem[];
    week: AnimeItem[];
    month: AnimeItem[];
  };
  // discussion: any; // dynamic, ignore
}

export default function scrapeHomePage(html: string): HomePageData {
  const $ = cheerio.load(html);

  // Helper to parse a single .item (poster + info) block
  function parseItem(el: cheerio.Element): AnimeItem {
    const $item = $(el);
    const $poster = $item.find(".ani.poster").length
      ? $item.find(".ani.poster")
      : $item.find(".poster"); // sometimes just .poster

    const $info = $item.find(".info");

    // Link and image
    const link = $poster.find("a").attr("href") || $info.find("a.name").attr("href") || null;
    const image = $poster.find("img").attr("src") || null;

    // Title
    const title = $info.find("a.name.d-title").text().trim() || $info.find(".name.d-title").text().trim() || "";
    const jpTitle = $info.find("a.name.d-title").attr("data-jp") || $info.find(".name.d-title").attr("data-jp") || null;

    // Adult
    const isAdult = $poster.find(".adult").length > 0 || $item.find(".adult").length > 0;

    // Poster metadata (type, total episodes, sub/dub counts)
    const posterType = $poster.find(".meta .right").text().trim() || null;
    const totalEpisodes = $poster.find(".ep-status.total span").text().trim() || null;
    const subEpisodes = $poster.find(".ep-status.sub span").text().trim() || null;
    const dubEpisodes = $poster.find(".ep-status.dub span").text().trim() || null;

    // Info meta items – used for languages, type, episode count, rating, date
    const $metaItems = $info.find(".meta .m-item, .meta .one-line"); // .one-line is for top-tables

    // Languages
    const languages: string[] = [];
    if ($metaItems.length > 0) {
      const $first = $metaItems.eq(0);
      $first.find("label").each((_, lbl) => {
        const text = $(lbl).text().trim();
        if (/sub/i.test(text)) languages.push("sub");
        if (/dub/i.test(text)) languages.push("dub");
      });
      // Also from .ep-wrap dot spans (in top-tables)
      if (languages.length === 0) {
        if ($first.find(".ep-status.sub").length) languages.push("sub");
        if ($first.find(".ep-status.dub").length) languages.push("dub");
      }
    }

    // Type
    let type = posterType;
    if ($metaItems.length > 1) {
      const labelText = $metaItems.eq(1).find("label").text().trim() || $metaItems.eq(1).text().trim();
      if (labelText) type = labelText;
    }
    // For top-tables, type is a separate dot span
    if (!type) {
      const dots = $info.find(".meta .dot").toArray();
      if (dots.length >= 2) type = $(dots[1]).text().trim(); // second dot after ep wrap
    }

    // Episode count
    let episodeCount = totalEpisodes;
    if ($metaItems.length > 1) {
      const countText = $metaItems.eq(1).find("span").first().text().trim();
      if (countText && countText !== "?" && countText !== "0") episodeCount = countText;
    }

    // Rating
    let rating: string | null = null;
    if ($metaItems.length > 2) {
      rating = $metaItems.eq(2).find("span").text().trim() || null;
    }

    // Date (from .date or .dot with date text)
    let date: string | null = null;
    const dateIcon = $item.find(".meta .icons i.date").text().trim() || $item.find(".meta .date").text().trim();
    if (dateIcon) date = dateIcon;
    if (!date) {
      // Look for a dot that looks like a date (e.g., "Jul 12, 2026")
      $info.find(".meta .dot").each((_, dot) => {
        const t = $(dot).text().trim();
        if (/\d{4}/.test(t) && t.length > 5) date = t;
      });
    }

    // Synopsis (only in hotest slides)
    const synopsis = $item.find(".synopsis").text().trim() || null;

    // Quality (only in hotest slides)
    const quality = $item.find(".meta .icons i.quality").text().trim() || null;

    // Genres (not present in home page items, only in filter page)
    const genres: string[] = [];

    return {
      title,
      jpTitle,
      link,
      image,
      type,
      episodeCount,
      subEpisodes: subEpisodes === "?" ? null : subEpisodes,
      dubEpisodes: dubEpisodes === "?" ? null : dubEpisodes,
      rating,
      languages,
      genres,
      date,
      synopsis,
      quality,
      isAdult
    };
  }

  // --- Hotest (featured slider) ---
  const hotest: AnimeItem[] = [];
  $("#hotest .swiper-slide.item").each((_, el) => {
    // The structure is different: .info and .image, no poster class. Adapt parseItem.
    const $slide = $(el);
    const item: AnimeItem = {
      title: $slide.find(".title.d-title").text().trim(),
      jpTitle: $slide.find(".title.d-title").attr("data-jp") || null,
      link: $slide.find(".actions a.btn").attr("href") || null,
      image: $slide.find(".image div").attr("style")?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] || null,
      type: null,
      episodeCount: null,
      subEpisodes: null,
      dubEpisodes: null,
      rating: $slide.find(".meta .icons i.rating").text().trim() || null,
      languages: [],
      genres: [],
      date: $slide.find(".meta .icons i.date").text().trim() || null,
      synopsis: $slide.find(".synopsis").text().trim() || null,
      quality: $slide.find(".meta .icons i.quality").text().trim() || null,
      isAdult: false
    };
    // Sub/dub detection
    if ($slide.find(".meta .icons i.sub").length) item.languages.push("sub");
    if ($slide.find(".meta .icons i.dub").length) item.languages.push("dub");
    hotest.push(item);
  });

  // --- Recent Update / Latest Episodes ---
  const recentUpdate: AnimeItem[] = [];
  $("#recent-update .ani.items .item").each((_, el) => {
    recentUpdate.push(parseItem(el));
  });

  // --- Upcoming Anime ---
  const upcoming: AnimeItem[] = [];
  $("#upcoming-anime .ani.items .item").each((_, el) => {
    upcoming.push(parseItem(el));
  });

  // --- Top Tables (New Release / Newly Added / Just Completed) ---
  const topTables = {
    newRelease: [] as AnimeItem[],
    newAdded: [] as AnimeItem[],
    completed: [] as AnimeItem[]
  };

  $(".top-tables .body section.top-table").each((_, section) => {
    const name = $(section).data("name") as string;
    const items: AnimeItem[] = [];
    $(section).find(".scaff.items a.item").each((_, el) => {
      // Structure: a.item with .poster and .info, no .ani class
      const $a = $(el);
      const img = $a.find("img").attr("src") || null;
      const link = $a.attr("href") || null;
      const title = $a.find(".name.d-title").text().trim();
      const jpTitle = $a.find(".name.d-title").attr("data-jp") || null;
      const type = $a.find(".meta .dot").eq(1).text().trim() || null;
      const date = $a.find(".meta .dot").eq(2).text().trim() || null;
      const subEpisodes = $a.find(".ep-status.sub span").text().trim() || null;
      const dubEpisodes = $a.find(".ep-status.dub span").text().trim() || null;
      const languages: string[] = [];
      if (subEpisodes && subEpisodes !== "?") languages.push("sub");
      if (dubEpisodes && dubEpisodes !== "?") languages.push("dub");

      items.push({
        title,
        jpTitle,
        link,
        image: img,
        type,
        episodeCount: null, // not directly available
        subEpisodes: subEpisodes === "?" ? null : subEpisodes,
        dubEpisodes: dubEpisodes === "?" ? null : dubEpisodes,
        rating: null,
        languages,
        genres: [],
        date,
        synopsis: null,
        quality: null,
        isAdult: false
      });
    });

    if (name === "new-release") topTables.newRelease = items;
    else if (name === "new-added") topTables.newAdded = items;
    else if (name === "completed") topTables.completed = items;
  });

  // --- Top Anime sidebar (day/week/month) ---
  const topAnime = {
    day: [] as AnimeItem[],
    week: [] as AnimeItem[],
    month: [] as AnimeItem[]
  };

  $("#top-anime .tab-content").each((_, tabContent) => {
    const name = $(tabContent).data("name") as string;
    const items: AnimeItem[] = [];
    $(tabContent).find(".scaff.side.items a.item").each((_, el) => {
      const $a = $(el);
      const img = $a.find("img").attr("src") || null;
      const link = $a.attr("href") || null;
      const title = $a.find(".name.d-title").text().trim();
      const jpTitle = $a.find(".name.d-title").attr("data-jp") || null;
      const type = $a.find(".meta .dot").eq(1).text().trim() || null;
      const subEpisodes = $a.find(".ep-status.sub span").text().trim() || null;
      const dubEpisodes = $a.find(".ep-status.dub span").text().trim() || null;
      const languages: string[] = [];
      if (subEpisodes && subEpisodes !== "?") languages.push("sub");
      if (dubEpisodes && dubEpisodes !== "?") languages.push("dub");

      items.push({
        title,
        jpTitle,
        link,
        image: img,
        type,
        episodeCount: null,
        subEpisodes: subEpisodes === "?" ? null : subEpisodes,
        dubEpisodes: dubEpisodes === "?" ? null : dubEpisodes,
        rating: null,
        languages,
        genres: [],
        date: null,
        synopsis: null,
        quality: null,
        isAdult: false
      });
    });

    if (name === "day") topAnime.day = items;
    else if (name === "week") topAnime.week = items;
    else if (name === "month") topAnime.month = items;
  });

  return {
    hotest,
    recentUpdate,
    upcoming,
    topTables,
    topAnime
  };
}