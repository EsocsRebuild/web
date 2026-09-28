/**
 * Church terms, from docs/ux/03-glossary.md. `confirmed: false` entries describe
 * only what the records show and are marked as awaiting the church's definition.
 */
export interface GlossaryEntry {
  term: string;
  id: string;
  group: "Leadership" | "Structure" | "Ranks and titles" | "Life of the church";
  text: string;
  confirmed: boolean;
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "holy-order",
    term: "Holy Order",
    group: "Leadership",
    confirmed: true,
    text: "How the church refers to itself: the Eternal Sacred Order of the Cherubim & Seraphim.",
  },
  {
    id: "baba-aladura",
    term: "Baba Aladura",
    group: "Leadership",
    confirmed: true,
    text: "The spiritual head of the Holy Order. The title began with the founder, whose uncommon anointing of effective prayers earned him the name “Baba Aladura”.",
  },
  {
    id: "prelate",
    term: "Prelate",
    group: "Leadership",
    confirmed: false,
    text: "A title held together with Baba Aladura by the current head of the Order.",
  },
  {
    id: "hme",
    term: "His Most Eminence (HME)",
    group: "Leadership",
    confirmed: true,
    text: "The form of address for the Baba Aladura.",
  },
  {
    id: "dba",
    term: "Deputy Baba Aladura (DBA)",
    group: "Leadership",
    confirmed: true,
    text: "One of four deputies to the Baba Aladura, numbered 1 to 4 on the Advisory Board.",
  },
  {
    id: "advisory-board",
    term: "Advisory Board",
    group: "Leadership",
    confirmed: true,
    text: "The governing council of senior leaders, chaired by the Baba Aladura. It appoints and inducts a new Baba Aladura.",
  },
  {
    id: "seat-of-baba-aladura",
    term: "Seat of Baba Aladura",
    group: "Leadership",
    confirmed: true,
    text: "The Baba Aladura's official seat. The Mount Zion General Headquarters cathedral was declared the Seat in 2017, and the Memorial Holy Temple in 2018.",
  },
  {
    id: "cmc",
    term: "CMC",
    group: "Structure",
    confirmed: false,
    text: "A regional council that groups provinces, led by a Chairman, Vice Chairman and Secretary. There are twelve, numbered CMC 1 to CMC 12.",
  },
  {
    id: "province",
    term: "Province",
    group: "Structure",
    confirmed: true,
    text: "A regional body of the church, led by a provincial Chairman serving a five-year term.",
  },
  {
    id: "special-area",
    term: "Special Area",
    group: "Structure",
    confirmed: true,
    text: "A church area not yet of provincial status. It can be upgraded: Canada Special Area became Canada Province in 2022.",
  },
  {
    id: "district",
    term: "District",
    group: "Structure",
    confirmed: false,
    text: "A grouping of houses of prayer within a province, with a District Headquarters.",
  },
  {
    id: "house-of-prayer",
    term: "House of Prayer",
    group: "Structure",
    confirmed: true,
    text: "A local church, also called a branch.",
  },
  {
    id: "pro-cathedral",
    term: "Cathedral and Pro-Cathedral",
    group: "Structure",
    confirmed: false,
    text: "Principal churches of a province or district.",
  },
  {
    id: "manse",
    term: "Manse",
    group: "Structure",
    confirmed: true,
    text: "A residence provided for the Baba Aladura, as at Onitsha, Enugu and Nando.",
  },
  {
    id: "directorate",
    term: "Directorate",
    group: "Structure",
    confirmed: true,
    text: "A department of the Holy Order led by a Director, such as Finance, or Media and Publicity.",
  },
  {
    id: "sup-ap-gen",
    term: "Sup. Ap. Gen.",
    group: "Ranks and titles",
    confirmed: false,
    text: "A senior title held by several Advisory Board members and CMC chairmen.",
  },
  {
    id: "ap-gen",
    term: "Ap. Gen.",
    group: "Ranks and titles",
    confirmed: false,
    text: "Apostle General, held by board members and CMC vice-chairmen.",
  },
  {
    id: "sag",
    term: "SAG",
    group: "Ranks and titles",
    confirmed: true,
    text: "Senior Apostle General. The current Baba Aladura was appointed Senior Apostle General in 2004.",
  },
  {
    id: "special-senior-apostle",
    term: "Special Senior Apostle",
    group: "Ranks and titles",
    confirmed: false,
    text: "Conferred on Bishop Dr. Joshua Kofi-Dankwa Amos on 19 June 2018.",
  },
  {
    id: "mothers",
    term: "Mother Cherub, Mother Seraph, Mother Captain",
    group: "Ranks and titles",
    confirmed: false,
    text: "Senior women's titles. The three serve together as Directors of Women's Affairs.",
  },
  {
    id: "mother-in-israel",
    term: "Mother-in-Israel",
    group: "Ranks and titles",
    confirmed: false,
    text: "A women's rank. The rank of Special Senior Mother-in-Israel was created on 2 October 2024.",
  },
  {
    id: "mzys",
    term: "MZYS",
    group: "Life of the church",
    confirmed: true,
    text: "The Mount Zion Youth Society, the youth body of the church, with a Campus Fellowship, overseen by the Directorate of Youth Affairs.",
  },
  {
    id: "watchword",
    term: "Watchword",
    group: "Life of the church",
    confirmed: true,
    text: "The church's guiding scripture: “Sustained by God's Endless Mercies” (Lamentations 3:21).",
  },
  {
    id: "flosh",
    term: "FLOSH",
    group: "Life of the church",
    confirmed: true,
    text: "The core values: Faith, Love, Orderliness, Service to humanity, Holiness.",
  },
  {
    id: "mothers-day",
    term: "ESOCS Mother's Day",
    group: "Life of the church",
    confirmed: true,
    text: "Observed on the fourth Sunday after Ash Wednesday, instituted on 8 April 2021.",
  },
  {
    id: "fathers-day",
    term: "ESOCS Father's Day",
    group: "Life of the church",
    confirmed: true,
    text: "Observed on the third Sunday of June, instituted on 8 April 2021.",
  },
];

export const glossaryEntry = (id: string) => GLOSSARY.find((g) => g.id === id);
