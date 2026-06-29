import type { Config, Tenant } from "./types";

/** A friendly message asking a tenant to report this cycle's meter readings. */
export function readingRequestMessage(
  tenant: Tenant,
  config: Config,
  periodLabel: string,
): string {
  const firstName = tenant.name.trim().split(/\s+/)[0] || "there";
  const utils: string[] = [];
  if (config.water.enabled && config.water.mode === "metered") {
    utils.push(`water (${config.water.unit})`);
  }
  if (config.electricity.enabled && config.electricity.mode === "metered") {
    utils.push(`electricity (${config.electricity.unit})`);
  }
  const reads = utils.length ? utils.join(" and ") : "meter";

  const from = config.profile.name ? `\n\n— ${config.profile.name}` : "";
  return `Hi ${firstName}, it's time for the ${periodLabel} bill. Could you please send me your current ${reads} meter reading${utils.length > 1 ? "s" : ""}? Thank you!${from}`;
}

/**
 * Share a message via the native share sheet, or fall back to copying it to
 * the clipboard. Returns "shared" | "copied" | "failed".
 */
export async function shareOrCopy(
  text: string,
  title = "Reading request",
): Promise<"shared" | "copied" | "failed"> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
      return "shared";
    }
  } catch {
    // user dismissed the share sheet — fall through to copy
  }
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
