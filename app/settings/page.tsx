"use client";

import { useRouter } from "next/navigation";
import { AppGate } from "@/components/app/app-gate";
import { Settings } from "@/components/app/settings";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <AppGate>
      <Settings onBack={() => router.push("/")} />
    </AppGate>
  );
}
