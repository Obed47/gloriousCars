import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AboutVehicle } from "@/components/detail/AboutVehicle";
import { DetailCTAs } from "@/components/detail/DetailCTAs";
import { Gallery } from "@/components/detail/Gallery";
import { TestDriveModal } from "@/components/detail/TestDriveModal";
import { FavoritesProvider } from "@/components/providers/FavoritesProvider";
import { CompareProvider } from "@/components/providers/CompareProvider";
import { DetailSaveRow } from "@/components/detail/DetailSaveRow";
import { SITE } from "@/lib/site";
import { makeVehicle, photo } from "../fixtures/vehicles";

const vehicle = makeVehicle();

/** Local calendar date `days` from today, as the date input expects. */
function localDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

describe("TestDriveModal: validation", () => {
  let openSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
  });
  afterEach(() => openSpy.mockRestore());

  it("asks for the required details before booking", async () => {
    const user = userEvent.setup();
    render(<TestDriveModal vehicle={vehicle} open onClose={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Confirm Test Drive" }));
    expect(screen.getByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("We need a phone number to confirm.")).toBeInTheDocument();
    expect(screen.getByText("Choose a preferred date.")).toBeInTheDocument();
    expect(screen.getByText("Pick a time slot.")).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();
  });

  it("rejects a malformed email address", async () => {
    const user = userEvent.setup();
    render(<TestDriveModal vehicle={vehicle} open onClose={() => {}} />);
    await user.type(screen.getByLabelText(/Email/), "amina@");
    await user.click(screen.getByRole("button", { name: "Confirm Test Drive" }));
    expect(screen.getByText("That email doesn't look right.")).toBeInTheDocument();
  });

  it("rejects a date that has already passed", async () => {
    // Regression: the date input only set a visual minimum, so a past date could be
    // typed and sent to the showroom.
    const user = userEvent.setup();
    render(<TestDriveModal vehicle={vehicle} open onClose={() => {}} />);
    await user.type(screen.getByLabelText(/Full name/), "Amina");
    await user.type(screen.getByLabelText(/Phone number/), "+237 600 000 000");
    fireEvent.change(screen.getByLabelText(/Preferred date/), { target: { value: localDate(-3) } });
    await user.click(screen.getByRole("button", { name: "10:00" }));
    await user.click(screen.getByRole("button", { name: "Confirm Test Drive" }));
    expect(screen.getByText("Choose a date from today onwards.")).toBeInTheDocument();
    expect(openSpy).not.toHaveBeenCalled();
  });
});

describe("TestDriveModal: booking", () => {
  it("opens WhatsApp with the request and shows a confirmation", async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<TestDriveModal vehicle={vehicle} open onClose={() => {}} />);

    await user.type(screen.getByLabelText(/Full name/), "Amina Bello");
    await user.type(screen.getByLabelText(/Phone number/), "+237 600 000 000");
    fireEvent.change(screen.getByLabelText(/Preferred date/), { target: { value: localDate(5) } });
    await user.click(screen.getByRole("button", { name: "14:00" }));
    await user.selectOptions(screen.getByLabelText(/Preferred location/), SITE.locations[1]);
    await user.click(screen.getByRole("button", { name: "Confirm Test Drive" }));

    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target, features] = openSpy.mock.calls[0];
    expect(String(url)).toMatch(new RegExp(`^https://wa\\.me/${SITE.whatsappNumber}\\?text=`));
    const text = decodeURIComponent(String(url).split("text=")[1]);
    expect(text).toContain("Name: Amina Bello");
    expect(text).toContain("Preferred time: 14:00");
    expect(text).toContain(`Preferred location: ${SITE.locations[1]}`);
    expect(target).toBe("_blank");
    expect(features).toBe("noopener,noreferrer");

    expect(screen.getByText("Your test drive is requested")).toBeInTheDocument();
    openSpy.mockRestore();
  });

  it("closes on the Escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<TestDriveModal vehicle={vehicle} open onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("is a labelled modal dialog", () => {
    render(<TestDriveModal vehicle={vehicle} open onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Book your test drive" })).toHaveAttribute("aria-modal", "true");
  });
});

describe("TestDriveModal: keyboard focus", () => {
  function Harness() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Book a Test Drive</button>
        <TestDriveModal vehicle={vehicle} open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  it("keeps keyboard focus inside the dialog while it is open", async () => {
    // Regression: Tab could move focus to the page behind the modal.
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Book a Test Drive" }));
    const dialog = await screen.findByRole("dialog");
    for (let i = 0; i < 25; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement), `tab ${i}`).toBe(true);
    }
  });

  it("returns focus to the button that opened it when closed", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Book a Test Drive" });
    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});

describe("DetailCTAs", () => {
  it("builds a WhatsApp enquiry for the vehicle", () => {
    render(<DetailCTAs vehicle={vehicle} />);
    const [link] = screen.getAllByRole("link", { name: /Order \/ Inquire on WhatsApp/ });
    const text = decodeURIComponent(link.getAttribute("href")?.split("text=")[1] ?? "");
    expect(text).toContain("PC-BMW-X5-0241");
  });
});

describe("DetailSaveRow", () => {
  it("saves and compares a vehicle, and says so", async () => {
    const user = userEvent.setup();
    render(
      <FavoritesProvider>
        <CompareProvider>
          <DetailSaveRow vehicle={vehicle} />
        </CompareProvider>
      </FavoritesProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("button", { name: "Saved" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Compare" }));
    expect(screen.getByRole("button", { name: "Comparing" })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Gallery", () => {
  const images = [
    { url: photo("one"), alt: "", angle: "Front" as const },
    { url: photo("two"), alt: "", angle: "Rear" as const },
    { url: photo("three"), alt: "", angle: "Interior" as const },
  ];

  it("steps through photos with the arrows and wraps around", async () => {
    const user = userEvent.setup();
    render(<Gallery images={images} title="BMW X5" />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Previous image" }));
    await user.click(screen.getByRole("button", { name: "Previous image" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("jumps to a photo from its thumbnail", async () => {
    const user = userEvent.setup();
    render(<Gallery images={images} title="BMW X5" />);
    await user.click(screen.getByRole("button", { name: "View Interior" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "View Interior" })).toHaveAttribute("aria-current", "true");
  });

  it("opens a full-screen gallery that responds to the keyboard and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Gallery images={images} title="BMW X5" />);
    await user.click(screen.getByRole("button", { name: "Open full-screen gallery" }));
    const dialog = screen.getByRole("dialog", { name: "BMW X5 gallery" });
    await user.keyboard("{ArrowRight}");
    expect(within(dialog).getByText("2 / 3 · Rear")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("shows nothing rather than crashing when there are no photos", () => {
    const { container } = render(<Gallery images={[]} title="BMW X5" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("returns focus to the expand button when the full-screen gallery closes", async () => {
    const user = userEvent.setup();
    render(<Gallery images={images} title="BMW X5" />);
    const expand = screen.getByRole("button", { name: "Open full-screen gallery" });
    await user.click(expand);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(expand).toHaveFocus();
  });
});

describe("description and specification lists", () => {
  it("expands a long description", async () => {
    const user = userEvent.setup();
    const long = "A".repeat(300);
    render(<AboutVehicle description={long} />);
    const toggle = screen.getByRole("button", { name: "Read more" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Read less" })).toHaveAttribute("aria-expanded", "true");
  });

});
