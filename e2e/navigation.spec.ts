import { expect, test } from "@playwright/test";

test("desktop top bar reaches every destination", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" }).first();
  await nav.getByRole("link", { name: "Events" }).click();
  await expect(page).toHaveURL(/\/events$/);
  await expect(nav.getByRole("link", { name: "Events" })).toHaveAttribute("aria-current", "page");
  await page
    .getByRole("navigation", { name: "More destinations" })
    .getByRole("button", { name: "More", exact: true })
    .click();
  await page.getByRole("dialog").getByRole("link", { name: "Women", exact: true }).click();
  await expect(page).toHaveURL(/\/church\/women$/);
});

test("phone bottom bar opens the More menu", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Phone only");
  await page.goto("/");
  await page.getByRole("button", { name: "More", exact: true }).click();
  const menu = page.getByRole("dialog");
  await expect(menu.getByRole("link", { name: "Youth" })).toBeVisible();
  await menu.getByRole("link", { name: "Youth" }).click();
  await expect(page).toHaveURL(/\/church\/youth$/);
});

test("search palette finds a church from anywhere", async ({ page }, testInfo) => {
  test.skip(Boolean(testInfo.project.use.hasTouch), "Keyboard shortcut");
  await page.goto("/history");
  await page.keyboard.press("/");
  const input = page.getByPlaceholder("Search churches, people, news and events…");
  await expect(input).toBeFocused();
  await input.fill("Mokola");
  // Churches are listed first; the dedication post about the same church follows.
  await page
    .getByRole("option", { name: /Mokola District Headquarters/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/church\/mokola-district-headquarters$/);
});

test("theme can be switched to dark", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Colour theme" }).click();
  await page.getByRole("menuitemradio", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("skip link moves focus to main content", async ({ page }, testInfo) => {
  test.skip(Boolean(testInfo.project.use.hasTouch), "Keyboard only");
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await skip.press("Enter");
  await expect(page).toHaveURL(/#main$/);
});

test("legacy esocs.net links redirect to their new pages", async ({ page }) => {
  await page.goto("/pastors/419");
  await expect(page).toHaveURL(/\/leaders\/moses-orimolade-tunolase$/);
  await page.goto("/gallery/1536");
  await expect(page).toHaveURL(/\/media\/albums\/100th-anniversary-celebration$/);
});
