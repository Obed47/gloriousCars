/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import { SITE } from "@/lib/site";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import {
  buildWhatsAppUrl,
  generalInquiryMessage,
  testDriveMessage,
  vehicleInquiryMessage,
} from "@/lib/whatsapp";
import { makeVehicle } from "../fixtures/vehicles";

describe("buildWhatsAppUrl", () => {
  it("keeps only the digits of the number and encodes the text", () => {
    expect(buildWhatsAppUrl("Hi there & welcome", "+237 675938792")).toBe(
      "https://wa.me/237675938792?text=Hi%20there%20%26%20welcome",
    );
  });

  it("defaults to the dealership number from the site config", () => {
    expect(buildWhatsAppUrl("hello")).toBe(`https://wa.me/${SITE.whatsappNumber}?text=hello`);
  });

  it("encodes line breaks so the message arrives intact", () => {
    expect(buildWhatsAppUrl("a\nb")).toContain("a%0Ab");
  });
});

describe("vehicleInquiryMessage", () => {
  it("includes the details a salesperson needs", () => {
    const message = vehicleInquiryMessage(makeVehicle(), en);
    expect(message).toContain("Vehicle: 2024 BMW X5 xDrive40i");
    expect(message).toContain("Reference: PC-BMW-X5-0241");
    expect(message).toMatch(/Price: XAF\s68,500,000/);
    expect(message).toContain("Mileage: 12,000 km");
    expect(message).toContain("Location: Yaoundé — Bastos Branch");
  });

  it("builds French label lines from the French dictionary while vehicle data stays verbatim", () => {
    const message = vehicleInquiryMessage(makeVehicle(), fr);
    expect(message).toContain("Véhicule: 2024 BMW X5 xDrive40i");
    expect(message).toContain("Référence: PC-BMW-X5-0241");
    expect(message).toMatch(/Prix: XAF\s68,500,000/);
    expect(message).toContain("Kilométrage: 12,000 km");
    expect(message).toContain("Carburant: Petrol");
    expect(message).toContain("Boîte de vitesses: Automatic");
    expect(message).toContain("Lieu: Yaoundé — Bastos Branch");
    expect(message).toContain(SITE.name);
  });
});

describe("testDriveMessage", () => {
  const details = {
    name: "Amina",
    phone: "+237 6 00 00 00 00",
    date: "2026-10-10",
    time: "10:00",
    location: "Douala — Akwa Showroom",
  };

  it("lists the requested slot and location", () => {
    const message = testDriveMessage(makeVehicle(), details, en);
    expect(message).toContain("Name: Amina");
    expect(message).toContain("Preferred date: 2026-10-10");
    expect(message).toContain("Preferred time: 10:00");
    expect(message).toContain("Preferred location: Douala — Akwa Showroom");
  });

  it("leaves out optional lines that were not filled in", () => {
    const message = testDriveMessage(makeVehicle(), details, en);
    expect(message).not.toContain("Email:");
    expect(message).not.toContain("Note:");
  });

  it("includes the optional email and note when given", () => {
    const message = testDriveMessage(
      makeVehicle(),
      {
        ...details,
        email: "amina@example.com",
        message: "Afternoon if possible",
      },
      en,
    );
    expect(message).toContain("Email: amina@example.com");
    expect(message).toContain("Note: Afternoon if possible");
  });

  it("builds French label lines from the French dictionary while vehicle data stays verbatim", () => {
    const message = testDriveMessage(
      makeVehicle(),
      { ...details, email: "amina@example.com", message: "Afternoon if possible" },
      fr,
    );
    expect(message).toContain("Nom: Amina");
    expect(message).toContain("Date souhaitée: 2026-10-10");
    expect(message).toContain("Heure souhaitée: 10:00");
    expect(message).toContain("Lieu souhaité: Douala — Akwa Showroom");
    expect(message).toContain("E-mail: amina@example.com");
    expect(message).toContain("Note: Afternoon if possible");
    expect(message).toContain(SITE.name);
  });
});

describe("generalInquiryMessage", () => {
  it("greets the dealership by name", () => {
    expect(generalInquiryMessage(en)).toContain(SITE.name);
  });

  it("greets the dealership by name in French", () => {
    const message = generalInquiryMessage(fr);
    expect(message).toContain(SITE.name);
    expect(message).toContain("plus d'informations");
  });
});
