import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Give</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Give" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled and busy while loading", () => {
    render(<Button loading>Send</Button>);
    const button = screen.getByRole("button", { name: /send/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("renders its child element when asChild is set", () => {
    render(
      <Button asChild>
        <a href="/visit">Plan your visit</a>
      </Button>,
    );
    expect(screen.getByRole("link", { name: "Plan your visit" })).toHaveAttribute("href", "/visit");
  });
});
