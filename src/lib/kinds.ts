import type { PostKind, UnitKind } from "@/data/schema/content";

/** How each kind of page is named and coloured, everywhere in the UI. */
export const UNIT_KIND: Record<
  UnitKind,
  { label: string; plural: string; colour: string; childLabel: string }
> = {
  "holy-order": {
    label: "The Holy Order",
    plural: "The Holy Order",
    colour: "var(--color-kind-holy-order)",
    childLabel: "Network",
  },
  headquarters: {
    label: "Headquarters",
    plural: "Headquarters",
    colour: "var(--color-kind-headquarters)",
    childLabel: "Houses of prayer",
  },
  cmc: { label: "CMC", plural: "CMCs", colour: "var(--color-kind-cmc)", childLabel: "Provinces" },
  province: {
    label: "Province",
    plural: "Provinces",
    colour: "var(--color-kind-province)",
    childLabel: "Branches",
  },
  "special-area": {
    label: "Special Area",
    plural: "Special Areas",
    colour: "var(--color-kind-province)",
    childLabel: "Branches",
  },
  district: {
    label: "District",
    plural: "Districts",
    colour: "var(--color-kind-district)",
    childLabel: "Branches",
  },
  branch: {
    label: "House of Prayer",
    plural: "Houses of Prayer",
    colour: "var(--color-kind-branch)",
    childLabel: "Branches",
  },
  section: {
    label: "Section",
    plural: "Sections",
    colour: "var(--color-kind-section)",
    childLabel: "Groups",
  },
  directorate: {
    label: "Directorate",
    plural: "Directorates",
    colour: "var(--color-kind-directorate)",
    childLabel: "Units",
  },
};

/** Directory filter order: the way people think about finding a church. */
export const FINDER_KINDS: UnitKind[] = [
  "branch",
  "district",
  "province",
  "special-area",
  "headquarters",
  "cmc",
  "section",
  "directorate",
];

export const POST_KIND: Record<PostKind, { label: string; plural: string }> = {
  message: { label: "Message", plural: "Messages" },
  news: { label: "News", plural: "News" },
  dedication: { label: "Dedication", plural: "Dedications" },
  album: { label: "Album", plural: "Albums" },
  milestone: { label: "Milestone", plural: "Milestones" },
};

export const COUNTRY_NAME: Record<string, string> = {
  NG: "Nigeria",
  GB: "United Kingdom",
  US: "United States",
  CA: "Canada",
  BE: "Belgium",
  GH: "Ghana",
};
