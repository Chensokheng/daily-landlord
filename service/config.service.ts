import { makeId } from "@/lib/id";
import { useAppStore } from "@/lib/store";
import {
  type Config,
  defaultState,
  type ExtraFee,
  type UtilityConfig,
} from "@/lib/types";

type UtilityKey = "water" | "electricity";

export function getConfig(): Config {
  return useAppStore.getState().config;
}

export function updateProfile(patch: Partial<Config["profile"]>) {
  useAppStore.setState((s) => ({
    config: { ...s.config, profile: { ...s.config.profile, ...patch } },
  }));
}

export function updateUtility(key: UtilityKey, patch: Partial<UtilityConfig>) {
  useAppStore.setState((s) => ({
    config: { ...s.config, [key]: { ...s.config[key], ...patch } },
  }));
}

export function addExtra(fee: Omit<ExtraFee, "id">) {
  useAppStore.setState((s) => ({
    config: {
      ...s.config,
      extras: [...s.config.extras, { ...fee, id: makeId() }],
    },
  }));
}

export function removeExtra(id: string) {
  useAppStore.setState((s) => ({
    config: {
      ...s.config,
      extras: s.config.extras.filter((e) => e.id !== id),
    },
  }));
}

export function setPaymentQr(dataUrl: string) {
  useAppStore.setState((s) => ({
    config: { ...s.config, paymentQr: dataUrl },
  }));
}

export function completeOnboarding() {
  useAppStore.setState({ onboarded: true });
}

export function resetAll() {
  useAppStore.setState({ ...defaultState }, true);
}
