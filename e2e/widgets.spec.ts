import { expect, test, type Page } from "@playwright/test";

/** The dock waits for the opening splash; wait for it too. */
const afterSplash = (page: Page) =>
  page.waitForSelector('html[data-splash="seen"]', { state: "attached", timeout: 30_000 });

test.describe("section scroll reveal", () => {
  const opacity = (page: Page, selector: string) =>
    page.locator(selector).evaluate((el) => Number(getComputedStyle(el).opacity));

  test("sections below the fold wait, then rise into view; what is on screen is never hidden", async ({
    page,
  }) => {
    const hydration: string[] = [];
    page.on("console", (m) => /hydrat/i.test(m.text()) && hydration.push(m.text()));
    await page.goto("/");
    // The home page never goes fully quiet (the hero fetches its next scene every few
    // seconds), so wait for it to be interactive rather than for an idle network.
    await afterSplash(page);

    // The first sections, already on screen, are fully visible.
    await expect.poll(() => opacity(page, 'nav[aria-label="Start here"]')).toBe(1);

    const later = '[aria-labelledby="succession-heading"]';
    await expect.poll(() => opacity(page, later)).toBe(0);
    await page.locator(later).scrollIntoViewIfNeeded();
    await expect.poll(() => opacity(page, later)).toBe(1);

    // It animates without touching the page's HTML, so React never sees a mismatch.
    expect(hydration).toEqual([]);
  });

  test("with reduced motion nothing is ever hidden", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await afterSplash(page);
    await expect.poll(() => opacity(page, '[aria-labelledby="succession-heading"]')).toBe(1);
  });
});

test("back to top appears deep in the page, returns to the top and to the content", async ({ page }) => {
  await page.goto("/news");
  await afterSplash(page);
  const button = page.locator("[data-scroll-top]");
  await expect(button).toHaveAttribute("aria-hidden", "true");

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(button).not.toHaveAttribute("aria-hidden", "true");
  await button.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await expect(page.locator("#main")).toBeFocused();
});

test("ESOCS Help answers from the site and hands over to people", async ({ page }) => {
  await page.goto("/");
  await afterSplash(page);
  const launcher = page.getByRole("button", { name: /Open ESOCS Help/ });
  await launcher.click();
  const help = page.getByRole("dialog", { name: "ESOCS Help" });
  await expect(help).toContainText("I’m the ESOCS Help guide");

  await help.getByRole("textbox", { name: "Ask ESOCS Help" }).fill("Is there a church in Ibadan?");
  await help.getByRole("button", { name: "Send" }).click();
  await expect(help.getByRole("link", { name: /^Ibadan Province/ })).toBeVisible();

  await help.getByRole("button", { name: "Talk to someone" }).click();
  await expect(help.getByRole("link", { name: /\+234 808 256 3457/ })).toHaveAttribute(
    "href",
    "tel:+2348082563457",
  );

  // The panel fits the screen, and Escape closes it and returns focus to the launcher.
  const box = (await help.boundingBox())!;
  const vp = page.viewportSize()!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(vp.width);
  expect(box.y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press("Escape");
  await expect(help).toBeHidden();
  await expect(page.getByRole("button", { name: /Open ESOCS Help/ })).toBeFocused();

  // The conversation is kept for the visit.
  await page.getByRole("button", { name: /Open ESOCS Help/ }).click();
  await expect(help.getByRole("link", { name: /^Ibadan Province/ })).toBeVisible();
});

test("the dock never sits on the phone's tab bar", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Phone only");
  await page.goto("/");
  await afterSplash(page);
  const launcher = (await page.locator("[data-chat-launcher]").boundingBox())!;
  const tabBar = (await page.locator("nav[aria-label=Main]").last().boundingBox())!;
  expect(launcher.y + launcher.height).toBeLessThanOrEqual(tabBar.y);
});
