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
    programmes: [],
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
