import { useState } from "react";
import { useVault } from "@/context/VaultContext";
import { useSettingsStore } from "@/store/settingsStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface WalletInfoState {
  points?: number;
  status?: string;
  createdAt?: string;
}

interface WalletTransaction {
  id?: string;
  type?: string;
  transactionCategory?: string | null;
  points?: number | null;
  amount?: number | null;
  currency?: string | null;
  description?: string | null;
  status?: string;
  createdAt?: string;
}

interface WalletHistoryState {
  transactions: WalletTransaction[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractPayload(response: unknown): unknown {
  if (isRecord(response) && "data" in response) {
    return response.data;
  }
  return response;
}

export function WalletPanel() {
  const { vault, isConnected, addLog } = useVault();
  const vaultId = useSettingsStore((state) => state.vaultId);

  const [loading, setLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfoState | null>(null);
  const [walletHistory, setWalletHistory] = useState<WalletHistoryState | null>(null);
  const [historyPage, setHistoryPage] = useState("1");
  const [historyLimit, setHistoryLimit] = useState("20");
  const [historyCategory, setHistoryCategory] = useState("");

  const activeVaultId = vaultId.trim();

  const ensureReady = () => {
    if (!vault) {
      addLog("warning", "wallet", "Initialize SDK before testing wallet methods");
      return false;
    }

    if (!activeVaultId) {
      addLog("warning", "vaultId", "Provide Target Vault ID in the dashboard header");
      return false;
    }

    return true;
  };

  const fetchWalletInfo = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading(true);
    try {
      addLog("info", "getWalletInfo", "Fetching wallet info...");
      const response = await vault.getWalletInfo(activeVaultId);
      const payload = extractPayload(response);
      const normalized = isRecord(payload) ? (payload as WalletInfoState) : null;
      setWalletInfo(normalized);
      addLog("success", "getWalletInfo", "Wallet info fetched", response);
    } catch (error) {
      addLog("error", "getWalletInfo", "Failed to fetch wallet info", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionHistory = async () => {
    if (!ensureReady()) {
      return;
    }

    setLoading(true);
    try {
      const page = Math.max(1, Number.parseInt(historyPage, 10) || 1);
      const limit = Math.max(1, Number.parseInt(historyLimit, 10) || 20);
      const category = historyCategory.trim();

      addLog("info", "getTransactionHistory", "Fetching wallet transaction history...");
      const response = await vault.getTransactionHistory(activeVaultId, {
        page,
        limit,
        ...(category ? { category } : {}),
      });
      const payload = extractPayload(response);
      const normalized = isRecord(payload)
        ? {
            transactions: Array.isArray(payload.transactions)
              ? (payload.transactions as WalletTransaction[])
              : [],
            pagination: isRecord(payload.pagination)
              ? (payload.pagination as WalletHistoryState["pagination"])
              : undefined,
          }
        : { transactions: [] };
      setWalletHistory(normalized);
      addLog("success", "getTransactionHistory", "Wallet transaction history fetched", response);
    } catch (error) {
      addLog("error", "getTransactionHistory", "Failed to fetch wallet transaction history", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletData = async () => {
    await Promise.all([fetchWalletInfo(), fetchTransactionHistory()]);
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
          Run this section to validate wallet endpoints: `getWalletInfo` and
          `getTransactionHistory`.
        </div>
        <Button
          onClick={() => {
            void refreshWalletData();
          }}
          disabled={!activeVaultId || loading}
        >
          {loading ? "Loading..." : "Refresh Wallet Data"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Summary</CardTitle>
            <CardDescription>Result from `getWalletInfo`</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {walletInfo ? (
              <>
                <div>
                  <p className="text-3xl font-bold">{String(walletInfo.points ?? 0)}</p>
                  <p className="text-sm text-muted-foreground">Twin Points balance</p>
                </div>
                <div className="grid gap-2 text-sm">
                  <p>
                    <span className="font-semibold">Status:</span>{" "}
                    {String(walletInfo.status ?? "-")}
                  </p>
                  <p>
                    <span className="font-semibold">Created:</span>{" "}
                    {walletInfo.createdAt
                      ? new Date(walletInfo.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No wallet payload yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => void fetchWalletInfo()} disabled={loading}>
              Fetch Wallet Info
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              Runs `getTransactionHistory(vaultId, query?)`
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Page</p>
                <Input value={historyPage} onChange={(e) => setHistoryPage(e.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Limit</p>
                <Input value={historyLimit} onChange={(e) => setHistoryLimit(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">Category</p>
                <Input
                  placeholder="buyPoints, transcription, refund..."
                  value={historyCategory}
                  onChange={(e) => setHistoryCategory(e.target.value)}
                />
              </div>
            </div>

            {walletHistory?.pagination && (
              <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
                Page {String(walletHistory.pagination.page ?? "-")} of{" "}
                {String(walletHistory.pagination.totalPages ?? "-")} with{" "}
                {String(walletHistory.pagination.total ?? 0)} total transaction(s).
              </div>
            )}

            {walletHistory && walletHistory.transactions.length > 0 ? (
              <div className="space-y-3">
                {walletHistory.transactions.map((transaction) => (
                  <div key={transaction.id || transaction.createdAt} className="rounded-md border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">
                        {transaction.description || transaction.transactionCategory || "Transaction"}
                      </p>
                      <Badge variant="outline">
                        {String(transaction.type || transaction.status || "unknown")}
                      </Badge>
                    </div>
                    <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                      <p>
                        <span className="font-semibold">Points:</span>{" "}
                        {String(transaction.points ?? "-")}
                      </p>
                      <p>
                        <span className="font-semibold">Amount:</span>{" "}
                        {transaction.amount != null
                          ? `${transaction.amount} ${transaction.currency || ""}`.trim()
                          : "-"}
                      </p>
                      <p>
                        <span className="font-semibold">Created:</span>{" "}
                        {transaction.createdAt
                          ? new Date(transaction.createdAt).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No wallet history payload yet. Run the query to load transactions.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => void fetchTransactionHistory()}
              disabled={loading}
            >
              Fetch Wallet History
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
