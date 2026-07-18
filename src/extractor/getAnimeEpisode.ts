import * as cheerio from "cheerio";

interface Episode {
  id: number;               // data-id
  number: number;           // data-num
  slug: string;             // data-slug
  malId: number | null;     // data-mal (optional)
  title: string;            // episode title from li title attribute
  timestamp: number | null; // data-timestamp (optional)
  sub: boolean;
  dub: boolean;
  idsBase64: string;        // raw data-ids (base64 encoded)
  idsDecoded: string;       // decoded UTF-8 string (may be useful)
}

export default function extractEpisodes(html: string): Episode[] {
  const $ = cheerio.load(html);
  const episodes: Episode[] = [];

  // select all <a> elements inside .episodes li
  $(".episodes li a").each((_, el) => {
    const $a = $(el);
    const $li = $a.closest("li");

    // all needed attributes
    const id = parseInt($a.attr("data-id") || "0", 10);
    const num = parseInt($a.attr("data-num") || "0", 10);
    const slug = $a.attr("data-slug") || "";
    const malRaw = $a.attr("data-mal") || null;
    const malId = malRaw ? parseInt(malRaw, 10) : null;
    const timestampRaw = $a.attr("data-timestamp") || null;
    const timestamp = timestampRaw ? parseInt(timestampRaw, 10) : null;
    const sub = $a.attr("data-sub") === "1";
    const dub = $a.attr("data-dub") === "1";
    const idsBase64 = $a.attr("data-ids") || "";
    const title = $li.attr("title")?.trim() || "";

    // decode base64 to string (optional)
    let idsDecoded = "";
    try {
      idsDecoded = Buffer.from(idsBase64, "base64").toString("utf-8");
    } catch {
      // ignore decode errors
    }

    episodes.push({
      id,
      number: num,
      slug,
      malId,
      title,
      timestamp,
      sub,
      dub,
      idsBase64,
      idsDecoded,
    });
  });

  return episodes;
}