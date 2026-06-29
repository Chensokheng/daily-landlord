

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Droplets,
  Phone,
  Plus,
  QrCode,
  Receipt,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
  Zap,
} from "lucide-react";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { useConfig, useConfigActions } from "@/hooks/use-config";
import type { UtilityConfig, UtilityMode } from "@/lib/types";
import { cn, formatUSD, imageFileToDataUrl } from "@/lib/utils";
import { Btn, Field, MobileFrame, MoneyField, Segmented, Switch } from "./ui";

type Step = "welcome" | "setup";

export function Onboarding() {
  const config = useConfig();
  const { completeOnboarding } = useConfigActions();
  const [step, setStep] = React.useState<Step>("welcome");

  const profileValid = config.profile.name.trim().length > 0;

  // Welcome is a full-bleed screen; setup is one editable form.
  if (step === "welcome") {
    return <Welcome onStart={() => setStep("setup")} />;
  }

  return (
    <MobileFrame>
      <header className="flex items-center gap-3 px-6 pt-6 pb-2">
        <button
          type="button"
          onClick={() => setStep("welcome")}
          className="pressable -ml-1 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-secondary"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </button>
        <span className="font-display text-[0.95rem] font-semibold tracking-tight text-ink">
          Set up Tally
        </span>
      </header>

      <main className="flex flex-1 flex-col px-6 pt-3 pb-6">
        <div className="animate-step flex flex-1 flex-col">
          <StepHead
            eyebrow="One screen"
            title="Your billing setup"
            sub="Fill it in once — everything here is editable, and you can change it later from settings."
          />

          <div className="space-y-8">
            <Section title="About you">
              <ProfileFields />
            </Section>
            <Section title="Water & electricity">
              <UtilityFields />
            </Section>
            <Section title="Other charges">
              <ExtrasFields />
            </Section>
            <Section title="Payment QR">
              <PaymentQrField />
            </Section>
          </div>

          <div className="mt-9 pt-2">
            <Btn full onClick={completeOnboarding} disabled={!profileValid}>
              <Check className="size-5" />
              Finish setup
            </Btn>
            {!profileValid && (
              <p className="mt-3 text-center text-[0.8rem] text-faint">
                Add your name to finish.
              </p>
            )}
          </div>
        </div>
      </main>
    </MobileFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Welcome                                                            */
/* ------------------------------------------------------------------ */

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <MobileFrame>
      <div className="flex flex-1 flex-col px-7 pt-20 pb-8">
        <div className="animate-rise flex flex-1 flex-col">
          {/* Mark */}
          <div className="relative w-fit">
            <div
              className="grid size-16 place-items-center rounded-[1.3rem] bg-brand text-white ring-brand"
              style={{ animation: "floatGlow 5s ease-in-out infinite" }}
            >
              <Receipt className="size-8" />
            </div>
            <Sparkles className="absolute -top-1 -right-2 size-5 text-brand-glow" />
          </div>

          <p className="mt-9 text-[0.82rem] font-medium tracking-[0.18em] text-brand uppercase">
            Tally
          </p>
          <h1 className="mt-3 font-display text-[2.6rem] leading-[1.04] font-extrabold tracking-tight text-balance text-ink">
            Tenant billing,
            <br />
            done in a minute.
          </h1>
          <p className="mt-4 max-w-[20rem] text-[1.02rem] leading-relaxed text-ink-soft">
            Set your fees once. Add your tenants. Punch in the meter readings
            and send a clean invoice — straight from your phone.
          </p>

          <ul className="mt-9 space-y-3.5">
            {[
              { icon: Building2, t: "Configure water, power & extra fees" },
              { icon: User, t: "Keep your tenants in one place" },
              { icon: Receipt, t: "Generate & share invoices instantly" },
            ].map(({ icon: Icon, t }, i) => (
              <li
                key={t}
                className="animate-rise flex items-center gap-3.5"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-brand ring-soft">
                  <Icon className="size-5" />
                </span>
                <span className="text-[0.98rem] text-ink-soft">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-rise" style={{ animationDelay: "0.5s" }}>
          <Btn full onClick={onStart}>
            Set up my account
            <ArrowRight className="size-5" />
          </Btn>
          <p className="mt-3 text-center text-[0.8rem] text-faint">
            Everything stays on this device.
          </p>
        </div>
      </div>
    </MobileFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Layout helpers                                                     */
/* ------------------------------------------------------------------ */

function StepHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-7">
      <p className="text-[0.78rem] font-medium tracking-[0.16em] text-brand uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-[1.9rem] leading-tight font-bold tracking-tight text-ink">
        {title}
      </h2>
      <p className="mt-2 text-[0.98rem] leading-relaxed text-ink-soft">{sub}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3.5 text-[0.78rem] font-medium tracking-[0.16em] text-faint uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Profile                                                            */
/* ------------------------------------------------------------------ */

export function ProfileFields() {
  const config = useConfig();
  const { updateProfile } = useConfigActions();
  const p = config.profile;
  return (
    <div className="space-y-5">
      <Field label="Your name">
        <div className="relative">
          <User className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-faint" />
          <Input
            className="pl-12"
            placeholder="e.g. Sokheng Chen"
            value={p.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
          />
        </div>
      </Field>
      <Field label="Property name" hint="optional">
        <div className="relative">
          <Building2 className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-faint" />
          <Input
            className="pl-12"
            placeholder="e.g. Riverside Apartments"
            value={p.property}
            onChange={(e) => updateProfile({ property: e.target.value })}
          />
        </div>
      </Field>
      <Field label="Phone number" hint="optional">
        <div className="relative">
          <Phone className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-faint" />
          <Input
            className="pl-12"
            type="tel"
            inputMode="tel"
            placeholder="e.g. 012 345 678"
            value={p.phone}
            onChange={(e) => updateProfile({ phone: e.target.value })}
          />
        </div>
      </Field>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Utilities — water (m³) & electricity (kWh)                         */
/* ------------------------------------------------------------------ */

export function UtilityFields() {
  return (
    <div className="space-y-4">
      <UtilityCard
        which="water"
        icon={<Droplets className="size-5" />}
        tint="text-sky-600"
        name="Water"
      />
      <UtilityCard
        which="electricity"
        icon={<Zap className="size-5" />}
        tint="text-amber-500"
        name="Electricity"
      />
    </div>
  );
}

function UtilityCard({
  which,
  icon,
  tint,
  name,
}: {
  which: "water" | "electricity";
  icon: React.ReactNode;
  tint: string;
  name: string;
}) {
  const config = useConfig();
  const { updateUtility } = useConfigActions();
  const u: UtilityConfig = config[which];

  return (
    <div
      className={cn(
        "rounded-3xl border border-line bg-surface p-4 ring-card transition-opacity",
        !u.enabled && "opacity-60",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-secondary",
            tint,
          )}
        >
          {icon}
        </span>
        <div className="flex-1">
          <p className="font-display text-[1.1rem] font-semibold text-ink">
            {name}
          </p>
          <p className="text-[0.8rem] text-faint">
            {u.enabled
              ? u.mode === "metered"
                ? `${formatUSD(u.rate)} per ${u.unit}`
                : `${formatUSD(u.flatAmount)} flat / cycle`
              : "Not charged"}
          </p>
        </div>
        <Switch
          checked={u.enabled}
          onChange={(v) => updateUtility(which, { enabled: v })}
        />
      </div>

      {u.enabled && (
        <div className="mt-4 space-y-4 border-t border-line pt-4">
          <Segmented<UtilityMode>
            value={u.mode}
            onChange={(mode) => updateUtility(which, { mode })}
            options={[
              { value: "metered", label: "Metered" },
              { value: "flat", label: "Flat fee" },
            ]}
          />

          {u.mode === "metered" ? (
            <Field label={`Rate per ${u.unit}`}>
              <MoneyField
                value={u.rate}
                onValueChange={(rate) => updateUtility(which, { rate })}
                suffix={`/ ${u.unit}`}
              />
            </Field>
          ) : (
            <Field label="Monthly amount">
              <MoneyField
                value={u.flatAmount}
                onValueChange={(flatAmount) =>
                  updateUtility(which, { flatAmount })
                }
              />
            </Field>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Extra fees                                                         */
/* ------------------------------------------------------------------ */

export function ExtrasFields() {
  const config = useConfig();
  const { addExtra, removeExtra } = useConfigActions();
  const extras = config.extras;
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState(0);

  const canAdd = name.trim().length > 0 && amount > 0;

  const submit = () => {
    if (!canAdd) return;
    addExtra({ name: name.trim(), amount });
    setName("");
    setAmount(0);
  };

  return (
    <div>
      {/* Existing fees */}
      {extras.length > 0 && (
        <ul className="mb-4 space-y-2.5">
          {extras.map((fee) => (
            <li
              key={fee.id}
              className="animate-step flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 ring-soft"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-brand-wash text-brand-ink">
                <Receipt className="size-4" />
              </span>
              <span className="flex-1 truncate text-[0.98rem] text-ink">
                {fee.name}
              </span>
              <span className="nums font-mono text-[0.95rem] font-medium text-ink">
                {formatUSD(fee.amount)}
              </span>
              <button
                type="button"
                onClick={() => removeExtra(fee.id)}
                className="pressable grid size-7 place-items-center rounded-full text-faint hover:bg-secondary hover:text-destructive"
                aria-label={`Remove ${fee.name}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new */}
      <div className="rounded-3xl border border-dashed border-line2 bg-surface/60 p-4">
        <div className="grid grid-cols-[1fr_8.5rem] gap-3">
          <Field label="Fee name">
            <Input
              placeholder="e.g. Parking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
          </Field>
          <Field label="Amount">
            <MoneyField value={amount} onValueChange={setAmount} />
          </Field>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!canAdd}
          className="pressable mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-wash py-3 text-[0.92rem] font-medium text-brand-ink transition-opacity hover:bg-brand-wash/70 disabled:opacity-40"
        >
          <Plus className="size-4" />
          Add fee
        </button>
      </div>

      {extras.length === 0 && (
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-[0.85rem] text-faint">
          <Trash2 className="size-4" />
          No extra fees yet — that&apos;s fine, you can skip this.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Payment QR — shown on invoices so tenants can pay                  */
/* ------------------------------------------------------------------ */

export function PaymentQrField() {
  const config = useConfig();
  const { setPaymentQr } = useConfigActions();
  const qr = config.paymentQr;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    setError(null);
    try {
      setPaymentQr(await imageFileToDataUrl(file));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't load that image.",
      );
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFile}
      />

      {qr ? (
        <div className="flex items-center gap-4 rounded-3xl border border-line bg-surface p-4 ring-card">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-line bg-white">
            {/* biome-ignore lint/performance/noImgElement: user-supplied data URL, not a static asset */}
            <img
              src={qr}
              alt="Your payment QR"
              className="size-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[1.02rem] font-semibold text-ink">
              QR added
            </p>
            <p className="text-[0.82rem] text-faint">
              Tenants will see this on every invoice.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={pick}
              className="pressable rounded-xl border border-line bg-surface px-3 py-1.5 text-[0.82rem] font-medium text-ink-soft hover:text-ink"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => setPaymentQr("")}
              className="pressable rounded-xl px-3 py-1.5 text-[0.82rem] font-medium text-faint hover:text-destructive"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          className="pressable flex w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-line2 bg-surface/60 px-4 py-7 text-center transition-colors hover:border-brand/50 hover:bg-brand-wash/30"
        >
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-wash text-brand-ink">
            <QrCode className="size-6" />
          </span>
          <span>
            <span className="flex items-center justify-center gap-1.5 font-display text-[1.02rem] font-semibold text-ink">
              <Upload className="size-4" />
              Upload payment QR
            </span>
            <span className="mt-1 block max-w-[16rem] text-[0.82rem] text-faint">
              Your bank or wallet QR — it&apos;ll appear on every invoice so
              tenants can pay you directly.
            </span>
          </span>
        </button>
      )}

      {error && (
        <p className="mt-2.5 text-[0.82rem] text-destructive">{error}</p>
      )}
    </div>
  );
}
