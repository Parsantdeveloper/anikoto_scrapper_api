import * as cheerio from "cheerio";
 export default function getPopularSearch(html: string): string[] {
  const $ = cheerio.load(html);
  const searches: string[] = [];

  $('.search-term .item').each((i, el) => {
    // Get text content and remove trailing comma/whitespace
    let raw = $(el).text().trim();
    // Remove trailing comma and any surrounding spaces
    raw = raw.replace(/,\s*$/, '').trim();
    if (raw) searches.push(raw);
  });

  return searches;
}

// Example usage:
// const html = '<!DOCTYPE html>...'; // your full HTML
// console.log(getPopularSearch(html));