import { expect, test } from "@playwright/test";

test("the church family: children, youth, women and men, with more to scroll to", async ({ page }) => {
  await page.goto("/");
  const family = page.locator('[aria-labelledby="family-heading"]');
  await family.scrollIntoViewIfNeeded();
  await expect(family.getByRole("heading", { level: 3 })).toHaveText(["Children", "Youth", "Women", "Men"]);

  // The next card peeks in at the edge, so it is plain there is more.
  const region = family.getByRole("region", { name: /scroll for more/ });
  const box = (await region.boundingBox())!;
  const cards = family.getByRole("listitem");
  const second = (await cards.nth(1).boundingBox())!;
  const fourth = (await cards.nth(3).boundingBox())!;
  expect(fourth.x).toBeGreaterThan(box.x + box.width - 1);
  expect(second.x).toBeLessThan(box.x + box.width);

  // The dots show where you are and jump to a card; the arrows (from tablets up) step through.
  await family.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await family.getByRole("button", { name: "Show Youth" }).click();
  await expect(family.getByRole("button", { name: "Show Youth" })).toHaveAttribute("aria-current", "true");
  await family.getByRole("button", { name: "Show Men" }).click();
  await expect(family.getByRole("button", { name: "Show Men" })).toHaveAttribute("aria-current", "true");
  const next = family.getByRole("button", { name: "Next" });
  if (await next.isVisible()) {
    await expect(next).toBeDisabled();
    await family.getByRole("button", { name: "Previous" }).click();
    await expect(family.getByRole("button", { name: "Show Men" })).not.toHaveAttribute(
      "aria-current",
      "true",
    );
  }

  // Every photograph loads lazily, and arrives with its own blurred preview.
  const images = family.locator("img");
  await expect(images).toHaveCount(4);
  for (const img of await images.all()) await expect(img).toHaveAttribute("loading", "lazy");
  const html = await (await page.request.get("/")).text();
  const start = html.indexOf('id="family-heading"');
  const section = html.slice(start, html.indexOf("</section>", start));
  expect(section.match(/<img[^>]+background-image:url\(&quot;data:image\/svg\+xml/g)?.length).toBe(4);
});

test("an album renders in batches, adds more as you scroll, and still opens every photo", async ({
  page,
}) => {
  await page.goto("/media/albums/childrens-day-celebration");
  const photos = page.getByRole("button", { name: /^Open photo \d+ of 74$/ });
  await expect(photos).toHaveCount(24);
  await expect(page.getByRole("button", { name: /Show more photos/ })).toContainText("50 left");

  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  await page.getByRole("button", { name: /Show more photos/ }).scrollIntoViewIfNeeded();
  await expect.poll(() => photos.count()).toBeGreaterThan(24);

  await photos.first().click();
  await expect(page.getByRole("dialog")).toContainText("1 /");
});

test("the search dialog's code is fetched only when search is used", async ({ page }, testInfo) => {
  test.skip(Boolean(testInfo.project.use.hasTouch), "Keyboard shortcut");
  const scripts: string[] = [];
  page.on("request", (r) => r.resourceType() === "script" && scripts.push(r.url()));
  await page.goto("/history");
  await page.waitForLoadState("networkidle");
  const before = scripts.length;
  await page.keyboard.press("ControlOrMeta+k");
  await expect(page.getByRole("dialog", { name: "Search ESOCS" })).toBeVisible();
  expect(scripts.length).toBeGreaterThan(before);
});
