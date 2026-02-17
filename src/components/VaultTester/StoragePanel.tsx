import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export function StoragePanel({ vaultId }: { vaultId?: string }) {
  const { vault, isConnected, addLog } = useVault();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [subscriptions, setSubscriptions] = useState<{active?: any, upcoming?: any} | null>(null);
  
  const activeVaultId = vaultId;

  const fetchPlans = async () => {
    if (!vault || !activeVaultId) return;
    setLoading(true);
    try {
      addLog("info", "getAllPlans", "Fetching plans...");
      const res = await vault.getAllPlans(activeVaultId);
      setPlans(res.data || []); // Adjust based on actual API response structure
      addLog("success", "getAllPlans", "Plans fetched", res);
    } catch (error) {
      addLog("error", "getAllPlans", "Failed to fetch plans", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorage = async () => {
    if (!vault || !activeVaultId) return;
    setLoading(true);
    try {
        addLog("info", "getStorageDetails", "Fetching storage...");
      const res = await vault.getStorageDetails(activeVaultId);
      setStorage(res.data || res); // Adjust depending on response
      addLog("success", "getStorageDetails", "Storage details fetched", res);
    } catch (error) {
      addLog("error", "getStorageDetails", "Failed to fetch storage", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubs = async () => {
    if (!vault || !activeVaultId) return;
    setLoading(true);
    try {
        addLog("info", "getSubscriptions", "Fetching subscriptions...");
      const res = await vault.getSubscriptions(activeVaultId);
      setSubscriptions(res.data);
      addLog("success", "getSubscriptions", "Subscriptions fetched", res);
    } catch (error) {
      addLog("error", "getSubscriptions", "Failed to fetch subscriptions", error);
    } finally {
        setLoading(false);
    }
  };
  
  const handleBuy = async (priceId: string) => {
    if (!vault || !activeVaultId) return;
    try {
        addLog("info", "buyPlan", `Buying plan ${priceId}...`);
        const res = await vault.buyPlan(activeVaultId, priceId);
        addLog("success", "buyPlan", "Plan purchased successfully", res);
        fetchStorage();
        fetchSubs();
    } catch (error) {
        addLog("error", "buyPlan", "Failed to buy plan", error);
    }
  };

  if (!isConnected) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => { fetchPlans(); fetchStorage(); fetchSubs(); }} disabled={!activeVaultId || loading}>
            {loading ? "Loading..." : "Refresh Data"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
            <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
            </CardHeader>
            <CardContent>
                {storage ? (
                    <div className="space-y-4">
                        <div>
                            <div className="text-2xl font-bold">
                                {storage.storageUsedFormatted}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {storage.percentageFormatted} of {storage.storageLimitFormatted} Used
                            </div>
                        </div>
                        {storage.breakdown && (
                             <div className="space-y-2 border-t pt-2">
                                <div className="text-sm font-medium">Breakdown</div>
                                {storage.breakdown.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-xs text-muted-foreground">
                                        <span>{item.type} ({item.count})</span>
                                        <span>{item.sizeFormatted}</span>
                                    </div>
                                ))}
                             </div>
                        )}
                    </div>
                ) : (
                    <div className="text-muted-foreground text-sm">No data fetched</div>
                )}
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="plans">
        <TabsList>
            <TabsTrigger value="plans">Available Plans</TabsTrigger>
            <TabsTrigger value="subs">Active Subscriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.length === 0 && <div className="col-span-full text-center text-muted-foreground py-8">No plans available or not fetched.</div>}
                {plans.map((plan: any) => (
                    <Card key={plan.priceId || plan.id}>
                        <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${(plan.amount / 100).toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">{plan.interval}</div>
                            <div className="mt-2 space-y-1">
                                <Badge variant="outline">{plan.storageGB} GB Storage</Badge>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={() => handleBuy(plan.stripePriceId || plan.id)}>Buy Plan</Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="subs" className="space-y-4 pt-4">
            <div className="space-y-4">
                 {!subscriptions || (!subscriptions.active && !subscriptions.upcoming) ? (
                     <div className="text-center text-muted-foreground py-8">No active subscriptions.</div>
                 ) : (
                     <>
                        {subscriptions.active && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex justify-between">
                                        <span>{subscriptions.active.planName || "Active Subscription"}</span>
                                        <Badge variant="default">{subscriptions.active.status}</Badge>
                                    </CardTitle>
                                    <CardDescription>Active Plan</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div><span className="font-semibold">Storage:</span> {subscriptions.active.storageGB} GB</div>
                                        <div><span className="font-semibold">Auto-Renew:</span> {subscriptions.active.cancelAtPeriodEnd ? "No" : "Yes"}</div>
                                        <div><span className="font-semibold">Expires:</span> {new Date(subscriptions.active.expiryDate).toLocaleDateString()}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {subscriptions.upcoming && (
                            <Card>
                                 <CardHeader>
                                    <CardTitle className="flex justify-between">
                                        <span>{subscriptions.upcoming.planName || "Upcoming Subscription"}</span>
                                        <Badge variant="secondary">Upcoming</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>Starts after the current plan expires.</p>
                                </CardContent>
                            </Card>
                        )}
                     </>
                 )}
            </div>
        </TabsContent>
      </Tabs>
      
    </div>
  );
}
