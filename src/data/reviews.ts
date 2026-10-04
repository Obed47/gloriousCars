export interface Review {
  id: string;
  name: string;
  location: string;
  rating: number; // 1–5
  quote: string;
  vehicle: string;
  date: string; // ISO
}

/** PLACEHOLDER testimonials for the demo. Replace with real, consented reviews. */
export const reviews: Review[] = [
  {
    id: "r1",
    name: "Arnaud M.",
    location: "Douala",
    rating: 5,
    quote:
      "I found the X5 online on a Sunday, booked a test drive for Tuesday, and drove it home Thursday. Every figure they quoted matched the car. No surprises.",
    vehicle: "BMW X5 xDrive40i",
    date: "2026-07-18",
  },
  {
    id: "r2",
    name: "Grace T.",
    location: "Yaoundé",
    rating: 5,
    quote:
      "The WhatsApp line is what sold me. I asked twenty questions about the RAV4 Hybrid and got real answers with photos within minutes, not a call centre script.",
    vehicle: "Toyota RAV4 Hybrid",
    date: "2026-06-30",
  },
  {
    id: "r3",
    name: "Steve N.",
    location: "Douala",
    rating: 4,
    quote:
      "Straightforward, professional team. The comparison tool helped me choose between the Q5 and the Tucson without a single pushy sales call.",
    vehicle: "Audi Q5 45 TFSI",
    date: "2026-06-12",
  },
  {
    id: "r4",
    name: "Larissa K.",
    location: "Kribi",
    rating: 5,
    quote:
      "They arranged for the Range Rover to be brought to a location near me for the test drive. The service report was thorough and honest about the tyres.",
    vehicle: "Range Rover Sport HSE",
    date: "2026-05-28",
  },
  {
    id: "r5",
    name: "Cédric F.",
    location: "Douala",
    rating: 5,
    quote:
      "Second car I've bought here. The photos are the actual car, the mileage is the actual mileage. That should be normal — with Glorious Cars it is.",
    vehicle: "Volkswagen Golf GTI",
    date: "2026-05-09",
  },
  {
    id: "r6",
    name: "Aminata B.",
    location: "Yaoundé",
    rating: 5,
    quote:
      "Booked the test drive online in under a minute. Confirmation came through on WhatsApp with the address and the name of the person to ask for.",
    vehicle: "Lexus RX 350 F Sport",
    date: "2026-04-22",
  },
];
