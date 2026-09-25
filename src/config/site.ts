/**
 * Church identity. Every value here is taken from the church's own published
 * material (see data/legacy); nothing is a placeholder.
 */
export const siteConfig = {
  name: "ESOCS",
  fullName: "The Eternal Sacred Order of the Cherubim & Seraphim",
  description:
    "The worldwide home of the Eternal Sacred Order of the Cherubim & Seraphim: houses of prayer, provinces and headquarters, news, events, history and the succession of Baba Aladuras since 1925.",
  founded: 1925,
  locale: "en-GB",
  timeZone: "Africa/Lagos",
  currency: "NGN",

  contact: {
    phones: [
      { label: "General enquiries", number: "+2348082563457", display: "+234 808 256 3457" },
      { label: "Counselling hotline", number: "+2349167678828", display: "+234 916 767 8828" },
    ],
    headquarters: {
      name: "National Headquarters",
      address: "9/11 Pearse Street, off Tejuosho, Surulere, Lagos",
      country: "Nigeria",
    },
  },

  /** Keys match `socialIcons`. */
  socials: {
    youtube: "https://www.youtube.com/@esocschurch",
    facebook: "https://web.facebook.com/esocschurchpage/",
    instagram: "https://www.instagram.com/esocs.church",
    x: "https://x.com/esocschurch",
  },
  radio: "http://www.esocsradio.com/",
} as const;
