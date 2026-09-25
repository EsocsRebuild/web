import { expect, test } from "@playwright/test";

import { TEMPLATES } from "./routes";

for (const path of TEMPLATES) {
  test(`${path} renders without horizontal scroll`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("navigation targets are at least 40px on touch devices", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.use.hasTouch, "Touch-only check");
  await page.goto("/");
  const small = await page.$$eval(
    "header a, header button, nav[aria-label='Main'] a, nav[aria-label='Main'] button",
    (els) =>
      els
        .filter((el) => (el as HTMLElement).offsetParent !== null)
        .map((el) => ({
          r: el.getBoundingClientRect(),
          label: el.textContent?.trim() || el.getAttribute("aria-label"),
        }))
        .filter(({ r }) => r.height < 40)
        .map(({ r, label }) => `${label} ${Math.round(r.width)}x${Math.round(r.height)}`),
  );
  expect(small).toEqual([]);
});

test("unknown routes return 404 with a way forward", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Find a Church" }).last()).toBeVisible();
});
