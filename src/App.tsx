import { VaultProvider } from "@/context/VaultContext";
import { Dashboard } from "@/components/VaultTester/Dashboard";
import { Toaster } from "@/components/ui/sonner";
import "./index.css";

function App() {
  return (
    <VaultProvider>
      <div className="min-h-screen bg-background text-foreground antialiased">
        <Dashboard />
        <Toaster />
      </div>
    </VaultProvider>
  );
}

export default App;
