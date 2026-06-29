"use client";

import { Download } from "lucide-react";
import * as React from "react";
import { useT } from "@/lib/i18n";

/**
 * Registers the service worker (production only) and shows a small banner when
 * a new version is waiting, so the user can reload into it on demand instead of
 * being interrupted.
 */
export function PwaManager() {
  const t = useT();
  const [waiting, setWaiting] = React.useState<ServiceWorker | null>(null);

  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        // A worker already waiting from a previous visit.
        if (reg.waiting && navigator.serviceWorker.controller) {
          setWaiting(reg.waiting);
        }
        // A new worker that finished installing while the page is open.
        reg.addEventListener("updatefound", () => {
          const next = reg.installing;
          if (!next) return;
          next.addEventListener("statechange", () => {
            if (
              next.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaiting(next);
            }
          });
        });
      })
      .catch(() => {
        /* registration failed — app still works online */
      });

    // When the new worker takes control, reload once to pick up fresh assets.
    let reloaded = false;
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    return () =>
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
  }, []);

  if (!waiting) return null;

  return (
    <div className="animate-fade fixed inset-x-0 bottom-0 z-[70] mx-auto w-full max-w-[460px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-ink px-4 py-3 text-white shadow-[0_12px_40px_-12px_oklch(0.24_0.024_257/0.5)]">
        <Download className="size-4 shrink-0 text-white/80" />
        <p className="flex-1 text-[0.9rem] font-medium">
          {t("Update available")}
        </p>
        <button
          type="button"
          onClick={() => waiting.postMessage("SKIP_WAITING")}
          className="pressable shrink-0 rounded-xl bg-white px-3.5 py-1.5 text-[0.85rem] font-semibold text-ink"
        >
          {t("Reload")}
        </button>
      </div>
    </div>
  );
}
