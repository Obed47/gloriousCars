"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { TestDriveModal } from "./TestDriveModal";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buildWhatsAppUrl, vehicleInquiryMessage } from "@/lib/whatsapp";
import type { Vehicle } from "@/lib/types";

export function DetailCTAs({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState(false);
  const waHref = buildWhatsAppUrl(vehicleInquiryMessage(vehicle));
  const sold = vehicle.status === "Sold";

  return (
    <>
      {/* Inline (desktop + within page flow) */}
      <div className="flex flex-col gap-3">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex h-13 items-center justify-center gap-2.5 rounded-lg bg-[#25D366] px-6 text-[0.9375rem] font-semibold text-[#053019] shadow-[0_10px_24px_-12px_rgba(37,211,102,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#20bd5a]"
        >
          <WhatsAppIcon className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" />
          {sold ? "Ask about similar cars" : "Order / Inquire on WhatsApp"}
        </a>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-13 items-center justify-center gap-2.5 rounded-lg border border-line-strong bg-surface px-6 text-[0.9375rem] font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-ink"
        >
          <CalendarClock className="size-5" aria-hidden />
          Book a Test Drive
        </button>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface text-sm font-semibold text-ink"
          >
            <CalendarClock className="size-4" aria-hidden />
            Test Drive
          </button>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] text-sm font-semibold text-[#053019]"
          >
            <WhatsAppIcon className="size-4" />
            WhatsApp
          </a>
        </div>
      </div>

      <TestDriveModal
        vehicle={vehicle}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
