import * as cheerio from "cheerio";

interface ServerItem {
  epId: number;
  cmId: string;
  svId: string;
  linkId: string;
  label: string;
}

interface ExtractedServers {
  sub: ServerItem[];
  dub: ServerItem[];
}

export default function extractServers(html: string): ExtractedServers {
  const $ = cheerio.load(html);

  const servers: ExtractedServers = {
    sub: [],
    dub: [],
  };

  $(".servers .type").each((_, typeEl) => {
    const $type = $(typeEl);
    const type = $type.attr("data-type"); // "sub" or "dub"

    if (!type || !(type in servers)) return;

    const items: ServerItem[] = [];
    $type.find("li").each((_, li) => {
      const $li = $(li);
      const epId = parseInt($li.attr("data-ep-id") || "0", 10);
      const cmId = $li.attr("data-cmid") || "";
      const svId = $li.attr("data-sv-id") || "";
      const linkId = $li.attr("data-link-id") || "";
      const label = $li.text().trim();

      items.push({ epId, cmId, svId, linkId, label });
    });

    servers[type as keyof ExtractedServers] = items;
  });

  return servers;
}