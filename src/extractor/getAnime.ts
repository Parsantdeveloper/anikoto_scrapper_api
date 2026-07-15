import * as cheerio from "cheerio";
import { Anime } from "../types/anime.js";

export default async function getAnime(data: any) {
  const $ = cheerio.load(data);
  const items: Anime[] = [];

  $("#list-items .item").each((_, el) => {
    const $item = $(el);
    const $poster = $item.find(".ani.poster");
    const $info = $item.find(".info");

    // Link and image
    const link = $poster.find("a").attr("href") || $info.find("a.name").attr("href") || "";
    const image = $poster.find("img").attr("src") || "";

    // Title
    const title = $info.find("a.name.d-title").text().trim() || "";
    const jpTitle = $info.find("a.name.d-title").attr("data-jp") || null;

    // Adult flag
    const isAdult = $poster.find(".adult").length > 0;

    // Poster metadata
    const posterType = $poster.find(".meta .right").text().trim() || null;
    const totalEpisodes = $poster.find(".ep-status.total span").text().trim() || null;
    const subEpisodes = $poster.find(".ep-status.sub span").text().trim() || null;
    const dubEpisodes = $poster.find(".ep-status.dub span").text().trim() || null;

    // Info metadata
    const $metaItems = $info.find(".meta .m-item");

    // Languages – first meta item (sub/dub labels)
    const languages: string[] = [];
    if ($metaItems.length > 0) {
      const $first = $metaItems.eq(0);
      $first.find("label").each((_, label) => {
        const text = $(label).text().trim();
        if (text.includes("Sub")) languages.push("sub");
        if (text.includes("Dub")) languages.push("dub");
      });
    }

    // Type from info (second meta item) – fallback to poster type
    let type = posterType;
    if ($metaItems.length > 1) {
      const $second = $metaItems.eq(1);
      const labelText = $second.find("label").text().trim();
      if (labelText) type = labelText;
    }

    // Episode count from info
    let episodeCount = totalEpisodes;
    if ($metaItems.length > 1) {
      const countText = $metaItems.eq(1).find("span").first().text().trim();
      if (countText && countText !== "?") episodeCount = countText;
    }

    // Rating
    let rating = null;
    if ($metaItems.length > 2) {
      rating = $metaItems.eq(2).find("span").text().trim() || null;
    }

    // Genres
    const genres = $info
      .find(".genre a")
      .map((_, a) => $(a).text().trim())
      .get()
      .filter(Boolean);

    items.push({
      title,
      jpTitle,
      link,
      image,
      isAdult,
      type,
      episodeCount,
      subEpisodes: subEpisodes === "?" ? null : subEpisodes,
      dubEpisodes: dubEpisodes === "?" ? null : dubEpisodes,
      rating,
      languages,
      genres,
    });
  });

  return items;
}