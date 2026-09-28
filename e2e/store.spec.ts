import { expect, test } from "@playwright/test";

test("store: choose a size, add to the bag, and check out (orders not yet open)", async ({ page }) => {
  await page.goto("/store");
  await expect(page.getByRole("note")).toContainText("Store preview");
  await page.getByRole("link", { name: "White prayer gown (sutana)" }).click();
  await expect(page).toHaveURL(/\/store\/white-prayer-gown$/);

  // A size must be chosen, and sold-out sizes cannot be.
  await page.getByRole("button", { name: "Add to bag" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "size" })).toHaveText("Please choose a size.");
  await expect(page.getByRole("radio", { name: /XXL/ })).toBeDisabled();
  await page.getByText("M", { exact: true }).click();
  await page.getByRole("button", { name: "Add to bag" }).click();
  await expect(page.getByRole("link", { name: "Your bag, 1 item" }).first()).toBeAttached();

  await page.goto("/store/bag");
  const items = page.getByRole("list", { name: "Items in your bag" });
  await expect(items).toContainText("White prayer gown (sutana)");
  await expect(items).toContainText("Size: M");
  await page
    .getByRole("group", { name: /Quantity of White prayer gown/ })
    .getByRole("button", { name: "One more" })
    .click();
  await expect(page.getByRole("region", { name: "Order summary" })).toContainText("₦50,000");

  await page.getByRole("link", { name: "Continue to checkout" }).click();
  await expect(page).toHaveURL(/\/store\/checkout$/);
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByText("Please enter your full name.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Full name" })).toBeFocused();

  await page.getByRole("textbox", { name: "Full name" }).fill("Ada Obi");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("ada@example.org");
  await page.getByRole("textbox", { name: "Phone" }).fill("+234 808 000 0000");
  await page.getByRole("radio", { name: /Deliver to my address/ }).check();
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByText("Please enter the street address.")).toBeVisible();
  await page.getByRole("radio", { name: /Collect from/ }).check();
  await page.getByRole("button", { name: "Place order" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Online orders open" })).toBeVisible();
});

test("store categories are linkable pages", async ({ page }) => {
  await page.goto("/store");
  await page
    .getByRole("navigation", { name: "Store categories" })
    .getByRole("link", { name: "Centenary collection" })
    .click();
  await expect(page).toHaveURL(/\/store\/category\/centenary$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Centenary collection");
  await expect(page.getByRole("link", { name: "Centenary commemorative mug" })).toBeVisible();
});

test("newsletter sign-up checks the address and is honest that it opens soon", async ({ page }) => {
  await page.goto("/");
  const form = page.getByRole("form", { name: "Newsletter sign-up" });
  await form.getByRole("textbox", { name: "Email address" }).fill("not-an-email");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(form.getByText(/Please enter a valid email address/)).toBeVisible();
  await form.getByRole("textbox", { name: "Email address" }).fill("ada@example.org");
  await form.getByRole("button", { name: "Subscribe" }).click();
  await expect(form.getByRole("alert")).toContainText("Newsletter sign-up opens soon");
  await expect(form.getByRole("textbox", { name: "Email address" })).toHaveValue("ada@example.org");
});

test("home: the Baba Aladura's welcome comes before the life of the church, and the hero has no controls", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /Pause|Play/ })).toHaveCount(0);
  const welcome = page.getByRole("heading", { name: "Welcome to ESOCS Worldwide" });
  const feed = page.getByRole("heading", { name: "Life across the Order" });
  await expect(welcome).toBeVisible();
  const [w, f] = await Promise.all([welcome.boundingBox(), feed.boundingBox()]);
  expect(w!.y).toBeLessThan(f!.y);
  await expect(page.getByRole("link", { name: /Comment on the New Year Message/ })).toHaveAttribute(
    "href",
    /\/posts\//,
  );
});
