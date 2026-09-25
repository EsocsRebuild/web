import { describe, expect, it } from "vitest";

import { directionsUrl, routes } from "./routes";

describe("routes", () => {
  it("builds unit pages and their tabs", () => {
    expect(routes.unit("women")).toBe("/church/women");
    expect(routes.unit("cmc-9", "branches")).toBe("/church/cmc-9/branches");
  });

  it("omits empty query parameters and encodes values", () => {
    expect(routes.find()).toBe("/find");
    expect(routes.find({ q: "Port Harcourt", kind: undefined, view: "map" })).toBe(
      "/find?q=Port+Harcourt&view=map",
    );
    expect(routes.search("mother's day")).toBe("/search?q=mother%27s+day");
    expect(routes.signIn("/church/women")).toBe("/sign-in?next=%2Fchurch%2Fwomen");
  });

  it("encodes path segments", () => {
    expect(routes.post("a/b")).toBe("/posts/a%2Fb");
    expect(routes.glossary("CMC")).toBe("/glossary#CMC");
  });

  it("links directions to an address", () => {
    expect(directionsUrl("53 Chatham Street, London SE17 1PA")).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=53%20Chatham%20Street%2C%20London%20SE17%201PA",
    );
  });
});
