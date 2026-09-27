"use client";

import { useMemo, useState } from "react";
import { Card, CardBody, Chip, Input } from "@heroui/react";
import { ArrowLeft, BadgeCheck, Check, Copy, QrCode, ShieldCheck } from "lucide-react";
import Link from "next/link";
import McButton from "@/components/McButton";
import McText from "@/components/McText";
import { useAuth } from "@/components/AuthProvider";
import { UPI_ID, donationGoals, storeItems, upiQrUrl, type StoreItem } from "@/config/store";
import { formatINR } from "@/lib/format";
import { stripMcCodes } from "@/lib/mc-format";
import { saveReceipt } from "@/lib/orders";

type Step = "pick" | "pay" | "utr" | "done";

interface DoneOrder {
  id?: string;
  username: string;
  item: StoreItem;
  utr: string;
  persisted: boolean;
}

export default function StoreClient() {
  const { username: authed } = useAuth();
  const [step, setStep] = useState<Step>("pick");
  const [item, setItem] = useState<StoreItem | null>(null);
  const [name, setName] = useState("");
  const [utr, setUtr] = useState("");
  const [utrError, setUtrError] = useState("");
  const [nameError, setNameError] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState<DoneOrder | null>(null);

  const username = useMemo(
    () => (authed ?? name).trim(),
    [authed, name]
  );
  const qr = item ? upiQrUrl(item.id, username || "player", item.priceInr) : "";

  function pick(i: StoreItem) {
    setItem(i);
    setSubmitError("");
    if (!authed) setNameError("");
    setStep("pay");
  }

  async function copyUpi() {
    try {
      await navigator.clipboard.writeText(UPI_ID);
    } catch {
      // clipboard unavailable
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  function goUtr() {
    if (!authed) {
      if (!/^[A-Za-z0-9_]{3,16}$/.test(name.trim())) {
        setNameError("Enter your exact Minecraft username first.");
        return;
      }
    }
    setNameError("");
    setStep("utr");
  }

  async function submit() {
    setUtrError("");
    setSubmitError("");
    const clean = utr.replace(/\D/g, "").slice(0, 12);
    if (!/^\d{12}$/.test(clean)) {
      setUtrError("Enter the 12-digit UPI reference / UTR number from your payment app.");
      return;
    }
    if (!item) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/store/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, itemId: item.id, utr: clean }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setSubmitError(json?.error ?? "Could not submit the order. Try again.");
        return;
      }
      saveReceipt({
        id: json.order?.id,
        username,
        itemId: item.id,
        itemName: item.name,
        amountInr: item.priceInr,
        utr: clean,
        status: "pending",
        createdAt: new Date().toISOString(),
        persisted: Boolean(json.persisted),
      });
      setDone({
        id: json.order?.id,
        username,
        item,
        utr: clean,
        persisted: Boolean(json.persisted),
      });
      setStep("done");
    } catch {
      setSubmitError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done" && done) {
    return (
      <Card shadow="sm" className="mx-auto max-w-lg border-2 border-black">
        <CardBody className="flex flex-col items-center gap-3 p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[2px] border-2 border-black bg-emerald-600 text-white">
            <ShieldCheck size={26} aria-hidden />
          </div>
          <p className="font-pixel text-sm">PAYMENT SUBMITTED</p>
          <McText code={`${done.item.name}`} className="font-pixel text-base" />
          <p className="text-sm text-default-500">
            {formatINR(done.item.priceInr)} · Player <strong className="text-foreground">{done.username}</strong> ·
            UTR <code className="rounded bg-default-100 px-1">{done.utr}</code>
          </p>
          <p className="max-w-sm text-sm text-default-600">
            Your order is <strong>pending verification</strong>. Staff check the payment
            manually and grant the rank in game — usually within a day. Track it in your{" "}
            <Link href="/inbox" className="text-primary underline">inbox</Link>.
          </p>
          {!done.persisted ? (
            <p className="max-w-sm rounded-md border-2 border-warning-400 bg-warning-50 p-2 text-xs text-warning-800">
              The site database is not connected, so this order was saved on this
              device only. Contact staff with your UTR to claim the rank.
            </p>
          ) : null}
          <McButton variant="stone" onPress={() => { setStep("pick"); setItem(null); setUtr(""); setDone(null); }}>
            Back to store
          </McButton>
        </CardBody>
      </Card>
    );
  }

  if ((step === "pay" || step === "utr") && item) {
    return (
      <div className="mx-auto max-w-lg">
        <button
          onClick={() => setStep(step === "utr" ? "pay" : "pick")}
          className="mb-3 inline-flex items-center gap-1 text-sm text-default-500 hover:text-primary"
        >
          <ArrowLeft size={15} aria-hidden /> Back
        </button>
        <Card shadow="sm" className="border-2 border-black">
          <CardBody className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <McText code={item.name} className="font-pixel text-lg" />
              <Chip size="sm" variant="flat" color="primary">{formatINR(item.priceInr)}</Chip>
            </div>

            {step === "pay" ? (
              <>
                {!authed ? (
                  <Input
                    label="Minecraft username (who gets the rank?)"
                    labelPlacement="outside"
                    placeholder="e.g. OmHackz"
                    value={name}
                    onValueChange={(v) => { setName(v); setNameError(""); }}
                    maxLength={16}
                    isInvalid={Boolean(nameError)}
                    errorMessage={nameError}
                  />
                ) : (
                  <p className="text-sm text-default-500">
                    Rank goes to <strong className="text-foreground">{authed}</strong>
                  </p>
                )}
                <div className="flex flex-col items-center gap-2 rounded-[2px] border-2 border-black bg-white p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qr} alt={`UPI QR code for ${formatINR(item.priceInr)} to ${UPI_ID}`} width={220} height={220} loading="lazy" />
                  <p className="font-pixel text-xs text-black">{formatINR(item.priceInr)}</p>
                </div>
                <div className="flex items-center gap-2 rounded-[2px] border border-default-300 bg-default-100 px-3 py-2">
                  <QrCode size={16} aria-hidden className="shrink-0 text-default-500" />
                  <code className="min-w-0 flex-1 truncate text-sm">{UPI_ID}</code>
                  <button
                    onClick={copyUpi}
                    aria-label="Copy UPI ID"
                    className="flex items-center gap-1 text-xs font-semibold text-primary"
                  >
                    {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-default-600">
                  <li>Scan the QR with any UPI app (GPay / PhonePe / Paytm).</li>
                  <li>Pay exactly <strong className="text-foreground">{formatINR(item.priceInr)}</strong>.</li>
                  <li>Copy the 12-digit UTR / reference number, then continue.</li>
                </ol>
                <McButton variant="grass" className="w-full" onPress={goUtr}>
                  I have paid — Continue
                </McButton>
              </>
            ) : (
              <>
                <Input
                  label="12-digit UPI transaction / UTR number"
                  labelPlacement="outside"
                  placeholder="e.g. 402118773652"
                  value={utr}
                  inputMode="numeric"
                  onValueChange={(v) => { setUtr(v.replace(/\D/g, "").slice(0, 12)); setUtrError(""); }}
                  maxLength={12}
                  isInvalid={Boolean(utrError)}
                  errorMessage={utrError}
                />
                {submitError ? (
                  <p className="rounded-md border border-danger-300 bg-danger-50 p-2 text-sm text-danger-700" role="alert">
                    {submitError}
                  </p>
                ) : null}
                <McButton variant="mango" className="w-full" onPress={submit} isLoading={submitting}>
                  Submit for verification
                </McButton>
                <p className="text-center text-xs text-default-500">
                  Paying as <strong className="text-foreground">{username || "…"}</strong> ·{" "}
                  {formatINR(item.priceInr)}
                </p>
              </>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  const ranks = storeItems.filter((i) => i.kind === "rank");
  const pickById = (id: string) => {
    const found = storeItems.find((i) => i.id === id);
    if (found) pick(found);
  };

  return (
    <div className="space-y-10">
      <section aria-label="Ranks">
        <p className="mb-3 font-pixel text-xs">RANKS — LIFETIME</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ranks.map((i) => (
            <Card key={i.id} shadow="sm" className="border-2 border-black">
              <CardBody className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between">
                  <McText code={i.name} className="font-pixel text-xl" />
                  <BadgeCheck size={22} style={{ color: i.accent }} aria-hidden />
                </div>
                <p className="text-sm text-default-500">{i.tagline} · {i.duration}</p>
                <ul className="space-y-1.5 text-sm">
                  {i.perks.map((p) => (
                    <li key={p}>
                      <McText code={`&7• ${p}`} />
                    </li>
                  ))}
                </ul>
                <p className="font-pixel text-lg">{formatINR(i.priceInr)}</p>
                <McButton
                  variant={i.id === "mvp" ? "grass" : "mango"}
                  className="w-full"
                  onPress={() => pick(i)}
                  aria-label={`Buy ${stripMcCodes(i.name)} for ${formatINR(i.priceInr)}`}
                >
                  Buy {stripMcCodes(i.name)}
                </McButton>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Server donations">
        <p className="mb-1 font-pixel text-xs">SERVER DONATIONS</p>
        <p className="mb-3 text-sm text-default-500">
          Chip in for running costs. Progress is updated manually as donations are verified.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {donationGoals.map((g) => {
            const item = storeItems.find((i) => i.id === g.itemId);
            const pct = Math.min(100, Math.round((g.raisedInr / g.goalInr) * 100));
            return (
              <Card key={g.id} shadow="sm" className="border-2 border-black">
                <CardBody className="flex flex-col gap-3 p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-pixel text-xs">{g.label.toUpperCase()}</p>
                    <Chip size="sm" variant="flat" color="primary">
                      {formatINR(g.raisedInr)} / {formatINR(g.goalInr)}
                    </Chip>
                  </div>
                  <div
                    className="h-4 w-full rounded-[2px] border-2 border-black bg-default-200"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${g.label} funding progress`}
                  >
                    <div
                      className="h-full bg-emerald-600 transition-[width]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-default-500">{pct}% funded</p>
                  {item ? (
                    <McButton
                      variant="grass"
                      className="w-full"
                      onPress={() => pickById(item.id)}
                      aria-label={`Donate ${formatINR(item.priceInr)} to ${g.label}`}
                    >
                      Donate {formatINR(item.priceInr)}
                    </McButton>
                  ) : null}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      <Card shadow="sm" className="border-2 border-dashed border-default-300">
        <CardBody className="p-5 text-center text-sm text-default-500">
          Payments are verified manually by staff — ranks are granted in game after
          verification. No account needed; your Minecraft username is enough.
        </CardBody>
      </Card>
    </div>
  );
}
