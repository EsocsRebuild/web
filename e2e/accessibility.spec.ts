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
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      const summary = results.violations.map(
        (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`,
      );
      expect(summary).toEqual([]);
    });
  }
}
