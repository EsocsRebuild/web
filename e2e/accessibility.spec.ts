import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { TEMPLATES } from "./routes";

for (const theme of ["light", "dark"] as const) {
  for (const path of [...TEMPLATES, "/design-system"]) {
    test(`${path} has no WCAG 2.1 AA violations (${theme})`, async ({ page }, testInfo) => {
      // Axe results do not depend on viewport; check themes on desktop, light on phones.
      test.skip(testInfo.project.name !== "desktop" && theme === "dark", "Dark theme checked on desktop");
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto(path);
      await page
        .waitForSelector('html[data-splash="seen"]', { state: "attached", timeout: 15_000 })
        .catch(() => {});
      const builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
      if (path === "/" && testInfo.project.name === "mobile-safari") {
        // WebKit cannot sample background pixels through transparent fixed headers over the dark hero.
        builder.exclude("[data-site-header]");
      }
      const results = await builder.analyze();
      const summary = results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      );
      expect(summary).toEqual([]);
    });
  }
}
