/**
 * Development fixtures used until the content source (CMS or API) is connected.
 * Dates are relative to "now" so listings always look current.
 */
function daysFromNow(days: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

export const fixtureEvents = [
  {
    title: "Harvest Thanksgiving Service",
    href: "/events/harvest-thanksgiving",
    start: daysFromNow(6, 9),
    location: "Main Sanctuary",
    category: "Worship",
  },
  {
    title: "Youth Fellowship Night",
    href: "/events/youth-fellowship",
    start: daysFromNow(12, 17),
    location: "Youth Hall",
    category: "Youth",
  },
  {
    title: "Choir Anniversary",
    href: "/events/choir-anniversary",
    start: daysFromNow(20, 16),
    location: "Main Sanctuary",
    category: "Music",
  },
];

export const fixtureSermons = [
  {
    title: "Walking in the Light",
    href: "/sermons/walking-in-the-light",
    speaker: "Senior Pastor",
    date: daysFromNow(-3, 9),
    series: "Holiness",
    scripture: "1 John 1:5–10",
    durationSeconds: 2820,
  },
  {
    title: "The Prayer of Faith",
    href: "/sermons/prayer-of-faith",
    speaker: "Associate Pastor",
    date: daysFromNow(-10, 9),
    series: "Prayer",
    scripture: "James 5:13–18",
    durationSeconds: 2460,
  },
  {
    title: "Built on the Rock",
    href: "/sermons/built-on-the-rock",
    speaker: "Guest Minister",
    date: daysFromNow(-17, 9),
    series: "Foundations",
    scripture: "Matthew 7:24–27",
    durationSeconds: 3120,
  },
];
