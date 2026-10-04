import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buildWhatsAppUrl, generalInquiryMessage } from "@/lib/whatsapp";

export function HomeCta() {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* Oversized outline car silhouette */}
      <svg
        className="pointer-events-none absolute -right-16 bottom-0 h-[120%] w-auto text-white/[0.04]"
        viewBox="0 0 64 32"
        fill="currentColor"
        aria-hidden
      >
        <path d="M6 24c0-2 .3-6 2-9l4-6c1-1.8 2.6-4 6-4h24c2.6 0 4.4 1.3 5.6 3.4L52 12c5 .8 10 2.4 10 6v6H6z" />
      </svg>

      <div className="wrap relative z-10 flex flex-col items-start gap-6 py-20 lg:py-28">
        <h2 className="max-w-3xl text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          Your next car is closer than you think.
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-silver sm:text-lg">
          Explore our vehicles or speak directly with our team today.
        </p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button href="/cars" size="lg" withArrow>
            Explore Cars
          </Button>
          <Button
            href={buildWhatsAppUrl(generalInquiryMessage())}
            external
            size="lg"
            variant="whatsapp"
          >
            <WhatsAppIcon className="size-5" />
            Chat on WhatsApp
          </Button>
        </div>
      </div>
    </section>
  );
}
