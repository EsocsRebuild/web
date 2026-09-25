#!/usr/bin/env node
/**
 * Exports every public record from the legacy ESOCS WordPress backend
 * (super-vault.esocs.net, the headless CMS behind www.esocs.net) and
 * normalises it into seed data for the rebuild.
 *
 *   node scripts/legacy/export-wordpress.mjs            # JSON only
 *   node scripts/legacy/export-wordpress.mjs --media    # also download original media
 *
 * Output (data/legacy/):
 *   raw/<type>.json   Records as the API returns them, minus link/guid noise.
 *   media.json        Compact manifest of every uploaded file.
 *   seed/<name>.json  Cleaned, structured data ready to import into the new CMS.
 *   media/            Original files (gitignored; destined for object storage).
 */
import { access, mkdir, rename, rm, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const API = "https://super-vault.esocs.net/wp-json/wp/v2/";
// The host's WAF rejects bare or unusual user agents with 406.
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
const OUT = path.resolve(import.meta.dirname, "../../data/legacy");

const TYPES = [
  "pages",
  "banner",
  "news",
  "slider",
  "iconcard",
  "pastor",
  "sections",
  "event",
  "service_time",
  "gallery",
  "banks",
  "social-accounts",
  "custom-pages",
];

// ---------------------------------------------------------------------------
// Fetching

async function getJson(url) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (res.ok) return { data: await res.json(), headers: res.headers };
    if (attempt >= 3 || res.status < 500) throw new Error(`${res.status} ${url}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

async function getAll(type) {
  const items = [];
  for (let page = 1; ; page++) {
    const { data, headers } = await getJson(`${API}${type}?per_page=100&page=${page}`);
    items.push(...data);
    if (page >= Number(headers.get("x-wp-totalpages") ?? 1)) return items;
  }
}

// ---------------------------------------------------------------------------
// Text helpers

const ENTITIES = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  hellip: "…",
};

function decode(s) {
  return s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#")
      return String.fromCodePoint(
        e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10),
      );
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function stripHtmlComments(input = "") {
  let prev;
  let out = input;
  do {
    prev = out;
    out = out.replace(/<!--[\s\S]*?-->/g, "");
  } while (out !== prev);
  return out;
}

/** Plain text with paragraph breaks preserved. */
function toText(html = "") {
  let sanitized = html;
  let previous;
  do {
    previous = sanitized;
    sanitized = sanitized
      .replace(stripHtmlComments)
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|li|h\d|tr|div|strong)>/gi, "\n")
      .replace(/<[^>]+>/g, "");
  } while (sanitized !== previous);

  return decode(sanitized)
    .replace(/[ \t\r ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/** Clean HTML: drops inline styles, classes, <style>, legacy Svelte buttons and comments. */
function cleanHtml(html = "") {
  let sanitized = html;
  let previous;
  do {
    previous = sanitized;
    sanitized = sanitized
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<button[\s\S]*?<\/button>/gi, "")
      .replace(stripHtmlComments)
      .replace(/\s(style|class|width|n)="[^"]*"/gi, "")
      .replace(/\r/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();
  } while (sanitized !== previous);
  return sanitized;
}

const isPlaceholder = (s = "") => /lorem ipsum|^caption$/i.test(toText(s));
const orNull = (s) => (s && !isPlaceholder(s) ? s : null);
const squash = (s = "") => s.replace(/\s+/g, " ").trim();

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[’'.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleCase(s) {
  return s
    .toLowerCase()
    .replace(/(^|[\s(/-])([a-z])/g, (_, p, c) => p + c.toUpperCase())
    .replace(/(?<=\s)(Of|And|The|In|On|At|For)(?=\s)/g, (w) => w.toLowerCase());
}

/** "20260122" -> "2026-01-22" */
const acfDate = (d) => (d && /^\d{8}$/.test(d) ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : null);

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** "on 7th October, 2017" -> "2017-10-07" */
function proseDate(s) {
  const m = s.match(/(\d{1,2})(?:st|nd|rd|th)?,?\s+(?:of\s+)?([a-z]+),?\s+(\d{4})/i);
  if (!m) return null;
  const month = MONTHS.indexOf(m[2].toLowerCase());
  if (month < 0) return null;
  return `${m[3]}-${String(month + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Normalisers

function mediaManifest(media) {
  return media.map((m) => {
    const d = m.media_details ?? {};
    return {
      id: m.id,
      url: m.source_url,
      mime: m.mime_type,
      width: d.width ?? null,
      height: d.height ?? null,
      bytes: d.filesize ?? null,
      alt: m.alt_text || null,
      title: decode(m.title?.rendered ?? ""),
      uploaded: m.date,
      // WordPress's pre-generated smaller versions; far lighter to fetch than originals.
      variants: Object.fromEntries(
        Object.entries(d.sizes ?? {})
          .filter(([name]) => ["medium_large", "large", "1536x1536"].includes(name))
          .map(([name, v]) => [name, { url: v.source_url, width: v.width, height: v.height }]),
      ),
    };
  });
}

function parseHistory(html) {
  const text = toText(html);
  const lines = text.split("\n");
  const heading = /^([A-Z][A-Z0-9 .,()&’'/–-]{12,}?)\s*\((\d{4})\s*[–-]\s*(\d{4}|TILL DATE)\)\s*$/;
  const leaders = [];
  let current = null;
  const sections = { achievements: [], provincesCreated: [], dedications: [], acquisitions: [], other: [] };
  let bucket = null;

  for (const line of lines) {
    const h = line.match(heading);
    if (h) {
      current = {
        heading: squash(h[1]).replace(/\s*[–-]\s*$/, ""),
        from: Number(h[2]),
        to: h[3] === "TILL DATE" ? null : Number(h[3]),
        paragraphs: [],
      };
      leaders.push(current);
      bucket = null;
      continue;
    }
    if (/^SOME (EVENTS|OF HIS ACHIEV)/i.test(line)) {
      bucket = "achievements";
      continue;
    }
    if (/^PROVINCES & SPECIAL AREAS CREATED/i.test(line)) {
      bucket = "provincesCreated";
      continue;
    }
    if (/^DEDICATION OF CATHEDRALS/i.test(line)) {
      bucket = "dedications";
      continue;
    }
    if (/^NEWLY ACQUIRED PRAYER HOUSES/i.test(line)) {
      bucket = "acquisitions";
      continue;
    }
    if (bucket)
      sections[bucket === "achievements" && !current ? "other" : bucket].push({
        leader: current?.heading ?? null,
        text: line,
      });
    else if (current) current.paragraphs.push(line);
  }

  const provinces = sections.provincesCreated
    .flatMap((l) => l.text.replace(/\.$/, "").split(/,\s*|\s+and\s+/))
    .map((n) => squash(n))
    .filter(Boolean)
    .map((name) => ({
      name,
      slug: slugify(name),
      kind: /special area/i.test(name) ? "special-area" : "province",
      source: "History page: provinces & special areas created under Baba Aladura Bob-Manuel",
    }));

  const dedications = sections.dedications.map(({ text }) => ({
    date: proseDate(text),
    text,
    province:
      text
        .match(/([A-Z][\w/ ]+?)\s+[Pp]rovince\b/)?.[1]
        ?.replace(/^.*,\s*/, "")
        .trim() ?? null,
  }));

  return {
    leaders,
    achievements: sections.achievements.map((a) => ({ leader: a.leader, text: a.text })),
    provinces,
    dedications,
    acquisitions: sections.acquisitions.map((a) => a.text),
    footnotes: sections.other.map((a) => a.text),
  };
}

function parseAdvisoryBoard(html) {
  const rows = [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => squash(toText(c[1]))),
  );
  const members = rows
    .filter((cells) => cells.length >= 3 && !/^S\/N$/i.test(cells[0]))
    .map((cells, i) => ({
      order: i + 1,
      legacySerial: cells[0] || null,
      name: cells[1] || null,
      portfolio: cells[2] || null,
    }));

  // Derive CMC leadership from portfolios like "CHAIRMAN, CMC 4" / "VICE CHAIRMAN, CMC 2".
  const cmcs = new Map();
  for (const m of members) {
    for (const hit of (m.portfolio ?? "").matchAll(
      /(VICE CHAIRMAN|V\.CHAIRMAN|CHAIRMAN|SECRETARY)[.,]?\s*CMC\s*(\d+)/gi,
    )) {
      const n = Number(hit[2]);
      const role = /V(ICE|\.)/i.test(hit[1])
        ? "viceChairman"
        : /SECRETARY/i.test(hit[1])
          ? "secretary"
          : "chairman";
      const cmc = cmcs.get(n) ?? {
        number: n,
        name: `CMC ${n}`,
        slug: `cmc-${n}`,
        chairman: null,
        viceChairman: null,
        secretary: null,
      };
      cmc[role] = m.name;
      cmcs.set(n, cmc);
    }
  }
  return { members, cmcs: [...cmcs.values()].sort((a, b) => a.number - b.number) };
}

function parseDirectorates(html) {
  const blocks = html
    .split(/<h4[^>]*>[\s\S]*?<\/h4>/i)
    .pop()
    .split(/(?=<p[^>]*>\s*<strong>\s*DIRECTORATE OF)/i);
  return blocks
    .map((block) => {
      // Headings are often split across adjacent <strong> runs mid-name, so take the whole run.
      const head = block.match(/(?:<strong>[\s\S]*?<\/strong>\s*)+/i);
      if (!head || !/DIRECTORATE OF/i.test(head[0])) return null;
      const title = squash(toText(head[0]).replace(/\n/g, " "));
      const [name, lead = ""] = title.split(/\s+[–-]\s+/);
      const director = squash(lead.replace(/^DIRECTORS?\s*(ARE|:)?\s*/i, "")) || null;
      const body = cleanHtml(block.replace(head[0], "").replace(/^\s*<\/p>/, ""));
      return {
        name: titleCase(name),
        slug: slugify(name.replace(/^DIRECTORATE OF\s+/i, "")),
        director,
        bodyHtml: body,
        bodyText: toText(body),
      };
    })
    .filter(Boolean);
}

function normalise(raw, media) {
  const byId = new Map(media.map((m) => [m.id, m]));
  const img = (id) => {
    const m = byId.get(id);
    return m ? { id: m.id, url: m.url, width: m.width, height: m.height, alt: m.alt } : null;
  };
  const acf = (type) =>
    raw[type].map((r) => ({
      ...r.acf,
      _id: r.id,
      _slug: r.slug,
      _title: decode(r.title?.rendered ?? ""),
      _date: r.date,
    }));
  const page = (slug) => raw["custom-pages"].find((p) => p.slug === slug)?.acf ?? {};
  const section = (id) => raw.sections.find((s) => s.id === id)?.acf ?? {};

  const history = parseHistory(page("our-history").content);
  const board = parseAdvisoryBoard(page("advisory-board").content);

  const babaAladuras = acf("pastor")
    .sort((a, b) => a.pastors_id - b.pastors_id)
    .map((p) => {
      const surname = squash(p.lastname).split(" ")[0].toUpperCase();
      const tenure = history.leaders.find((l) => l.heading.includes(surname));
      return {
        order: p.pastors_id,
        slug: slugify(`${p.firstname} ${p.lastname}`),
        honorific: squash(p.title),
        firstName: squash(p.firstname),
        lastName: squash(p.lastname),
        designation: squash(p.designation),
        tenure: tenure ? { from: tenure.from, to: tenure.to } : null,
        portrait: img(p.image),
        bioHtml: cleanHtml(p.content),
      };
    });

  // The current Baba Aladura exists only inside the history page.
  const current = history.leaders.find((l) => l.to === null);
  if (current) {
    babaAladuras.push({
      order: babaAladuras.length + 1,
      slug: "david-dabaye-lamjose-bob-manuel",
      honorific: "Elder (Dr.)",
      firstName: "David",
      lastName: "Dabaye Lamjose Bob-Manuel",
      designation: "Baba Aladura & Prelate",
      tenure: { from: current.from, to: null },
      portrait: null,
      bioHtml: current.paragraphs.map((p) => `<p>${p}</p>`).join("\n"),
    });
  }

  const welcome = section(140);
  const coreCards = acf("iconcard");
  const card = (title) => coreCards.find((c) => c.title === title) ?? {};

  return {
    "organisation.json": {
      name: "The Eternal Sacred Order of the Cherubim & Seraphim",
      shortName: "ESOCS",
      founded: 1925,
      founder: "Saint Moses Orimolade Tunolase",
      summary: squash(toText(raw.sections.find((s) => s.id === 498)?.acf.content)),
      vision: toText(card("Vision").content),
      mission: squash(toText(card("Mission").content)),
      coreValues: [...(card("Core Value").content ?? "").matchAll(/<li>\s*([A-Z])\s*-\s*([^<]+)<\/li>/g)].map(
        (m) => ({ letter: m[1], value: squash(m[2]) }),
      ),
      watchword: {
        text: "Sustained by God's Endless Mercies",
        reference: "Lamentations 3:21",
        image: img(section(158).image),
      },
      socials: acf("social-accounts").map((s) => ({ name: s._title, url: s.social_account_link })),
      welcomeMessage: {
        title: squash(welcome.title),
        subtitle: squash(welcome.subtitle),
        bodyHtml: cleanHtml(welcome.content),
      },
      givingAppeal: { title: section(146).title, body: section(146).content, image: img(section(146).image) },
    },
    "contacts.json": LEGACY_CONTACTS,
    "baba-aladuras.json": babaAladuras,
    "advisory-board.json": board.members,
    "cmcs.json": board.cmcs,
    "directorates.json": parseDirectorates(page("esocs-directorate").content),
    "provinces.json": history.provinces,
    "dedications.json": history.dedications,
    "milestones.json": {
      achievements: history.achievements,
      acquisitions: history.acquisitions,
      footnotes: history.footnotes,
    },
    "history.json": history.leaders.map((l) => ({
      heading: l.heading,
      from: l.from,
      to: l.to,
      paragraphs: l.paragraphs,
    })),
    "news.json": acf("news").map((n) => ({
      slug: slugify(n.title),
      title: squash(n.title),
      date: acfDate(n.date),
      body: squash(n.news_content),
      image: img(n.image),
    })),
    "events.json": acf("event").map((e) => ({
      slug: e._slug,
      title: squash(e.event_title),
      description: squash(e.description),
      date: acfDate(e.date),
      startTime: e.start_time || null,
      endTime: e.end_time || null,
      types: e.event_type ?? [],
      status: e.status,
      registrationUrl: e.registration_link || null,
      image: img(e.image),
    })),
    "galleries.json": acf("gallery").map((g) => ({
      slug: slugify(g.name),
      title: titleCase(g.name),
      published: g._date,
      cover: img(g["gallery-thumbnail"]),
      photos: (g["gallery-photos"] ?? []).map(img).filter(Boolean),
    })),
    "hero-slides.json": acf("slider").map((s) => ({
      title: s.slider_title,
      caption: orNull(s.slider_caption),
      image: img(s.slider_image),
      cta: s.button_url && s.button_url !== "#" ? { label: s.button_text, url: s.button_url } : null,
    })),
    "page-banners.json": acf("banner").map((b) => ({
      page: b.banner_page,
      caption: b.banner_caption,
      description: orNull(b.banner_description),
      image: img(b.banner_image),
    })),
    "service-times.json": acf("service_time").map((s) => ({
      title: s.service_title,
      sessions: [...(s.service_time ?? "").matchAll(/<li>([^:<]+):\s*([^<]+)<\/li>/g)].map((m) => ({
        name: squash(m[1]),
        time: squash(m[2]),
      })),
      needsVerification: true,
    })),
    "bank-accounts.json": acf("banks").map((b) => ({
      bank: b.bank_name,
      accountName: b.bank_account_name,
      accountNumber: String(b.bank_account_number),
      logo: img(b.bank_logo),
      // Legacy numbers are dummies (98765432 / 99987654); never publish these.
      placeholder: /^(98765432|99987654)$/.test(String(b.bank_account_number)),
    })),
  };
}

/**
 * Contact details hardcoded in the legacy SvelteKit bundle (footer and /contact-us),
 * not stored in WordPress. Transcribed from www.esocs.net as of 2026-09-24.
 */
const LEGACY_CONTACTS = {
  phones: [
    { label: "General", number: "+2348082563457" },
    { label: "Counselling hotline", number: "+2349167678828" },
  ],
  addresses: [
    {
      name: "National Headquarters",
      address: "9/11 Pearse Street, off Tejuosho, Surulere, Lagos",
      country: "NG",
    },
    {
      name: "Ebute-Metta General Headquarters Cathedral",
      // The history page gives 75 Odunfa Street for the same cathedral; confirm which is correct.
      address: "75 Ibadan Street (East), Ebute-Metta, Lagos",
      country: "NG",
    },
    {
      name: "National Headquarters Annex, Abuja",
      address: "31 Oyo Street, Area 2, Section 1, Garki, Abuja",
      country: "NG",
    },
    { name: "London Cathedral", address: "53 Chatham Street, London SE17 1PA", country: "GB" },
    { name: "New York", address: "981 Morris Avenue @ 164 Street, Bronx, NY 10456", country: "US" },
    { name: "Houston", address: "6103 Corporate Dr, Houston, TX 77036", country: "US" },
  ],
};

// ---------------------------------------------------------------------------
// Media download

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function downloadMedia(media) {
  const dir = path.join(OUT, "media");
  const queue = [...media];
  const failed = [];
  let done = 0;

  // Write to a .part file and rename, so an interrupted download is never mistaken for a complete one.
  const download = async (url, file) => {
    for (let attempt = 1; ; attempt++) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        await pipeline(Readable.fromWeb(res.body), createWriteStream(`${file}.part`));
        await rename(`${file}.part`, file);
        return;
      } catch (err) {
        await rm(`${file}.part`, { force: true });
        if (attempt >= 3) throw err;
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  };

  const worker = async () => {
    for (let m; (m = queue.shift());) {
      const rel = new URL(m.url).pathname.replace(/^\/wp-content\/uploads\//, "");
      const file = path.join(dir, rel);
      if (!(await exists(file))) {
        await mkdir(path.dirname(file), { recursive: true });
        try {
          await download(m.url, file);
        } catch (err) {
          failed.push(m.url);
          console.warn(`  failed ${m.url}: ${err.cause?.code ?? err.message}`);
          continue;
        }
      }
      if (++done % 50 === 0) console.log(`  media ${done}/${media.length}`);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  console.log(`  media ${done}/${media.length} done`);
  if (failed.length) {
    console.error(`  ${failed.length} failed; re-run with --media to retry them.`);
    process.exitCode = 1;
  }
}

// ---------------------------------------------------------------------------

const NOISE = new Set(["_links", "guid", "ping_status", "comment_status", "class_list", "template", "meta"]);
const strip = (record) => Object.fromEntries(Object.entries(record).filter(([key]) => !NOISE.has(key)));

async function main() {
  await mkdir(path.join(OUT, "raw"), { recursive: true });
  await mkdir(path.join(OUT, "seed"), { recursive: true });

  const raw = {};
  for (const type of TYPES) {
    raw[type] = (await getAll(type)).map(strip);
    await writeFile(path.join(OUT, "raw", `${type}.json`), JSON.stringify(raw[type], null, 2) + "\n");
    console.log(`raw/${type}.json  ${raw[type].length}`);
  }

  const media = mediaManifest(await getAll("media"));
  await writeFile(path.join(OUT, "media.json"), JSON.stringify(media, null, 2) + "\n");
  console.log(`media.json  ${media.length}`);

  for (const [file, data] of Object.entries(normalise(raw, media))) {
    await writeFile(path.join(OUT, "seed", file), JSON.stringify(data, null, 2) + "\n");
    console.log(`seed/${file}  ${Array.isArray(data) ? data.length : "object"}`);
  }

  if (process.argv.includes("--media")) await downloadMedia(media);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
