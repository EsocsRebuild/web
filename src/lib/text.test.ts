import { describe, expect, it } from "vitest";

import { decodeEntities, displayCase, htmlToParagraphs } from "./text";

describe("decodeEntities", () => {
  it("decodes named and numeric entities", () => {
    expect(decodeEntities("Church&#8217;s &amp; Baba&rsquo;s &#x2014;")).toBe("Church’s & Baba’s —");
  });
});

describe("htmlToParagraphs", () => {
  it("splits paragraphs and drops styles, buttons and comments", () => {
    const html = `<style>p{color:red}</style><p style="x">First <strong>one</strong>.</p>\r\n<p>Second&nbsp;one.</p><!--hidden--><button>Find out</button>`;
    expect(htmlToParagraphs(html)).toEqual(["First one.", "Second one."]);
  });

  it("treats single line breaks inside a paragraph as spaces", () => {
    expect(htmlToParagraphs("<p>Stayed with Mr.\r\nTimothy Okulaja's 10-\nyear plan.</p>")).toEqual([
      "Stayed with Mr. Timothy Okulaja's 10- year plan.",
    ]);
  });

  it("splits on line breaks and blank lines", () => {
    expect(htmlToParagraphs("<p>Grace and peace.\r\n\r\nBeloved, we are witnesses.</p>")).toEqual([
      "Grace and peace.",
      "Beloved, we are witnesses.",
    ]);
    expect(htmlToParagraphs("<strong>Heading</strong> <br />\nBody text")).toEqual(["Heading", "Body text"]);
  });

  it("handles empty input", () => {
    expect(htmlToParagraphs(null)).toEqual([]);
    expect(htmlToParagraphs("")).toEqual([]);
  });
});

describe("displayCase", () => {
  it.each([
    ["HIS MOST EMINENCE (DR) DAVID D. L. BOB-MANUEL", "His Most Eminence (Dr) David D. L. Bob-Manuel"],
    ["SUP. AP. GEN.  PROF. (DR.) W.O.C. UGWU", "Sup. Ap. Gen. Prof. (Dr.) W.O.C. Ugwu"],
    ["SUP. AP. GEN.  (DR) E. F. FALOUGHI (OON)", "Sup. Ap. Gen. (Dr) E. F. Faloughi (OON)"],
    [
      "CHAIRMAN, CMC 4 AND DIRECTOR - DIRECTORATE OF EVANGELISM",
      "Chairman, CMC 4 and Director - Directorate of Evangelism",
    ],
    ["SUP. AP. GEN.   'BIODUN SANYAOLU", "Sup. Ap. Gen. 'Biodun Sanyaolu"],
    ["100TH ANNIVERSARY CELEBRATION", "100th Anniversary Celebration"],
    ["CHILDREN'S DAY CELEBRATION", "Children's Day Celebration"],
  ])("%s", (input, expected) => {
    expect(displayCase(input)).toBe(expected);
  });
});
