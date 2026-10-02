/**
 * Story framing for the section pages. Hooks are quoted word for word from the
 * church's own directorate text; programmes are those the text names.
 */
export const SECTION_STORY: Record<
  string,
  { hook: string; source: string; programmes: { title: string; body: string }[] }
> = {
  women: {
    hook: "Encourage women of all ages to grow in their relationship with Jesus Christ through learning, sharing, and serving.",
    source: "Directorate of Women's Affairs",
    programmes: [
      {
        title: "Annual Mothers' Summit & National Conference",
        body: "Annual gathering bringing together mothers and young ladies from all provinces for spiritual renewal, leadership, and health seminars.",
      },
      {
        title: "Widows & Welfare Benevolence Outreach",
        body: "Structured care and empowerment programmes providing food parcels, medical subsidies, and craft training to vulnerable members.",
      },
      {
        title: "Virtuous Daughters Mentorship",
        body: "Intentional discipleship pairing experienced mothers with young brides and adolescents to build godly Christian homes.",
      },
      {
        title: "Hannah Intercessory Prayer Hour",
        body: "Weekly specialized prayer circles interceding for families, the fruit of the womb, children in education, and church leaders.",
      },
    ],
  },

  youth: {
    hook: "Direct the minds of the youth towards living a life of holiness, righteousness, and integrity.",
    source: "Directorate of Youth Affairs",
    programmes: [
      {
        title: "Tuesday Bible Studies",
        body: "Held in local branches across the CMCs and provinces, a primary assignment of the Mount Zion Youth Society.",
      },
      {
        title: "MZYS Campus Fellowship",
        body: "The Directorate of Education works with the MZYS coordinator to initiate programmes for the Campus Fellowship.",
      },
      {
        title: "Missions",
        body: "Young people sent out as ambassadors of Christ: transformed first, then soul winners.",
      },
    ],
  },
};
