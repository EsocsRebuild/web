import { expect, test } from "@playwright/test";

test("J1 · find a house of prayer and get directions", async ({ page }) => {
  await page.goto("/find");
  await page.getByLabel("Town, province or church name").fill("Awka");
  await expect(page).toHaveURL(/q=Awka/);
  await page.getByRole("link", { name: "Mount Horeb, Umuike" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Mount Horeb, Umuike" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Directions" })).toHaveAttribute("href", /^https?:\/\/(?:www\.)?google\.com\/maps(?:[/?#]|$)/);
});

test("J6 · move up and across the structure without getting lost", async ({ page }) => {
  await page.goto("/church/diobu-provincial-headquarters");
  const trail = page.getByRole("navigation", { name: "Where this page sits in the church" });
  await expect(trail).toContainText("CMC 9");
  await trail.getByRole("link", { name: "Diobu Province" }).click();
  await expect(page).toHaveURL(/\/church\/diobu-province$/);
});

test("page tabs are linkable routes", async ({ page }) => {
  await page.goto("/church/esocs");
  await page
    .getByRole("navigation", { name: "Page sections" })
    .getByRole("link", { name: /Advisory Board/ })
    .click();
  await expect(page).toHaveURL(/\/church\/esocs\/leaders$/);
  await expect(page.getByRole("heading", { name: "The Advisory Board" })).toBeVisible();
});

test("feed filters live in the URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Filter posts" }).getByRole("link", { name: "Albums" }).click();
  await expect(page).toHaveURL(/\?type=album/);
  await expect(page.getByRole("article").first()).toContainText(/Celebration|Party|Lecture|Service/);
});

test("member actions explain that accounts are coming (production)", async ({ page }) => {
  await page.goto("/church/women");
  await page.getByRole("button", { name: "Follow" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Email or phone number").fill("ada@example.org");
  await dialog.getByRole("button", { name: "Send my code" }).click();
  await expect(dialog.getByRole("heading", { name: "Member accounts are coming soon" })).toBeVisible();
});

test("prayer requests validate and never lose what was written", async ({ page }) => {
  await page.goto("/prayer");
  await page.getByRole("button", { name: "Send my request" }).click();
  await expect(page.getByText("Please write your prayer request.")).toBeVisible();
  const field = page.getByLabel("Your prayer request");
  await field.fill("Please pray for my family.");
  await page.getByRole("button", { name: "Send my request" }).click();
  await expect(page.getByText("Online prayer requests are coming soon.")).toBeVisible();
  await expect(field).toHaveValue("Please pray for my family.");
});

test("events can be added to a calendar", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Downloads checked on larger screens");
  await page.goto("/events/easter-sunday-2027");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Add to calendar" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("easter-sunday-2027.ics");
});

test("albums open in the photo viewer", async ({ page }) => {
  await page.goto("/media/albums/childrens-day-celebration");
  await page.getByRole("button", { name: /Open photo 1 of/ }).click();
  const viewer = page.getByRole("dialog");
  await expect(viewer).toContainText("1 /");
  await page.keyboard.press("Escape");
  await expect(viewer).toBeHidden();
});
