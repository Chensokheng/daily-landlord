

import { Download } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useT } from "@/lib/i18n";

/**
 * Shows a small banner when vite-plugin-pwa has a new service worker waiting,
 * so the user reloads into the update on their own terms. The plugin handles
 * registration; we only render the prompt.
 */
export function PwaManager() {
  const t = useT();
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="animate-fade fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[460px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-ink px-4 py-3 text-white shadow-[0_12px_40px_-12px_oklch(0.24_0.024_257/0.5)]">
        <Download className="size-4 shrink-0 text-white/80" />
        <p className="flex-1 text-[0.9rem] font-medium">
          {t("Update available")}
        </p>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="pressable shrink-0 rounded-xl bg-white px-3.5 py-1.5 text-[0.85rem] font-semibold text-ink"
        >
          {t("Reload")}
        </button>
      </div>
    </div>
  );
}
