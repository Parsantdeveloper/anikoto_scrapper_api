import * as cheerio from "cheerio";

interface PopularSearchItem {
  slug: string;
  title: string;
}

export default function getPopularSearch(html: string): PopularSearchItem[] {
  const $ = cheerio.load(html);
  const results: PopularSearchItem[] = [];

  $('.search-term .item').each((i, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    if (!href) return;

    // Extract slug (last segment of the pathname)
    let slug = '';
    try {
      slug = new URL(href).pathname.split('/').pop() || '';
    } catch {
      return;
    }
    if (!slug) return;

    // Extract title (text without trailing comma)
    const rawTitle = $el.text().trim();
    const title = rawTitle.replace(/,\s*$/, '').trim();
    if (!title) return;

    results.push({ slug, title });
  });

  return results;
}