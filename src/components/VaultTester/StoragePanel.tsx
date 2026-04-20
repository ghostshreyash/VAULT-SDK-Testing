import { useEffect, useRef, useState } from "react";
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { useVault } from "@/context/VaultContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlanItem {
  id?: string;
  name?: string;
  description?: string;
  amount?: number;
  interval?: string;
  storageGB?: number;
  stripePriceId?: string;
  priceId?: string;
}

interface SubscriptionsState {
  active?: Record<string, unknown>;
  upcoming?: Record<string, unknown>;
}

const STRIPE_PK_STORAGE_KEY = "vault-sdk-tester-stripe-pk";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractPayload(response: unknown): unknown {
  if (isRecord(response) && "data" in response) {
    return response.data;
  }
  return response;
}

function getInitialStripePublishableKey() {
  const fromEnv = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";

  if (typeof window === "undefined") {
    return fromEnv;
  }

  const fromStorage = window.localStorage.getItem(STRIPE_PK_STORAGE_KEY);
  return fromStorage || fromEnv;
}

function readStringField(value: unknown, field: string): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const raw = value[field];
  if (typeof raw !== "string") {
    return null;
  }

  const normalized = raw.trim();
  return normalized || null;
}

function extractClientSecret(response: unknown): string | null {
  const payload = extractPayload(response);

  const candidates = [
    response,
    payload,
    isRecord(response) ? response.data : null,
    isRecord(payload) ? payload.data : null,
  ];

  for (const candidate of candidates) {
    const secret =
      readStringField(candidate, "client_secret") ||
      readStringField(candidate, "clientSecret");
    if (secret) {
      return secret;
    }
  }

  return null;
}

function extractCheckoutUrl(response: unknown): string | null {
  const payload = extractPayload(response);

  const candidates = [
    response,
    payload,
    isRecord(response) ? response.data : null,
    isRecord(payload) ? payload.data : null,
  ];

  for (const candidate of candidates) {
    const url =
      readStringField(candidate, "checkoutUrl") ||
      readStringField(candidate, "checkout_url") ||
      readStringField(candidate, "url");
    if (url) {
      return url;
    }
  }

  return null;
}

export function StoragePanel({ vaultId }: { vaultId?: string }) {
  const { vault, isConnected, addLog } = useVault();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [storage, setStorage] = useState<Record<string, unknown> | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionsState | null>(null);
  const [manualPriceId, setManualPriceId] = useState("");

  const [stripePublishableKey, setStripePublishableKey] = useState(
    getInitialStripePublishableKey
  );
  const [latestCheckoutResponse, setLatestCheckoutResponse] = useState<unknown | null>(null);
  const [checkoutClientSecret, setCheckoutClientSecret] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutContainerEl, setCheckoutContainerEl] = useState<HTMLDivElement | null>(
    null
  );

  const embeddedCheckoutRef = useRef<StripeEmbeddedCheckout | null>(null);

  const activeVaultId = vaultId?.trim() ?? "";

  const ensureReady = () => {
    if (!vault) {
      addLog("warning", "storage", "Initialize SDK before testing storage methods");
      return false;
    }

    if (!activeVaultId) {
      addLog("warning", "vaultId", "Provide Target Vault ID in the dashboard header");
      return false;
    }

    return true;
  };

  const refreshBillingData = async () => {
    await Promise.all([fetchPlans(), fetchStorage(), fetchSubscriptions()]);
  };

  const fetchPlans = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading(true);
    try {
      addLog("info", "getAllPlans", "Fetching plans...");
      const response = await vault.getAllPlans(activeVaultId);
      const payload = extractPayload(response);
      const normalizedPlans = Array.isArray(payload)
        ? (payload as PlanItem[])
        : Array.isArray((payload as Record<string, unknown>)?.plans)
          ? ((payload as Record<string, unknown>).plans as PlanItem[])
          : [];

      setPlans(normalizedPlans);
      addLog("success", "getAllPlans", `Fetched ${normalizedPlans.length} plan(s)`, response);
    } catch (error) {
      addLog("error", "getAllPlans", "Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorage = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading(true);
    try {
      addLog("info", "getStorageDetails", "Fetching storage details...");
      const response = await vault.getStorageDetails(activeVaultId);
      const payload = extractPayload(response);
      if (isRecord(payload)) {
        setStorage(payload);
      } else {
        setStorage(null);
      }
      addLog("success", "getStorageDetails", "Storage details fetched", response);
    } catch (error) {
      addLog("error", "getStorageDetails", "Failed to fetch storage details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading(true);
    try {
      addLog("info", "getSubscriptions", "Fetching subscriptions...");
      const response = await vault.getSubscriptions(activeVaultId);
      const payload = extractPayload(response);
      const normalized = isRecord(payload) ? (payload as SubscriptionsState) : null;
      setSubscriptions(normalized);
      addLog("success", "getSubscriptions", "Subscriptions fetched", response);
    } catch (error) {
      addLog("error", "getSubscriptions", "Failed to fetch subscriptions", error);
    } finally {
      setLoading(false);
    }
  };

  const saveStripePublishableKey = (value: string) => {
    setStripePublishableKey(value);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STRIPE_PK_STORAGE_KEY, value);
    }
  };

  const openEmbeddedCheckout = (clientSecretOverride?: string) => {
    const secret = clientSecretOverride || checkoutClientSecret;

    if (!secret) {
      addLog("warning", "checkout", "No checkout client secret available yet");
      return;
    }

    if (!stripePublishableKey.trim()) {
      setCheckoutError(
        "Stripe publishable key is required. Add it in the Stripe Checkout Test panel."
      );
      setCheckoutOpen(true);
      addLog(
        "warning",
        "checkout",
        "Add Stripe publishable key to launch embedded checkout"
      );
      return;
    }

    setCheckoutClientSecret(secret);
    setCheckoutError(null);
    setCheckoutOpen(true);
  };

  const handleBuy = async (priceId: string) => {
    if (!ensureReady()) {
      return;
    }

    const normalizedPriceId = priceId.trim();
    if (!normalizedPriceId) {
      addLog("warning", "buyPlan", "Provide a price id before purchasing");
      return;
    }

    setLoading(true);
    setCheckoutError(null);

    try {
      addLog("info", "buyPlan", `Creating Stripe checkout for ${normalizedPriceId}...`);
      const response = await vault.buyPlan(activeVaultId, normalizedPriceId);
      setLatestCheckoutResponse(response);

      const checkoutUrl = extractCheckoutUrl(response);
      const clientSecret = extractClientSecret(response);
      setCheckoutClientSecret(clientSecret || "");

      if (checkoutUrl) {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
        addLog("success", "buyPlan", "Checkout URL opened in a new tab", response);
        return;
      }

      if (clientSecret) {
        addLog("success", "buyPlan", "Checkout session created", response);
        openEmbeddedCheckout(clientSecret);
        return;
      }

      addLog(
        "warning",
        "buyPlan",
        "Checkout session created but no client_secret/url was found in response",
        response
      );
    } catch (error) {
      addLog("error", "buyPlan", "Failed to start Stripe checkout", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUpcomingPlan = async (priceId: string) => {
    if (!ensureReady()) {
      return;
    }

    const normalizedPriceId = priceId.trim();
    if (!normalizedPriceId) {
      addLog("warning", "createUpcomingPlan", "Provide a price id to schedule an upcoming plan");
      return;
    }

    setLoading(true);
    try {
      addLog("info", "createUpcomingPlan", `Scheduling upcoming plan for ${normalizedPriceId}...`);
      const response = await vault.createUpcomingPlan(activeVaultId, normalizedPriceId);
      addLog("success", "createUpcomingPlan", "Upcoming plan scheduled", response);
      await fetchSubscriptions();
    } catch (error) {
      addLog("error", "createUpcomingPlan", "Failed to schedule upcoming plan", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading(true);
    try {
      addLog("info", "cancelSubscription", "Scheduling cancellation at period end...");
      const response = await vault.cancelSubscription(activeVaultId);
      addLog("success", "cancelSubscription", "Subscription cancellation scheduled", response);
      await Promise.all([fetchStorage(), fetchSubscriptions()]);
    } catch (error) {
      addLog("error", "cancelSubscription", "Failed to cancel subscription", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelUpcomingPlan = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading(true);
    try {
      addLog("info", "cancelUpcomingPlan", "Cancelling upcoming plan auto-renewal...");
      const response = await vault.cancelUpcomingPlan(activeVaultId);
      addLog("success", "cancelUpcomingPlan", "Upcoming plan auto-renewal cancelled", response);
      await fetchSubscriptions();
    } catch (error) {
      addLog("error", "cancelUpcomingPlan", "Failed to cancel upcoming plan", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      !checkoutOpen ||
      !checkoutClientSecret ||
      !stripePublishableKey.trim() ||
      !checkoutContainerEl
    ) {
      return;
    }

    let cancelled = false;

    const mountCheckout = async () => {
      try {
        const stripe = await loadStripe(stripePublishableKey.trim());
        if (!stripe) {
          throw new Error("Failed to initialize Stripe.js");
        }

        const checkout = await stripe.initEmbeddedCheckout({
          clientSecret: checkoutClientSecret,
        });

        if (cancelled) {
          checkout.destroy();
          return;
        }

        embeddedCheckoutRef.current = checkout;
        checkout.mount(checkoutContainerEl);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load Stripe embedded checkout";
        if (!cancelled) {
          setCheckoutError(message);
        }
      }
    };

    void mountCheckout();

    return () => {
      cancelled = true;
      if (embeddedCheckoutRef.current) {
        embeddedCheckoutRef.current.unmount();
        embeddedCheckoutRef.current.destroy();
        embeddedCheckoutRef.current = null;
      }
      checkoutContainerEl.innerHTML = "";
    };
  }, [checkoutOpen, checkoutClientSecret, stripePublishableKey, checkoutContainerEl]);

  if (!isConnected) {
    return null;
  }

  const breakdown = Array.isArray(storage?.breakdown)
    ? (storage?.breakdown as Record<string, unknown>[])
    : [];

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
            Run this section to validate billing endpoints: `getStorageDetails`, `getAllPlans`,
            `buyPlan`, `getSubscriptions`, `cancelSubscription`, `createUpcomingPlan`, and
            `cancelUpcomingPlan`.
          </div>
          <Button
            onClick={() => {
              void refreshBillingData();
            }}
            disabled={!activeVaultId || loading}
          >
            {loading ? "Loading..." : "Refresh All Billing Data"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>Result from `getStorageDetails`</CardDescription>
            </CardHeader>
            <CardContent>
              {storage ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold">
                      {String(storage.storageUsedFormatted ?? "-")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {String(storage.percentageFormatted ?? "-")} of{" "}
                      {String(storage.storageLimitFormatted ?? "-")} used
                    </p>
                  </div>
                  {breakdown.length > 0 && (
                    <div className="space-y-2 border-t pt-2">
                      <p className="text-sm font-medium">Breakdown</p>
                      {breakdown.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs text-muted-foreground"
                        >
                          <span>
                            {String(item.type ?? "Unknown")} ({String(item.count ?? 0)})
                          </span>
                          <span>{String(item.sizeFormatted ?? "-")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No storage payload yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stripe Checkout Test</CardTitle>
              <CardDescription>
                Runs `buyPlan` and launches actual Stripe checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Stripe Publishable Key</p>
                <Input
                  placeholder="pk_test_..."
                  value={stripePublishableKey}
                  onChange={(e) => saveStripePublishableKey(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Price ID</p>
                <Input
                  placeholder="price_..."
                  value={manualPriceId}
                  onChange={(e) => setManualPriceId(e.target.value)}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={() => void handleBuy(manualPriceId)}
                  disabled={!manualPriceId.trim() || loading}
                >
                  Start Checkout
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => openEmbeddedCheckout()}
                  disabled={!checkoutClientSecret || !stripePublishableKey.trim()}
                >
                  Open Last Session
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => void handleCreateUpcomingPlan(manualPriceId)}
                disabled={!manualPriceId.trim() || loading}
                className="w-full"
              >
                Schedule Upcoming (priceId)
              </Button>

              {latestCheckoutResponse !== null && (
                <pre className="max-h-44 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                  {JSON.stringify(latestCheckoutResponse, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plans">
          <TabsList>
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
            <TabsTrigger value="subs">Subscriptions</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plans.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                  No plans loaded. Use Refresh All Billing Data.
                </div>
              )}
              {plans.map((plan) => {
                const amount =
                  typeof plan.amount === "number" ? `$${(plan.amount / 100).toFixed(2)}` : "-";
                const planId = plan.stripePriceId || plan.priceId || plan.id || "";

                return (
                  <Card key={planId || plan.name}>
                    <CardHeader>
                      <CardTitle>{plan.name || "Unnamed Plan"}</CardTitle>
                      <CardDescription>{plan.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-2xl font-bold">{amount}</p>
                      <p className="text-sm text-muted-foreground">{plan.interval || "N/A"}</p>
                      {typeof plan.storageGB === "number" && (
                        <Badge variant="outline">{plan.storageGB} GB Storage</Badge>
                      )}
                      <p className="font-mono text-xs text-muted-foreground">{planId || "No priceId"}</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        onClick={() => void handleBuy(planId)}
                        disabled={!planId || loading}
                      >
                        Buy This Plan
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="subs" className="space-y-4 pt-4">
            {!subscriptions || (!subscriptions.active && !subscriptions.upcoming) ? (
              <div className="py-8 text-center text-muted-foreground">No subscriptions found.</div>
            ) : (
              <div className="space-y-4">
                {subscriptions.active && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{String(subscriptions.active.planName ?? "Active Subscription")}</span>
                        <Badge>{String(subscriptions.active.status ?? "active")}</Badge>
                      </CardTitle>
                      <CardDescription>Current active plan</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                      <p>
                        <span className="font-semibold">Storage:</span>{" "}
                        {String(subscriptions.active.storageGB ?? "-")} GB
                      </p>
                      <p>
                        <span className="font-semibold">Auto-Renew:</span>{" "}
                        {subscriptions.active.cancelAtPeriodEnd ? "No" : "Yes"}
                      </p>
                      <p>
                        <span className="font-semibold">Expiry:</span>{" "}
                        {subscriptions.active.expiryDate
                          ? new Date(String(subscriptions.active.expiryDate)).toLocaleDateString()
                          : "-"}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        onClick={() => void handleCancelSubscription()}
                        disabled={loading || Boolean(subscriptions.active.cancelAtPeriodEnd)}
                      >
                        {Boolean(subscriptions.active.cancelAtPeriodEnd)
                          ? "Cancellation Scheduled"
                          : "Cancel At Period End"}
                      </Button>
                    </CardFooter>
                  </Card>
                )}

                {subscriptions.upcoming && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{String(subscriptions.upcoming.planName ?? "Upcoming Subscription")}</span>
                        <Badge variant="secondary">Upcoming</Badge>
                      </CardTitle>
                      <CardDescription>
                        This plan starts after the current one expires.
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        variant="outline"
                        onClick={() => void handleCancelUpcomingPlan()}
                        disabled={loading || Boolean(subscriptions.upcoming.cancelAtPeriodEnd)}
                      >
                        {Boolean(subscriptions.upcoming.cancelAtPeriodEnd)
                          ? "Auto-Renew Already Cancelled"
                          : "Cancel Upcoming Auto-Renew"}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open);
          if (!open && ensureReady()) {
            void Promise.all([fetchStorage(), fetchSubscriptions()]);
          }
        }}
      >
        <DialogContent className="h-[92vh] max-w-6xl overflow-hidden p-0 sm:max-w-6xl" showCloseButton={false}>
          <DialogHeader className="border-b px-5 pt-5 pb-3">
            <DialogTitle>Stripe Checkout</DialogTitle>
            <DialogDescription>
              Complete payment here, then close this modal and refresh subscription data.
            </DialogDescription>
          </DialogHeader>

          <div className="h-full min-h-0 overflow-auto px-5 py-4">
            {checkoutError ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {checkoutError}
              </div>
            ) : (
              <div
                ref={setCheckoutContainerEl}
                className="min-h-[640px] rounded-md border bg-white"
              />
            )}
          </div>

          <DialogFooter className="border-t px-5 py-3 sm:justify-between">
            <Button variant="outline" onClick={() => void refreshBillingData()}>
              Refresh Billing Data
            </Button>
            <Button onClick={() => setCheckoutOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
