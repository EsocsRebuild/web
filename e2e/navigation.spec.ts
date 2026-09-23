import { expect, test } from "@playwright/test";

test("mobile menu opens and lists navigation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "desktop", "Menu button is hidden on desktop");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Sermons" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
});

test("desktop navigation is visible", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Desktop only");
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Events" })).toBeVisible();
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
