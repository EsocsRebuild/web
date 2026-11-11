export interface DevotionalEntry {
  id: string;
  date: string;
  title: string;
  theme: string;
  scriptureReference: string;
  scriptureVerse: string;
  scriptureText: string;
  memoryVerse: string;
  exhortation: string[];
  actionStep: string;
  hymnTitle: string;
  hymnNumber: string;
  morningPrayer: string;
  eveningReading: string;
  author: string;
  authorTitle: string;
}

export const TODAY_DEVOTIONAL: DevotionalEntry = {
  id: "devotional-today",
  date: new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }),
  title: "Walking in Holy Diligence & Divine Favor",
  theme: "Faithfulness in the House of Prayer",
  scriptureReference: "Proverbs 4:20-23",
  scriptureVerse: "Proverbs 4:23",
  scriptureText: "Keep thy heart with all diligence; for out of it are the issues of life.",
  memoryVerse:
    "Hebrews 12:14 · Follow peace with all men, and holiness, without which no man shall see the Lord.",
  exhortation: [
    "In the journey of faith, spiritual diligence is the sacred anchor that keeps our souls steadfast amidst the tempest of worldly distraction. When the Holy Spirit revealed the Cherubim and Seraphim in 1925 through Saint Moses Orimolade Tunolase, it was founded upon the bedrock of unceasing prayer, holiness of conduct, and walking uprightly before the Most High.",
    "True diligence is not born of mere physical effort, but of an attuned inner spiritual ear. As you rise each morning, sanctify your heart before approaching the daily tasks. Set your gaze upon the heavenly sanctuary, knowing that the God of Mount Zion never slumbers nor sleeps.",
    "When you guard your thoughts, your words, and your actions with holy diligence, divine favor ceases to be a fleeting moment—it becomes the unbroken atmosphere in which you abide.",
  ],
  actionStep:
    "Pause for five minutes before your noon endeavors to recite the Lord's Prayer and whisper a word of blessing for three brethren in your province.",
  hymnTitle: "Holy, Holy, Holy, Lord God Almighty",
  hymnNumber: "ESOCS Hymn 24",
  morningPrayer:
    "O Sovereign Lord God of Cherubim and Seraphim, Creator of the ends of the earth: Grant me grace this day to walk circumspectly, keeping my heart unspotted from the world. Let Your holy light illumine my path, and let Your divine peace rest upon my household. Through Christ our Lord. Amen.",
  eveningReading: "Psalm 91:1-16 · The Secret Place of the Most High",
  author: "Directorate of Christian Education & Apostolic Ministry",
  authorTitle: "The Eternal Sacred Order of the Cherubim and Seraphim Worldwide",
};

export const WEEKLY_READING_PLAN = [
  { day: "Monday", scripture: "Psalm 23:1-6", theme: "The Lord is My Shepherd" },
  { day: "Tuesday", scripture: "Proverbs 3:5-8", theme: "Trust in the Lord with All Thine Heart" },
  { day: "Wednesday", scripture: "Isaiah 40:28-31", theme: "Mounting Up with Wings as Eagles" },
  { day: "Thursday", scripture: "Philippians 4:4-9", theme: "The Peace that Surpasseth Understanding" },
  { day: "Friday", scripture: "Hebrews 12:1-4", theme: "Looking unto Jesus, Author and Finisher" },
  { day: "Saturday", scripture: "Psalm 121:1-8", theme: "My Help Cometh from the Lord" },
  { day: "Sunday", scripture: "Revelation 4:1-11", theme: "Worship before the Heavenly Throne" },
];
