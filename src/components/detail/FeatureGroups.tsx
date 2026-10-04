import { Check } from "lucide-react";
import type { FeatureGroup } from "@/lib/types";

export function FeatureGroups({ groups }: { groups: FeatureGroup[] }) {
  if (!groups.length) return null;
  return (
    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group.category}>
          <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-ink">
            {group.category}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {group.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-sm text-muted"
              >
                <Check
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
