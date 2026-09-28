import { expect, test, type Locator } from "@playwright/test";

const heightOf = (el: Locator) => el.evaluate((node) => node.getBoundingClientRect().height);

test("Read more opens the full text, and Show less returns it exactly as it was", async ({ page }) => {
  await page.goto("/news");
  const button = page.getByRole("button", { name: "Read more" }).first();
  await button.scrollIntoViewIfNeeded();
  const text = page.locator(`[id="${await button.getAttribute("aria-controls")}"]`);
  const collapsed = await heightOf(text);

  await button.click();
  const less = page.getByRole("button", { name: "Show less" }).first();
  await expect(less).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => heightOf(text)).toBeGreaterThan(collapsed + 20);

  await less.click();
  await expect(page.getByRole("button", { name: "Read more" }).first()).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  // Back to exactly the collapsed height once the animation settles, however many times it is used.
  await expect.poll(() => heightOf(text)).toBeLessThanOrEqual(collapsed + 1);

  await page.getByRole("button", { name: "Read more" }).first().click();
  await page.getByRole("button", { name: "Show less" }).first().click();
  await expect.poll(() => heightOf(text)).toBeLessThanOrEqual(collapsed + 1);
});

test("nothing on the page is cut off with an ellipsis", async ({ page }) => {
  for (const path of ["/", "/news", "/leaders", "/store"]) {
    await page.goto(path);
    const clipped = await page.evaluate(
      () =>
        [...document.querySelectorAll("body *")].filter((el) => {
          const cs = getComputedStyle(el);
          return (
            (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth) ||
            (cs.webkitLineClamp !== "none" && cs.webkitLineClamp !== "")
          );
        }).length,
    );
    expect(clipped, path).toBe(0);
  }
});
