import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ImagesField } from "@/components/admin/ImagesField";
import { VehicleTable } from "@/components/admin/VehicleTable";
import { ContactForm } from "@/components/contact/ContactForm";
import { CompareView } from "@/components/compare/CompareView";
import { FavoritesView } from "@/components/favorites/FavoritesView";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { toAdminRow } from "@/lib/admin/vehicleSearch";
import { SITE } from "@/lib/site";
import { makeVehicle, photo, sampleCatalogue } from "../fixtures/vehicles";
import { renderWithProviders } from "../support/render";

const mocks = vi.hoisted(() => ({
  upload: vi.fn(),
  discard: vi.fn(),
}));

vi.mock("@/app/admin/actions", () => ({
  deleteVehicle: vi.fn(),
  setVehicleFeatured: vi.fn(),
  setVehicleStatus: vi.fn(),
}));

vi.mock("@/lib/admin/imageUpload", () => ({
  IMAGE_ACCEPT: "image/jpeg,image/png,image/webp,image/avif",
  uploadVehicleImage: mocks.upload,
  discardUploadedImage: mocks.discard,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin",
  useRouter: () => ({ push() {}, replace() {}, refresh() {} }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  mocks.upload.mockReset();
  mocks.discard.mockReset();
});

describe("VehicleTable (admin list)", () => {
  const rows = sampleCatalogue().map(toAdminRow);

  it("filters the list as the admin types, and reports the count", async () => {
    const user = userEvent.setup();
    render(<VehicleTable rows={rows} isAdmin={false} initialQuery="" />);
    await user.type(screen.getByRole("searchbox", { name: "Search vehicles" }), "toyota");
    expect(screen.getByText("Showing 1 of 5 vehicles")).toBeInTheDocument();
    expect(screen.getByText("2023 Toyota RAV4 Hybrid")).toBeInTheDocument();
    expect(screen.queryByText("2024 BMW X5 xDrive40i")).not.toBeInTheDocument();
  });

  it("starts pre-filled from the URL", () => {
    render(<VehicleTable rows={rows} isAdmin={false} initialQuery="audi" />);
    expect(screen.getByRole("searchbox", { name: "Search vehicles" })).toHaveValue("audi");
  });

  it("mirrors the search into the URL so a refresh keeps it", async () => {
    const user = userEvent.setup();
    render(<VehicleTable rows={rows} isAdmin={false} initialQuery="" />);
    await user.type(screen.getByRole("searchbox", { name: "Search vehicles" }), "bmw");
    await waitFor(() => expect(new URL(window.location.href).searchParams.get("q")).toBe("bmw"));
  });

  it("clears the search with Escape", async () => {
    const user = userEvent.setup();
    render(<VehicleTable rows={rows} isAdmin={false} initialQuery="bmw" />);
    const box = screen.getByRole("searchbox", { name: "Search vehicles" });
    await user.click(box);
    await user.keyboard("{Escape}");
    expect(box).toHaveValue("");
  });

  it("explains a search with no matches and offers to clear it", async () => {
    const user = userEvent.setup();
    render(<VehicleTable rows={rows} isAdmin={false} initialQuery="" />);
    await user.type(screen.getByRole("searchbox", { name: "Search vehicles" }), "lamborghini");
    const empty = screen.getByText(/No vehicles match/).parentElement as HTMLElement;
    await user.click(within(empty).getByRole("button", { name: "Clear search" }));
    expect(screen.getByText("5 vehicles")).toBeInTheDocument();
  });

  it("offers Delete only to administrators", () => {
    const { unmount } = render(<VehicleTable rows={rows} isAdmin={false} initialQuery="" />);
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    unmount();
    render(<VehicleTable rows={rows} isAdmin initialQuery="" />);
    expect(screen.getAllByRole("button", { name: "Delete" }).length).toBeGreaterThan(0);
  });

  it("links sold vehicles without a public page", () => {
    render(<VehicleTable rows={rows} isAdmin={false} initialQuery="audi" />);
    expect(screen.queryByRole("link", { name: "View" })).not.toBeInTheDocument();
  });
});

describe("DeleteButton", () => {
  it("asks for confirmation and cancels the delete when refused", () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteButton label="2024 BMW X5" />);
    const notCancelled = fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(confirm).toHaveBeenCalledWith("Delete 2024 BMW X5? This cannot be undone.");
    expect(notCancelled).toBe(false); // default prevented: the form is not submitted
  });

  it("lets the delete go ahead once confirmed", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<DeleteButton label="2024 BMW X5" />);
    const notCancelled = fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(notCancelled).toBe(true);
  });
});

describe("ImagesField (photos)", () => {
  it("adds a photo row by link", async () => {
    const user = userEvent.setup();
    render(<ImagesField initial={[]} onBusyChange={() => {}} />);
    await user.click(screen.getByRole("button", { name: "Add photo by link" }));
    expect(screen.getByRole("textbox", { name: "Photo 1 URL" })).toBeInTheDocument();
  });

  it("uploads a chosen file and fills in its address", async () => {
    mocks.upload.mockResolvedValue({ url: photo("uploaded"), path: "vehicles/uploaded.jpg" });
    render(<ImagesField initial={[]} onBusyChange={() => {}} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["x"], "front.jpg", { type: "image/jpeg" });
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Photo 1 URL" })).toHaveValue(photo("uploaded")),
    );
    expect(mocks.upload).toHaveBeenCalledWith(file);
  });

  it("never sends the file's bytes with the form", () => {
    render(<ImagesField initial={[]} onBusyChange={() => {}} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).not.toHaveAttribute("name");
  });

  it("shows the reason when an upload fails", async () => {
    mocks.upload.mockRejectedValue(new Error("front.jpg: only JPEG, PNG, WebP or AVIF photos can be uploaded."));
    render(<ImagesField initial={[]} onBusyChange={() => {}} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "front.gif", { type: "image/gif" })] } });
    expect(await screen.findByRole("alert")).toHaveTextContent("only JPEG, PNG, WebP or AVIF");
  });

  it("makes a chosen photo the cover", async () => {
    const user = userEvent.setup();
    render(
      <ImagesField
        initial={[
          { url: photo("a"), alt: "A", angle: "Front" },
          { url: photo("b"), alt: "B", angle: "Rear" },
        ]}
        onBusyChange={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Make photo 2 the cover" }));
    expect(screen.getAllByRole("textbox", { name: /Photo \d URL/ })[0]).toHaveValue(photo("b"));
  });

  it("removes a photo row", async () => {
    const user = userEvent.setup();
    render(
      <ImagesField
        initial={[
          { url: photo("a"), alt: "", angle: "Front" },
          { url: photo("b"), alt: "", angle: "Rear" },
        ]}
        onBusyChange={() => {}}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Remove photo 2" }));
    expect(screen.getAllByRole("textbox", { name: /Photo \d URL/ })).toHaveLength(1);
  });

  it("deletes a photo uploaded this session when its row is removed", async () => {
    const user = userEvent.setup();
    mocks.upload.mockResolvedValue({ url: photo("tmp"), path: "vehicles/tmp.jpg" });
    render(<ImagesField initial={[]} onBusyChange={() => {}} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "tmp.jpg", { type: "image/jpeg" })] } });
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Photo 1 URL" })).toHaveValue(photo("tmp")));
    await user.click(screen.getByRole("button", { name: "Remove photo 1" }));
    expect(mocks.discard).toHaveBeenCalledWith("vehicles/tmp.jpg");
  });
});

describe("ContactForm", () => {
  it("hands the enquiry to WhatsApp with the details filled in", async () => {
    const user = userEvent.setup();
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactForm />);
    await user.type(screen.getByRole("textbox", { name: "Name" }), "Amina");
    await user.type(screen.getByRole("textbox", { name: "Email" }), "amina@example.com");
    await user.type(screen.getByRole("textbox", { name: "Message" }), "Is the RAV4 still available?");
    await user.click(screen.getByRole("button", { name: /Send via WhatsApp/ }));
    const url = String(open.mock.calls[0][0]);
    expect(url.startsWith(`https://wa.me/${SITE.whatsappNumber}?text=`)).toBe(true);
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("Subject: General enquiry");
    expect(text).toContain("Name: Amina");
    expect(text).toContain("Is the RAV4 still available?");
    expect(screen.getByText("We've opened WhatsApp for you")).toBeInTheDocument();
  });
});

describe("VehicleCard", () => {
  it("saves a vehicle to favourites from the card", async () => {
    const user = userEvent.setup();
    renderWithProviders(<VehicleCard vehicle={makeVehicle()} />);
    await user.click(screen.getByRole("button", { name: "Save BMW X5 xDrive40i to favorites" }));
    expect(screen.getByRole("button", { name: "Remove BMW X5 xDrive40i from favorites" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("disables the compare button when three vehicles are already picked", async () => {
    localStorage.setItem("glorious-cars:compare", JSON.stringify(["x1", "x2", "x3"]));
    renderWithProviders(<VehicleCard vehicle={makeVehicle()} />);
    const compare = await screen.findByRole("button", { name: "Add BMW X5 xDrive40i to comparison" });
    expect(compare).toBeDisabled();
    expect(compare).toHaveAttribute("title", "Comparison is full (max 3)");
  });

  it("links to the vehicle's detail page", () => {
    renderWithProviders(<VehicleCard vehicle={makeVehicle()} />);
    expect(screen.getByRole("link", { name: "BMW X5 xDrive40i" })).toHaveAttribute(
      "href",
      "/cars/bmw/x5-xdrive40i-2024-pc-bmw-x5-0241",
    );
  });
});

describe("CompareView and FavoritesView", () => {
  const [bmw, rav4] = sampleCatalogue();

  it("compares the vehicles that are still listed, and marks the best value", async () => {
    localStorage.setItem("glorious-cars:compare", JSON.stringify([bmw.id, rav4.id]));
    renderWithProviders(<CompareView vehicles={[bmw, rav4]} />);
    expect(await screen.findByText("Comparing 2 of 3")).toBeInTheDocument();
    const priceRow = screen.getByRole("rowheader", { name: "Price" }).closest("tr") as HTMLElement;
    expect(within(priceRow).getByText("Best")).toBeInTheDocument();
  });

  it("ignores a picked vehicle that is no longer listed", async () => {
    localStorage.setItem("glorious-cars:compare", JSON.stringify([bmw.id, "sold-away"]));
    renderWithProviders(<CompareView vehicles={[bmw]} />);
    expect(await screen.findByText("Comparing 1 of 3")).toBeInTheDocument();
  });

  it("explains how to start comparing when nothing is picked", async () => {
    renderWithProviders(<CompareView vehicles={[bmw]} />);
    expect(await screen.findByText("Nothing to compare yet")).toBeInTheDocument();
  });

  it("shows saved vehicles in the order they were saved", async () => {
    localStorage.setItem("glorious-cars:favorites", JSON.stringify([rav4.id, bmw.id]));
    renderWithProviders(<FavoritesView vehicles={[bmw, rav4]} />);
    expect(await screen.findByText("2 saved vehicles")).toBeInTheDocument();
    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles[0]).toContain("Toyota RAV4");
  });

  it("explains an empty favourites list", async () => {
    renderWithProviders(<FavoritesView vehicles={[bmw]} />);
    expect(await screen.findByText("No saved vehicles yet")).toBeInTheDocument();
  });
});
