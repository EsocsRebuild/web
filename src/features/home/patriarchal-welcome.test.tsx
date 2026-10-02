import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { PatriarchalWelcome } from "./patriarchal-welcome";
import type { Organisation, Person } from "@/data/schema/content";

const mockMessage: Organisation["message"] = {
  title: "New Year Message",
  subtitle: "New Year Message by His Most Eminence, Baba Aladura & Prelate",
  body: [
    "Grace and peace be multiplied unto you in the precious name of our Lord and Savior Jesus Christ. Beloved, we are all witnesses to various excruciating challenges of last year that the whole world went through.",
    "God kept us alive for a purpose and the purpose is that we must begin to change our mindset and perception of living.",
    "To us as a church, despite the several challenges that militated against the world economy, we celebrated our centenary as an organisation purposed to advance the gospel of Jesus Christ.",
    "I have no doubt that the years ahead shall be tougher, given the trend of events around us. 1 Corinthians 15:58.",
    "Your praying father, HIS MOST EMINENCE, BABA ALADURA DR. DAVID D. L. BOB-MANUEL MOSES ORIMOLADE IX & PRELATE OF THE ESOCS CHURCH WORLDWIDE",
  ],
};

const mockShepherd: Person = {
  slug: "david-bob-manuel",
  order: 9,
  honorific: "His Most Eminence, Baba Aladura",
  name: "Dr. David D. L. Bob-Manuel",
  designation: "Baba Aladura & Prelate",
  tenure: { from: 2017, to: null },
  portrait: {
    url: "/media/legacy/2025/07/baba-aladura-new.jpg.webp",
    width: 800,
    height: 1000,
    alt: "Portrait of Dr. David D. L. Bob-Manuel",
  },
  bio: ["His Most Eminence was inducted as the 9th Baba Aladura..."],
};

describe("PatriarchalWelcome Component", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it("renders patriarchal welcome section with ecclesiastical credentials and scripture", () => {
    render(
      <PatriarchalWelcome
        message={mockMessage}
        shepherd={mockShepherd}
        portrait={mockShepherd.portrait}
        href="/posts/message-new-year-2026"
      />,
    );

    expect(screen.getByText("Welcome to ESOCS Worldwide")).toBeDefined();
    expect(screen.getByText("A Welcome from the Baba Aladura")).toBeDefined();
    expect(screen.getByText("Seat of the Baba Aladura & Prelate")).toBeDefined();
    expect(screen.getAllByText(/Dr\. David D\. L\. Bob-Manuel/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/1 Corinthians 15:58/i).length).toBeGreaterThan(0);
  });

  it("opens the dedicated liturgical epistle reader dialog when clicking read full epistle", () => {
    render(
      <PatriarchalWelcome
        message={mockMessage}
        shepherd={mockShepherd}
        portrait={mockShepherd.portrait}
        href="/posts/message-new-year-2026"
      />,
    );

    const readButton = screen.getByRole("button", { name: /Read Full Pastoral Epistle/i });
    expect(readButton).toBeDefined();

    fireEvent.click(readButton);

    // The modal should now be open
    expect(screen.getByText(/Apostolic Address to the Flock of Christ/i)).toBeDefined();
    expect(screen.getByText(/Patriarchal Epistle/i)).toBeDefined();
    expect(screen.getByText(/God kept us alive for a purpose/i)).toBeDefined();
  });

  it("allows switching typography size in the epistle reader dialog", () => {
    render(
      <PatriarchalWelcome
        message={mockMessage}
        shepherd={mockShepherd}
        portrait={mockShepherd.portrait}
        href="/posts/message-new-year-2026"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Read Full Pastoral Epistle/i }));

    const largeBtn = screen.getByTitle("Large font size");
    expect(largeBtn.getAttribute("data-active")).toBe("false");

    fireEvent.click(largeBtn);
    expect(largeBtn.getAttribute("data-active")).toBe("true");
  });

  it("copies pastoral blessing to clipboard", async () => {
    render(
      <PatriarchalWelcome
        message={mockMessage}
        shepherd={mockShepherd}
        portrait={mockShepherd.portrait}
        href="/posts/message-new-year-2026"
      />,
    );

    const copyBtn = screen.getByTitle("Copy opening pastoral blessing");
    fireEvent.click(copyBtn);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining("Grace and peace be multiplied unto you"),
    );
  });
});
