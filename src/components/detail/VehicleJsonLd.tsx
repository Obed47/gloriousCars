import { SITE } from "@/lib/site";
import { vehicleFullTitle } from "@/lib/slug";
import type { Vehicle } from "@/lib/types";

/** schema.org/Car structured data for rich results. */
export function VehicleJsonLd({
  vehicle,
  url,
}: {
  vehicle: Vehicle;
  url: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicleFullTitle(vehicle),
    description: vehicle.description,
    sku: vehicle.reference,
    url,
    image: vehicle.images.map((i) => i.url),
    brand: { "@type": "Brand", name: vehicle.brand },
    modelDate: String(vehicle.year),
    color: vehicle.color,
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    numberOfDoors: vehicle.doors,
    seatingCapacity: vehicle.seats,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "KMT",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: vehicle.currency,
      price: vehicle.price,
      availability:
        vehicle.status === "Available"
          ? "https://schema.org/InStock"
          : vehicle.status === "Reserved"
            ? "https://schema.org/LimitedAvailability"
            : "https://schema.org/SoldOut",
      url,
      seller: {
        "@type": "AutoDealer",
        "@id": `${SITE.url}#dealer`,
        name: SITE.legalName,
        url: SITE.url,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
