import { useMemo, useState } from "react";
import { useVault } from "@/context/VaultContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LogFilter = "all" | "info" | "success" | "error" | "warning";

export function ActionLog() {
  const { logs, clearLogs } = useVault();
  const [filter, setFilter] = useState<LogFilter>("all");
  const [search, setSearch] = useState("");

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return logs.filter((log) => {
      const passesType = filter === "all" || log.type === filter;
      if (!passesType) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        log.method.toLowerCase().includes(normalizedSearch) ||
        log.message.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [logs, filter, search]);

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="space-y-3 border-b bg-muted/20 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Action Log</h3>
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {filteredLogs.length}/{logs.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="h-7 text-xs"
          >
            Clear
          </Button>
        </div>

        <div className="grid gap-2 md:grid-cols-[150px_minmax(0,1fr)]">
          <Select value={filter} onValueChange={(value) => setFilter(value as LogFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by method or message"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 space-y-3 overflow-auto p-4">
          {filteredLogs.length === 0 && (
            <div className="py-10 text-center text-xs text-muted-foreground">
              No logs match the current filters.
            </div>
          )}

          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-md border border-border/70 bg-background p-3 text-sm"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                      log.type === "error"
                        ? "bg-red-100 text-red-700"
                        : log.type === "success"
                          ? "bg-emerald-100 text-emerald-700"
                          : log.type === "warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {log.type}
                  </span>
                  <span className="font-mono text-xs font-medium text-foreground">{log.method}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{log.message}</p>
              {log.data !== undefined && log.data !== null && (
                <pre className="mt-2 max-h-48 overflow-auto rounded bg-muted/40 p-2 font-mono text-[10px]">
                  {JSON.stringify(log.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

