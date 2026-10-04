"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { WhatsAppIcon } from "@/components/ui/icons";
import { buildWhatsAppUrl, generalInquiryMessage } from "@/lib/whatsapp";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

const DETAIL_ROUTE = /^\/cars\/[^/]+\/[^/]+$/;
const STAFF_ROUTE = /^\/(admin|login)(\/|$)/;

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShown(true), reduced ? 0 : 900);
    return () => clearTimeout(t);
  }, [reduced]);

  // Keep clear of the mobile sticky action bar on vehicle detail pages.
  const raised = DETAIL_ROUTE.test(pathname);
  // Staff screens are not customer-facing.
  const hidden = STAFF_ROUTE.test(pathname);

  return (
    <AnimatePresence>
      {shown && !hidden && (
        <motion.a
          href={buildWhatsAppUrl(generalInquiryMessage())}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className={`group fixed right-4 z-50 flex items-center gap-0 overflow-hidden rounded-full bg-[#25D366] text-[#053019] shadow-lift transition-[gap,padding] duration-300 hover:gap-2 sm:right-6 ${
            raised ? "bottom-24 sm:bottom-6" : "bottom-5 sm:bottom-6"
          }`}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
        >
          <span className="flex size-14 shrink-0 items-center justify-center">
            <WhatsAppIcon className="size-7" />
          </span>
          <span className="max-w-0 whitespace-nowrap pr-0 text-sm font-semibold opacity-0 transition-[max-width,padding,opacity] duration-300 group-hover:max-w-[10rem] group-hover:pr-5 group-hover:opacity-100">
            Chat with us
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
