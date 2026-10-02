import { MockLanguageModelV4 } from "ai/test";

import { siteConfig } from "@/config/site";
import type { SearchEntry } from "@/features/search/index-builder";
import { routes } from "@/lib/routes";

/**
 * The ESOCS Help guide's answers. It is an automated guide, not a person: it
 * recognises what someone is asking about and answers from the site's own index
 * (every church and page, the Baba Aladuras, news and the church calendar), so it
 * never makes anything up. Anything it cannot answer is handed to a person.
 *
 * Pure and synchronous, so every answer is covered by unit tests.
 */

export type Topic =
  "find" | "events" | "give" | "prayer" | "store" | "contact" | "about" | "leaders" | "family";

export const TOPICS: { topic: Topic; label: string }[] = [
  { topic: "find", label: "Find a church" },
  { topic: "events", label: "Services & events" },
  { topic: "prayer", label: "Prayer request" },
  { topic: "give", label: "Give" },
  { topic: "store", label: "Store" },
  { topic: "about", label: "About ESOCS" },
  { topic: "contact", label: "Talk to someone" },
];

export interface GuideLink {
  label: string;
  href: string;
  hint?: string;
  kind?: "page" | "phone";
}

export interface GuideReply {
  text: string;
  links: GuideLink[];
  suggestions: Topic[];
}

export interface GuideContext {
  phones: readonly { label: string; number: string; display: string }[];
  headquarters: { readonly name: string; readonly address: string };
}

export const defaultGuideContext: GuideContext = {
  phones: siteConfig.contact.phones,
  headquarters: siteConfig.contact.headquarters,
};

const STOPWORDS = new Set(
  "a an and are at be can church churches do does esocs find for from get go have how i in is it me my near nearest of on or our please show some tell the there to want what when where which who with you your house houses prayer branch branches".split(
    " ",
  ),
);

/** Lower case, no accents or punctuation, single spaces. */
export function normalise(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The words that carry meaning in a question ("church in Ibadan" → ["ibadan"]). */
export function meaningfulWords(value: string) {
  return normalise(value)
    .split(" ")
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/**
 * Ranks index entries for a query. Every word must match somewhere (a whole word or
 * the start of one); titles count most, then subtitles, then extra keywords.
 */
export function searchIndex(
  index: SearchEntry[],
  query: string,
  options: { kinds?: SearchEntry["kind"][]; limit?: number } = {},
) {
  const words = meaningfulWords(query);
  if (!words.length) return [];
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of index) {
    if (options.kinds && !options.kinds.includes(entry.kind)) continue;
    const fields = [
      { words: normalise(entry.title).split(" "), weight: 4 },
      { words: normalise(entry.subtitle).split(" "), weight: 2 },
      { words: normalise(entry.keywords).split(" "), weight: 1 },
    ];
    let score = 0;
    let all = true;
    for (const w of words) {
      let best = 0;
      for (const f of fields) {
        for (const fw of f.words) {
          if (fw === w) best = Math.max(best, f.weight * 2);
          else if (fw.startsWith(w) && w.length >= 3) best = Math.max(best, f.weight);
        }
      }
      if (!best) all = false;
      score += best;
    }
    if (all && score) scored.push({ entry, score });
  }
  return scored
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, options.limit ?? 5)
    .map((s) => s.entry);
}

const INTENTS: { topic: Topic | "greeting" | "thanks"; pattern: RegExp }[] = [
  { topic: "greeting", pattern: /^(hi|hello|hey|good (morning|afternoon|evening)|greetings)\b/ },
  { topic: "thanks", pattern: /\b(thank|thanks|thank you|god bless)\b/ },
  { topic: "prayer", pattern: /\b(pray|prayer request|praying|counsel|counselling|counseling)\b/ },
  { topic: "contact", pattern: /\b(contact|call|phone|talk|speak|human|person|someone|reach|email)\b/ },
  { topic: "store", pattern: /\b(store|shop|buy|hymn book|hymnal|gown|sutana|garment|merch|bag|order)\b/ },
  {
    topic: "give",
    pattern: /\b(give|giving|donate|donation|offering|tithe|seed of love|support the church)\b/,
  },
  {
    topic: "events",
    pattern:
      /\b(event|events|service|services|programme|program|calendar|easter|christmas|lent|mother s day|father s day|when)\b/,
  },
  { topic: "leaders", pattern: /\b(baba aladura|aladura|leader|leaders|prelate|eminence|founder)\b/ },
  {
    topic: "family",
    pattern: /\b(women|woman|mothers|youth|mzys|young|children|directorate|directorates)\b/,
  },
  { topic: "about", pattern: /\b(about|history|founded|who are|belief|beliefs|vision|what is)\b/ },
  {
    topic: "find",
    pattern: /\b(find|near|nearest|location|where|address|directions|parish|province|district|cmc)\b/,
  },
];

/** Words that say what kind of thing is wanted, not which one ("the next service"). */
const GENERIC = new Set(
  "event events service services programme program calendar next date day baba aladura aladuras leader leaders prelate eminence".split(
    " ",
  ),
);

export function detectTopic(message: string) {
  const text = normalise(message);
  return INTENTS.find((i) => i.pattern.test(text))?.topic ?? null;
}

const toLink = (e: SearchEntry): GuideLink => ({
  label: e.title,
  href: e.href,
  hint: e.subtitle,
  kind: "page",
});

const phoneLinks = (ctx: GuideContext): GuideLink[] =>
  ctx.phones.map((p) => ({ label: p.display, href: `tel:${p.number}`, hint: p.label, kind: "phone" }));

export function topicReply(
  topic: Topic,
  index: SearchEntry[],
  ctx: GuideContext = defaultGuideContext,
): GuideReply {
  switch (topic) {
    case "find": {
      const count = index.filter((e) => e.kind === "page").length;
      return {
        text: `There are ${count} churches, provinces and headquarters in the directory. Type your town or area and I’ll look it up, or open Find a Church to search and see them on a map.`,
        links: [
          {
            label: "Find a Church",
            href: routes.find(),
            hint: "Search, filter and see the map",
            kind: "page",
          },
          {
            label: "The headquarters of the Order",
            href: routes.find({ kind: "headquarters" }),
            kind: "page",
          },
        ],
        suggestions: ["events", "contact"],
      };
    }
    case "events": {
      const next = index.filter((e) => e.kind === "event").slice(0, 4);
      return {
        text: next.length
          ? "These are the next dates on the church calendar:"
          : "There is nothing on the church calendar just now. The full calendar shows what is planned.",
        links: [
          ...next.map(toLink),
          { label: "The full church calendar", href: routes.events(), kind: "page" },
        ],
        suggestions: ["find", "prayer"],
      };
    }
    case "give":
      return {
        text: "Thank you for wanting to support the work of the Order. The Give page explains Seeds of Love and the ways to give.",
        links: [{ label: "Give", href: routes.give(), hint: "Seeds of Love", kind: "page" }],
        suggestions: ["store", "about"],
      };
    case "prayer": {
      const hotline = ctx.phones.find((p) => /counsel/i.test(p.label));
      return {
        text: "You can send a private prayer request: it is read only by the prayer team. If you would rather speak to someone, call the counselling hotline.",
        links: [
          { label: "Send a prayer request", href: routes.prayer(), hint: "Private", kind: "page" },
          ...(hotline ? phoneLinks({ ...ctx, phones: [hotline] }) : []),
        ],
        suggestions: ["contact", "find"],
      };
    }
    case "store":
      return {
        text: "The church store is being prepared. You can already browse hymn books, garments and centenary keepsakes; online orders open when it launches.",
        links: [
          { label: "Visit the store", href: routes.store(), kind: "page" },
          { label: "Your bag", href: routes.bag(), kind: "page" },
        ],
        suggestions: ["give", "contact"],
      };
    case "contact":
      return {
        text: `I’m an automated guide. To speak with a person, call the church, or write through the contact page. The ${ctx.headquarters.name} is at ${ctx.headquarters.address}.`,
        links: [...phoneLinks(ctx), { label: "Contact us", href: routes.contact(), kind: "page" }],
        suggestions: ["prayer", "find"],
      };
    case "about":
      return {
        text: "The Eternal Sacred Order of the Cherubim & Seraphim was founded in 1925 by Saint Moses Orimolade Tunolase. It is a worldwide Order of houses of prayer.",
        links: [
          { label: "Who we are", href: routes.unit("esocs"), kind: "page" },
          { label: "Our history", href: routes.history(), kind: "page" },
          { label: "The Baba Aladuras", href: routes.leaders(), kind: "page" },
        ],
        suggestions: ["leaders", "find"],
      };
    case "leaders": {
      const people = index.filter((e) => e.kind === "person");
      const current = people.filter((p) => /present/.test(p.subtitle));
      return {
        text: "The Order has been led by a succession of Baba Aladuras since its founding.",
        links: [
          ...current.map(toLink),
          { label: "All the Baba Aladuras", href: routes.leaders(), kind: "page" },
        ],
        suggestions: ["about", "family"],
      };
    }
    case "family":
      return {
        text: "Every generation has a place in the Order, with its own directorates and programmes.",
        links: [
          { label: "Women", href: routes.unit("women"), kind: "page" },
          { label: "Youth", href: routes.unit("youth"), kind: "page" },
          { label: "Directorates", href: routes.sections(), kind: "page" },
        ],
        suggestions: ["events", "find"],
      };
  }
}

export const GREETING: GuideReply = {
  text: "Hello, and welcome. I’m the ESOCS Help guide. I can help you find a house of prayer, see upcoming services and events, send a prayer request, give, or reach someone at the church. What would you like to do?",
  links: [],
  suggestions: TOPICS.map((t) => t.topic),
};

/** The answer to anything typed. `index` is null while it is still loading. */
export function respond(
  message: string,
  index: SearchEntry[] | null,
  ctx: GuideContext = defaultGuideContext,
): GuideReply {
  const topic = detectTopic(message);
  if (topic === "greeting") return GREETING;
  if (topic === "thanks") {
    return { text: "You’re welcome. God bless you.", links: [], suggestions: ["find", "events", "contact"] };
  }
  if (!index) {
    return {
      text: "I’m still loading the directory. Please try again in a moment.",
      links: [],
      suggestions: [],
    };
  }

  // A place or a name alongside "find"/"where" (or on its own): search the directory first.
  const words = meaningfulWords(message).filter(
    (w) => !["find", "where", "near", "nearest", "location", "address", "directions"].includes(w),
  );
  if ((topic === "find" || topic === null) && words.length) {
    const places = searchIndex(index, words.join(" "), { kinds: ["page"], limit: 5 });
    if (places.length) {
      return {
        text: `Here ${places.length === 1 ? "is the page" : "are the pages"} I found for “${words.join(" ")}”:`,
        links: [
          ...places.map(toLink),
          {
            label: "See every result in Find a Church",
            href: routes.find({ q: words.join(" ") }),
            kind: "page",
          },
        ],
        suggestions: ["events", "contact"],
      };
    }
  }

  // "When is Easter?", "Baba Aladura Orimolade": the specific event or shepherd first.
  const specific = topic === "events" ? "event" : topic === "leaders" ? "person" : null;
  const topicWords = words.filter((w) => !GENERIC.has(w));
  if (specific && topicWords.length) {
    const found = searchIndex(index, topicWords.join(" "), { kinds: [specific], limit: 4 });
    if (found.length) {
      return {
        text: found.length === 1 ? "Here it is:" : "Here’s what I found:",
        links: found.map(toLink),
        suggestions: topic === "events" ? ["find", "prayer"] : ["about", "family"],
      };
    }
  }

  if (topic && topic !== "find") return topicReply(topic, index, ctx);
  if (topic === "find" && !words.length) return topicReply("find", index, ctx);

  // Anything else: the whole index (people, news, events).
  const results = searchIndex(index, message, { limit: 5 });
  if (results.length) {
    return {
      text: "Here’s what I found:",
      links: [
        ...results.map(toLink),
        { label: "Search the whole site", href: routes.search(message), kind: "page" },
      ],
      suggestions: ["find", "contact"],
    };
  }
  return {
    text: "I couldn’t find that. Try a town, a church name or a topic, or choose one below. You can always talk to someone at the church.",
    links: [],
    suggestions: ["find", "events", "contact"],
  };
}

/**
 * Creates a streamable Vercel AI SDK compatible language model
 * grounded in the church knowledge base.
 */
export function createAssistantLanguageModel(
  query: string,
  index?: SearchEntry[] | null,
  ctx: GuideContext = defaultGuideContext,
) {
  const reply = respond(query, index ?? null, ctx);
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: new ReadableStream({
        async start(controller) {
          const words = reply.text.split(" ");
          for (let i = 0; i < words.length; i++) {
            const token = words[i] + (i < words.length - 1 ? " " : "");
            controller.enqueue({ type: "text-delta", id: "0", delta: token });
          }
          controller.close();
        },
      }),
    }),
  });
}
