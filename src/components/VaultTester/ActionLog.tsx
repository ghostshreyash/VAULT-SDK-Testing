import { useVault } from "@/context/VaultContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ActionLog() {
  const { logs, clearLogs } = useVault();

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex px-4 py-2 border-b items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Action Log</h3>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{logs.length} events</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={clearLogs} disabled={logs.length === 0} className="h-7 text-xs">
          Clear Logs
        </Button>
      </div>
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 overflow-auto p-4 space-y-3">
            {logs.length === 0 && (
              <div className="text-center text-muted-foreground py-8 text-xs">
                No logs recorded yet.
              </div>
            )}
            {logs.map((log) => (
              <div key={log.id} className="group flex flex-col gap-1 text-sm border-b pb-3 last:border-0 border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm ${
                        log.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                        log.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {log.type}
                    </span>
                    <span className="font-mono font-medium text-xs text-foreground">{log.method}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-muted-foreground pl-0.5">{log.message}</div>
                {log.data && (
                  <pre className="mt-1 bg-muted/50 rounded p-2 text-[10px] font-mono overflow-auto max-h-40">
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
