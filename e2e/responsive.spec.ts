import { expect, test } from "@playwright/test";

const pages = ["/", "/design-system"];

for (const path of pages) {
  test(`${path} has no horizontal overflow`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("home page renders its primary heading and calls to action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Plan your visit" }).first()).toBeVisible();
});

test("interactive targets are at least 40px on touch devices", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, "Touch-only check");
  await page.goto("/");
  const small = await page.$$eval("header a, header button", (els) =>
    els
      .filter((el) => (el as HTMLElement).offsetParent !== null)
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.height < 40)
      .map((r) => `${Math.round(r.width)}x${Math.round(r.height)}`),
  );
  expect(small).toEqual([]);
});

test("unknown routes return 404", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
