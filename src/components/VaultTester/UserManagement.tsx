import { useEffect, useState } from "react";
import { useVault } from "@/context/VaultContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/store/settingsStore";

export function UserManagement() {
  const { vault, addLog } = useVault();
  const vaultId = useSettingsStore((state) => state.vaultId);
  const setVaultId = useSettingsStore((state) => state.setVaultId);
  const botChatWsUrl = useSettingsStore((state) => state.config.BOT_CHAT_WS_URL);
  const [loading, setLoading] = useState(false);

  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createUserPlatformId, setCreateUserPlatformId] = useState("");
  const [createUserResult, setCreateUserResult] = useState<unknown>(null);

  const [importVaultId, setImportVaultId] = useState("");
  const [importPlatformId, setImportPlatformId] = useState("");
  const [importResult, setImportResult] = useState<unknown>(null);

  const [botName, setBotName] = useState("");
  const [botProfession, setBotProfession] = useState("");
  const [botDescription, setBotDescription] = useState("");
  const [createBotResult, setCreateBotResult] = useState<unknown>(null);
  const [botDetailsBotId, setBotDetailsBotId] = useState("");
  const [botDetailsResult, setBotDetailsResult] = useState<unknown>(null);
  const [uploadBotId, setUploadBotId] = useState("");
  const [driveFileBotId, setDriveFileBotId] = useState("");
  const [driveFileIds, setDriveFileIds] = useState("");
  const [addDriveFileResult, setAddDriveFileResult] = useState<unknown>(null);
  const [driveFolderBotId, setDriveFolderBotId] = useState("");
  const [driveFolderIds, setDriveFolderIds] = useState("");
  const [addDriveFolderResult, setAddDriveFolderResult] = useState<unknown>(null);
  const [botFiles, setBotFiles] = useState<FileList | null>(null);
  const [uploadBotFilesResult, setUploadBotFilesResult] = useState<unknown>(null);
  const [chatBotId, setChatBotId] = useState("");
  const [chatSessionId, setChatSessionId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatHistoryInput, setChatHistoryInput] = useState("");
  const [launchToken, setLaunchToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [chatConnected, setChatConnected] = useState(false);
  const [chatStreaming, setChatStreaming] = useState(false);
  const [chatTranscript, setChatTranscript] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [launchTokenResult, setLaunchTokenResult] = useState<unknown>(null);
  const [redeemTokenResult, setRedeemTokenResult] = useState<unknown>(null);
  const [connectBotChatResult, setConnectBotChatResult] = useState<unknown>(null);
  const [lastChatEvent, setLastChatEvent] = useState<unknown>(null);

  const extractBotId = (value: unknown): string => {
    if (!value || typeof value !== "object") return "";

    const directId =
      "id" in value && typeof value.id === "string" ? value.id : "";
    if (directId.trim()) return directId.trim();

    const data =
      "data" in value && value.data && typeof value.data === "object"
        ? value.data
        : null;
    if (data && "id" in data && typeof data.id === "string" && data.id.trim()) {
      return data.id.trim();
    }

    return "";
  };

  const extractLaunchToken = (value: unknown): string => {
    if (!value || typeof value !== "object") return "";

    const directToken =
      "launchToken" in value && typeof value.launchToken === "string"
        ? value.launchToken
        : "";
    if (directToken.trim()) return directToken.trim();

    const data =
      "data" in value && value.data && typeof value.data === "object"
        ? value.data
        : null;
    if (
      data &&
      "launchToken" in data &&
      typeof data.launchToken === "string" &&
      data.launchToken.trim()
    ) {
      return data.launchToken.trim();
    }

    return "";
  };

  const extractAccessToken = (value: unknown): string => {
    if (!value || typeof value !== "object") return "";

    const directToken =
      "accessToken" in value && typeof value.accessToken === "string"
        ? value.accessToken
        : "";
    if (directToken.trim()) return directToken.trim();

    const user =
      "user" in value && value.user && typeof value.user === "object"
        ? value.user
        : null;
    if (
      user &&
      "accessToken" in user &&
      typeof user.accessToken === "string" &&
      user.accessToken.trim()
    ) {
      return user.accessToken.trim();
    }

    const data =
      "data" in value && value.data && typeof value.data === "object"
        ? value.data
        : null;
    if (!data) return "";

    if (
      "accessToken" in data &&
      typeof data.accessToken === "string" &&
      data.accessToken.trim()
    ) {
      return data.accessToken.trim();
    }

    const dataUser =
      "user" in data && data.user && typeof data.user === "object" ? data.user : null;
    if (
      dataUser &&
      "accessToken" in dataUser &&
      typeof dataUser.accessToken === "string" &&
      dataUser.accessToken.trim()
    ) {
      return dataUser.accessToken.trim();
    }

    return "";
  };

  const parseHistoryInput = () => {
    if (!chatHistoryInput.trim()) return [];

    try {
      const parsed = JSON.parse(chatHistoryInput);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      throw new Error("History must be valid JSON array");
    }
  };

  useEffect(() => {
    if (!vault?.on) return;

    const handleChatOpen = () => {
      setChatConnected(true);
      addLog("success", "connectToBotChat", "Bot chat socket connected");
    };

    const handleChatClose = (event: unknown) => {
      setChatConnected(false);
      setChatStreaming(false);
      addLog("warning", "disconnectBotChat", "Bot chat socket disconnected", event);
    };

    const handleChatHistory = (payload: unknown) => {
      const history = Array.isArray((payload as { history?: unknown[] })?.history)
        ? (payload as { history: Array<{ role: "user" | "assistant"; content: string }> }).history
        : [];

      setLastChatEvent(payload);
      setChatTranscript(
        history
          .filter(
            (entry) =>
              entry &&
              (entry.role === "user" || entry.role === "assistant") &&
              typeof entry.content === "string"
          )
          .map((entry) => ({ role: entry.role, content: entry.content }))
      );

      const incomingSessionId = (payload as { sessionId?: string })?.sessionId;
      if (typeof incomingSessionId === "string") {
        setChatSessionId(incomingSessionId);
      }

      addLog("info", "bot_chat_chat_history", "Bot chat history received", payload);
    };

    const handleSessionInfo = (payload: unknown) => {
      const incomingSessionId = (payload as { sessionId?: string })?.sessionId;
      if (typeof incomingSessionId === "string") {
        setChatSessionId(incomingSessionId);
      }
      setLastChatEvent(payload);
      addLog("info", "bot_chat_session_info", "Bot chat session info received", payload);
    };

    const handleToken = (payload: unknown) => {
      const token = (payload as { token?: string })?.token;
      if (typeof token !== "string" || !token) return;

      setChatStreaming(true);
      setLastChatEvent(payload);
      setChatTranscript((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];

        if (!last || last.role !== "assistant") {
          next.push({ role: "assistant", content: token });
          return next;
        }

        last.content += token;
        return next;
      });
    };

    const handleComplete = (payload: unknown) => {
      const content = (payload as { content?: string })?.content;
      const incomingSessionId = (payload as { sessionId?: string })?.sessionId;

      if (typeof incomingSessionId === "string") {
        setChatSessionId(incomingSessionId);
      }

      if (typeof content === "string") {
        setChatTranscript((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];

          if (!last || last.role !== "assistant") {
            next.push({ role: "assistant", content });
            return next;
          }

          last.content = content;
          return next;
        });
      }

      setChatStreaming(false);
      setLastChatEvent(payload);
      addLog("success", "bot_chat_message_complete", "Bot chat response completed", payload);
    };

    const handleError = (payload: unknown) => {
      setChatStreaming(false);
      setLastChatEvent(payload);
      addLog("error", "bot_chat_error", "Bot chat server returned an error", payload);
    };

    const handleStreamError = (payload: unknown) => {
      setChatStreaming(false);
      setLastChatEvent(payload);
      addLog("error", "bot_chat_stream_error", "Bot chat stream error", payload);
    };

    vault.on("bot_chat_open", handleChatOpen);
    vault.on("bot_chat_close", handleChatClose);
    vault.on("bot_chat_chat_history", handleChatHistory);
    vault.on("bot_chat_session_info", handleSessionInfo);
    vault.on("bot_chat_token", handleToken);
    vault.on("bot_chat_message_complete", handleComplete);
    vault.on("bot_chat_error", handleError);
    vault.on("bot_chat_stream_error", handleStreamError);

    return () => {
      vault.removeListener?.("bot_chat_open", handleChatOpen);
      vault.removeListener?.("bot_chat_close", handleChatClose);
      vault.removeListener?.("bot_chat_chat_history", handleChatHistory);
      vault.removeListener?.("bot_chat_session_info", handleSessionInfo);
      vault.removeListener?.("bot_chat_token", handleToken);
      vault.removeListener?.("bot_chat_message_complete", handleComplete);
      vault.removeListener?.("bot_chat_error", handleError);
      vault.removeListener?.("bot_chat_stream_error", handleStreamError);
    };
  }, [addLog, vault]);

  const handleCreateUser = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "createVault", "Initialize SDK before creating users");
      return;
    }

    setLoading(true);
    try {
      const normalizedPlatformId = createUserPlatformId.trim();
      addLog("info", "createVault", `Creating vault for ${createUserEmail}...`);
      const response = await vault.createVault(
        createUserEmail,
        normalizedPlatformId || undefined
      );
      setCreateUserResult(response);
      const createdVaultId = response?.data?.vaultId;
      if (typeof createdVaultId === "string" && createdVaultId.trim()) {
        setVaultId(createdVaultId);
      }
      addLog("success", "createVault", "Vault created for user", response);
    } catch (error) {
      addLog("error", "createVault", "Failed to create vault", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportVault = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "importVault", "Initialize SDK before importing vaults");
      return;
    }

    setLoading(true);
    try {
      const normalizedPlatformId = importPlatformId.trim();
      addLog("info", "importVault", `Importing vault ${importVaultId}...`);
      const response = await vault.importVault(
        importVaultId,
        normalizedPlatformId || undefined
      );
      setImportResult(response);
      setVaultId(importVaultId.trim());
      addLog("success", "importVault", "Vault import completed", response);
    } catch (error) {
      addLog("error", "importVault", "Failed to import vault", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "createBot", "Initialize SDK before creating bots");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "createBot",
        "Provide Target Vault ID in the dashboard header before creating a bot"
      );
      return;
    }

    setLoading(true);
    try {
      addLog("info", "createBot", `Creating bot '${botName}' for vault ${activeVaultId}...`);
      const response = await vault.createBot(activeVaultId, {
        name: botName.trim(),
        profession: botProfession.trim() || undefined,
        description: botDescription.trim() || undefined,
      });
      setCreateBotResult(response);
      const createdBotId = extractBotId(response);
      if (createdBotId) {
        setBotDetailsBotId(createdBotId);
        setUploadBotId(createdBotId);
        setDriveFileBotId(createdBotId);
        setDriveFolderBotId(createdBotId);
        setChatBotId(createdBotId);
      }
      addLog("success", "createBot", "Bot created successfully", response);
    } catch (error) {
      addLog("error", "createBot", "Failed to create bot", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriveFilesToBot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "addDriveFilesToBot", "Initialize SDK before linking storage file(s)");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "addDriveFilesToBot",
        "Provide Target Vault ID in the dashboard header before linking storage file(s)"
      );
      return;
    }

    const activeBotId = driveFileBotId.trim();
    if (!activeBotId) {
      addLog("warning", "addDriveFilesToBot", "Enter a Bot ID before linking file(s)");
      return;
    }

    const normalizedFileIds = Array.from(
      new Set(
        driveFileIds
          .split(/[\n,]+/)
          .map((value) => value.trim())
          .filter(Boolean)
      )
    );
    if (!normalizedFileIds.length) {
      addLog("warning", "addDriveFilesToBot", "Enter at least one storage file ID before linking");
      return;
    }

    setLoading(true);
    try {
      addLog(
        "info",
        "addDriveFilesToBot",
        `Linking ${normalizedFileIds.length} storage file(s) to bot ${activeBotId}...`
      );
      const response = await vault.addDriveFilesToBot(
        activeVaultId,
        activeBotId,
        normalizedFileIds.length === 1 ? normalizedFileIds[0] : normalizedFileIds
      );
      setAddDriveFileResult(response);
      addLog("success", "addDriveFilesToBot", "Storage file(s) linked to bot", response);
    } catch (error) {
      addLog("error", "addDriveFilesToBot", "Failed to link storage file(s) to bot", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBotFiles = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "uploadFilesToBot", "Initialize SDK before uploading bot files");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "uploadFilesToBot",
        "Provide Target Vault ID in the dashboard header before uploading bot files"
      );
      return;
    }

    const activeBotId = uploadBotId.trim();
    if (!activeBotId) {
      addLog("warning", "uploadFilesToBot", "Enter a Bot ID before uploading files");
      return;
    }

    const selectedFiles = botFiles ? Array.from(botFiles) : [];
    if (!selectedFiles.length) {
      addLog("warning", "uploadFilesToBot", "Select at least one file to upload");
      return;
    }

    setLoading(true);
    try {
      addLog(
        "info",
        "uploadFilesToBot",
        `Uploading ${selectedFiles.length} file(s) to bot ${activeBotId}...`
      );
      const response = await vault.uploadFilesToBot(
        selectedFiles,
        activeVaultId,
        activeBotId
      );
      setUploadBotFilesResult(response);
      addLog("success", "uploadFilesToBot", "Bot files upload started", response);
    } catch (error) {
      addLog("error", "uploadFilesToBot", "Failed to upload bot files", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDriveFolderToBot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "addDriveFoldersToBot", "Initialize SDK before linking storage folder(s)");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "addDriveFoldersToBot",
        "Provide Target Vault ID in the dashboard header before linking storage folder(s)"
      );
      return;
    }

    const activeBotId = driveFolderBotId.trim();
    if (!activeBotId) {
      addLog("warning", "addDriveFoldersToBot", "Enter a Bot ID before linking folder(s)");
      return;
    }

    const normalizedFolderIds = Array.from(
      new Set(
        driveFolderIds
          .split(/[\n,]+/)
          .map((value) => value.trim())
          .filter(Boolean)
      )
    );
    if (!normalizedFolderIds.length) {
      addLog(
        "warning",
        "addDriveFoldersToBot",
        "Enter at least one storage folder ID before linking"
      );
      return;
    }

    setLoading(true);
    try {
      addLog(
        "info",
        "addDriveFoldersToBot",
        `Linking ${normalizedFolderIds.length} storage folder(s) to bot ${activeBotId}...`
      );
      const response = await vault.addDriveFoldersToBot(
        activeVaultId,
        activeBotId,
        normalizedFolderIds.length === 1 ? normalizedFolderIds[0] : normalizedFolderIds
      );
      setAddDriveFolderResult(response);
      addLog("success", "addDriveFoldersToBot", "Storage folder(s) linked to bot", response);
    } catch (error) {
      addLog("error", "addDriveFoldersToBot", "Failed to link storage folder(s) to bot", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetBotDetails = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "getBotDetails", "Initialize SDK before fetching bot details");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "getBotDetails",
        "Provide Target Vault ID in the dashboard header before fetching bot details"
      );
      return;
    }

    const activeBotId = botDetailsBotId.trim();

    setLoading(true);
    try {
      addLog(
        "info",
        "getBotDetails",
        activeBotId
          ? `Fetching details for bot ${activeBotId}...`
          : `Fetching detailed data for all bots in vault ${activeVaultId}...`
      );
      const response = await vault.getBotDetails(
        activeVaultId,
        activeBotId || undefined
      );
      setBotDetailsResult(response);
      addLog(
        "success",
        "getBotDetails",
        activeBotId ? "Bot details fetched" : "All bot details fetched",
        response
      );
    } catch (error) {
      addLog("error", "getBotDetails", "Failed to fetch bot details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLaunchToken = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "createVaultLaunchToken", "Initialize SDK before creating a launch token");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog("warning", "createVaultLaunchToken", "Provide Target Vault ID before creating a launch token");
      return;
    }

    setLoading(true);
    try {
      addLog("info", "createVaultLaunchToken", `Creating launch token for vault ${activeVaultId}...`);
      const response = await vault.createVaultLaunchToken(activeVaultId);
      setLaunchTokenResult(response);

      const tokenValue = extractLaunchToken(response);
      if (tokenValue) {
        setLaunchToken(tokenValue);
      }

      addLog("success", "createVaultLaunchToken", "Launch token created", response);
    } catch (error) {
      addLog("error", "createVaultLaunchToken", "Failed to create launch token", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemLaunchToken = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "redeemVaultLaunchToken", "Initialize SDK before redeeming a launch token");
      return;
    }

    const activeLaunchToken = launchToken.trim();
    if (!activeLaunchToken) {
      addLog("warning", "redeemVaultLaunchToken", "Create or paste a launch token first");
      return;
    }

    setLoading(true);
    try {
      addLog("info", "redeemVaultLaunchToken", "Redeeming launch token for bot chat...");
      const response = await vault.redeemVaultLaunchToken(activeLaunchToken);
      setRedeemTokenResult(response);

      const tokenValue = extractAccessToken(response);
      if (tokenValue) {
        setAccessToken(tokenValue);
      }

      addLog("success", "redeemVaultLaunchToken", "Launch token redeemed", response);
    } catch (error) {
      addLog("error", "redeemVaultLaunchToken", "Failed to redeem launch token", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectBotChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "connectToBotChat", "Initialize SDK before opening bot chat");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog("warning", "connectToBotChat", "Provide Target Vault ID before opening bot chat");
      return;
    }

    const activeBotId = chatBotId.trim();
    if (!activeBotId) {
      addLog("warning", "connectToBotChat", "Enter a Bot ID before opening bot chat");
      return;
    }

    setLoading(true);
    try {
      addLog("info", "connectToBotChat", `Connecting bot chat for bot ${activeBotId}...`);

      let resolvedLaunchToken = launchToken.trim();
      let resolvedAccessToken = accessToken.trim();

      if (!resolvedAccessToken) {
        if (!resolvedLaunchToken) {
          addLog(
            "info",
            "connectToBotChat",
            "No chat token provided. Creating a fresh launch token before opening the socket..."
          );
          const launchResponse = await vault.createVaultLaunchToken(activeVaultId);
          setLaunchTokenResult(launchResponse);

          resolvedLaunchToken = extractLaunchToken(launchResponse);
          if (!resolvedLaunchToken) {
            throw new Error("Launch token was not returned by createVaultLaunchToken");
          }

          setLaunchToken(resolvedLaunchToken);
        }

        addLog(
          "info",
          "connectToBotChat",
          "Redeeming launch token for a fresh bot chat access token..."
        );
        const redeemResponse = await vault.redeemVaultLaunchToken(resolvedLaunchToken);
        setRedeemTokenResult(redeemResponse);

        resolvedAccessToken = extractAccessToken(redeemResponse);
        if (!resolvedAccessToken) {
          throw new Error("Access token was not returned by redeemVaultLaunchToken");
        }

        setAccessToken(resolvedAccessToken);
      }

      const response = await vault.connectToBotChat(activeVaultId, {
        botId: activeBotId,
        sessionId: chatSessionId.trim() || undefined,
        token: resolvedAccessToken,
        launchToken: resolvedLaunchToken || undefined,
        wsUrl: botChatWsUrl.trim() || undefined,
      });

      setConnectBotChatResult(response);
      setLastChatEvent(response);
      setChatConnected(true);
      addLog("success", "connectToBotChat", "Bot chat connected", response);
    } catch (error) {
      setChatConnected(false);
      addLog("error", "connectToBotChat", "Failed to connect bot chat", error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinBotChat = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "joinBotChat", "Initialize SDK before joining bot chat");
      return;
    }

    const activeBotId = chatBotId.trim();
    if (!activeBotId) {
      addLog("warning", "joinBotChat", "Enter a Bot ID before joining chat");
      return;
    }

    try {
      setChatTranscript([]);
      setChatStreaming(false);
      addLog("info", "joinBotChat", `Joining chat for bot ${activeBotId}...`);
      vault.joinBotChat(activeBotId, chatSessionId.trim() || undefined);
      addLog("success", "joinBotChat", "Join event sent");
    } catch (error) {
      addLog("error", "joinBotChat", "Failed to join bot chat", error);
    }
  };

  const handleSendBotChatMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "sendBotChatMessage", "Initialize SDK before sending bot chat messages");
      return;
    }

    const message = chatInput.trim();
    if (!message) {
      addLog("warning", "sendBotChatMessage", "Enter a message before sending");
      return;
    }

    try {
      const history = parseHistoryInput();
      setChatTranscript((prev) => [...prev, { role: "user", content: message }]);
      setChatInput("");
      setChatStreaming(true);
      addLog("info", "sendBotChatMessage", "Sending bot chat message...", {
        message,
        history,
      });
      vault.sendBotChatMessage(message, history);
    } catch (error) {
      setChatStreaming(false);
      addLog("error", "sendBotChatMessage", "Failed to send bot chat message", error);
    }
  };

  const handleSendTyping = () => {
    if (!vault) {
      addLog("warning", "sendBotChatTyping", "Initialize SDK before sending typing state");
      return;
    }

    try {
      vault.sendBotChatTyping();
      addLog("info", "sendBotChatTyping", "Typing event sent");
    } catch (error) {
      addLog("error", "sendBotChatTyping", "Failed to send typing event", error);
    }
  };

  const handleDisconnectBotChat = () => {
    if (!vault) {
      addLog("warning", "disconnectBotChat", "Initialize SDK before disconnecting bot chat");
      return;
    }

    try {
      vault.disconnectBotChat();
      setChatConnected(false);
      setChatStreaming(false);
      addLog("info", "disconnectBotChat", "Bot chat disconnected");
    } catch (error) {
      addLog("error", "disconnectBotChat", "Failed to disconnect bot chat", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
        Test platform onboarding and SDK bot setup here: `createVault`, `importVault`, `createBot`,
        `getBotDetails`, `addDriveFilesToBot`, `addDriveFoldersToBot`, `uploadFilesToBot`, and
        the new bot chat methods. Bot creation works after the vault is linked to the same
        `clientApiKey`, and successful onboarding will auto-fill the shared Target Vault ID for
        the next step.
      </div>

      <Tabs defaultValue="create-user">
        <TabsList>
          <TabsTrigger value="create-user">Create Vault</TabsTrigger>
          <TabsTrigger value="import-vault">Import Vault</TabsTrigger>
          <TabsTrigger value="create-bot">Create Bot</TabsTrigger>
          <TabsTrigger value="get-bot-details">Get Bot Details</TabsTrigger>
          <TabsTrigger value="add-drive-file">Add Storage File</TabsTrigger>
          <TabsTrigger value="add-drive-folder">Add Storage Folder</TabsTrigger>
          <TabsTrigger value="upload-bot-files">Upload Bot Files</TabsTrigger>
          <TabsTrigger value="bot-chat">Bot Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="create-user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Vault</CardTitle>
              <CardDescription>
                Runs `createVault(email, platformId?)`. Platform ID is optional — omit it
                for a platform-less SDK user. Idempotent: an existing user is linked to
                your client and returned rather than erroring.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateUser}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="user@example.com"
                    value={createUserEmail}
                    onChange={(e) => setCreateUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platformId">Platform ID</Label>
                  <Input
                    id="platformId"
                    placeholder="Optional platform ID"
                    value={createUserPlatformId}
                    onChange={(e) => setCreateUserPlatformId(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Run createVault"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {createUserResult
                  ? JSON.stringify(createUserResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import-vault" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Vault</CardTitle>
              <CardDescription>
                Runs `importVault(vaultId, platformId?)`. If omitted, it links client + enables SDK access.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleImportVault}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="importVaultId">Vault ID</Label>
                  <Input
                    id="importVaultId"
                    placeholder="Enter Vault ID"
                    value={importVaultId}
                    onChange={(e) => setImportVaultId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importPlatformId">Platform ID</Label>
                  <Input
                    id="importPlatformId"
                    placeholder="Optional platform ID"
                    value={importPlatformId}
                    onChange={(e) => setImportPlatformId(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Importing..." : "Run importVault"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {importResult ? JSON.stringify(importResult, null, 2) : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-bot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Bot</CardTitle>
              <CardDescription>
                Runs `createBot(vaultId, bot)`. It uses the Target Vault ID from the dashboard
                header and creates the bot plus its dedicated folder through the SDK route.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateBot}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="createBotVaultId">Target Vault ID</Label>
                  <Input
                    id="createBotVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botName">Bot Name</Label>
                  <Input
                    id="botName"
                    placeholder="Support Bot"
                    value={botName}
                    onChange={(e) => setBotName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botProfession">Profession</Label>
                  <Input
                    id="botProfession"
                    placeholder="Optional profession"
                    value={botProfession}
                    onChange={(e) => setBotProfession(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botDescription">Description</Label>
                  <Textarea
                    id="botDescription"
                    placeholder="Optional personality / bot description"
                    value={botDescription}
                    onChange={(e) => setBotDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Run createBot"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {createBotResult
                  ? JSON.stringify(createBotResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="get-bot-details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Bot Details</CardTitle>
              <CardDescription>
                Runs `getBotDetails(vaultId, botId?)`. Leave Bot ID empty to fetch all bots with
                their basic data, associated files, and associated folders.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleGetBotDetails}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="getBotDetailsVaultId">Target Vault ID</Label>
                  <Input
                    id="getBotDetailsVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="getBotDetailsBotId">Bot ID</Label>
                  <Input
                    id="getBotDetailsBotId"
                    placeholder="Optional: leave empty to fetch all bots"
                    value={botDetailsBotId}
                    onChange={(e) => setBotDetailsBotId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a bot ID for one bot, or leave blank to fetch all bot details.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Fetching..." : "Run getBotDetails"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {botDetailsResult
                  ? JSON.stringify(botDetailsResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-drive-file" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Storage File To Bot</CardTitle>
              <CardDescription>
                Runs `addDriveFilesToBot(vaultId, botId, fileIds)`. Paste one file ID or several
                separated by commas or new lines to attach them without re-uploading them.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddDriveFilesToBot}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driveFileVaultId">Target Vault ID</Label>
                  <Input
                    id="driveFileVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driveFileBotId">Bot ID</Label>
                  <Input
                    id="driveFileBotId"
                    placeholder="Paste bot ID or create a bot above"
                    value={driveFileBotId}
                    onChange={(e) => setDriveFileBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driveFileIds">Storage File ID(s)</Label>
                  <Textarea
                    id="driveFileIds"
                    placeholder={"Existing vault storage file ID\nfile-id-two"}
                    value={driveFileIds}
                    onChange={(e) => setDriveFileIds(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple file IDs with commas or new lines.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Linking..." : "Run addDriveFilesToBot"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {addDriveFileResult
                  ? JSON.stringify(addDriveFileResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-drive-folder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Storage Folder To Bot</CardTitle>
              <CardDescription>
                Runs `addDriveFoldersToBot(vaultId, botId, folderIds)`. Paste one folder ID or
                several separated by commas or new lines to attach them without moving them.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddDriveFolderToBot}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="driveFolderVaultId">Target Vault ID</Label>
                  <Input
                    id="driveFolderVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driveFolderBotId">Bot ID</Label>
                  <Input
                    id="driveFolderBotId"
                    placeholder="Paste bot ID or create a bot above"
                    value={driveFolderBotId}
                    onChange={(e) => setDriveFolderBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driveFolderIds">Storage Folder ID(s)</Label>
                  <Textarea
                    id="driveFolderIds"
                    placeholder={"Existing vault storage folder ID\nfolder-id-two"}
                    value={driveFolderIds}
                    onChange={(e) => setDriveFolderIds(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple folder IDs with commas or new lines.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Linking..." : "Run addDriveFoldersToBot"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {addDriveFolderResult
                  ? JSON.stringify(addDriveFolderResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload-bot-files" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Bot Files</CardTitle>
              <CardDescription>
                Runs `uploadFilesToBot(files, vaultId, botId)`. Select one or more supported files
                and send them directly into the bot ingestion flow through the SDK route.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUploadBotFiles}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="uploadBotVaultId">Target Vault ID</Label>
                  <Input
                    id="uploadBotVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uploadBotId">Bot ID</Label>
                  <Input
                    id="uploadBotId"
                    placeholder="Paste bot ID or create a bot above"
                    value={uploadBotId}
                    onChange={(e) => setUploadBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botFiles">Files</Label>
                  <Input
                    id="botFiles"
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx,.mp3,.wav,.ogg,.mp4,.mov,.mkv"
                    onChange={(e) => setBotFiles(e.target.files)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported: PDF, TXT, DOCX, MP3, WAV, OGG, MP4, MOV, MKV.
                  </p>
                  <pre className="max-h-32 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                    {botFiles && botFiles.length > 0
                      ? Array.from(botFiles).map((file) => file.name).join("\n")
                      : "No files selected."}
                  </pre>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Uploading..." : "Run uploadFilesToBot"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {uploadBotFilesResult
                  ? JSON.stringify(uploadBotFilesResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot-chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot Chat</CardTitle>
              <CardDescription>
                Test `createVaultLaunchToken`, `redeemVaultLaunchToken`, `connectToBotChat`,
                `joinBotChat`, `sendBotChatMessage`, `sendBotChatTyping`, and `disconnectBotChat`.
                If you leave token fields empty, `connectToBotChat` will create and redeem fresh
                tokens before opening the socket.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-2 text-xs text-muted-foreground">
              Bot chat uses the newer token-based `/ws/chat` flow. It does not depend on
              the legacy signed `connectToWebsocket()` connection.
            </div>
            <div className="px-6 pb-2 text-xs text-muted-foreground">
              Status: {chatConnected ? "Connected" : "Disconnected"}
              {chatStreaming ? " • Streaming response" : ""}
            </div>
            <form onSubmit={handleConnectBotChat}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chatVaultId">Target Vault ID</Label>
                  <Input
                    id="chatVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatBotId">Bot ID</Label>
                  <Input
                    id="chatBotId"
                    placeholder="Paste bot ID or create a bot above"
                    value={chatBotId}
                    onChange={(e) => setChatBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatSessionId">Session ID</Label>
                  <Input
                    id="chatSessionId"
                    placeholder="Optional existing session ID"
                    value={chatSessionId}
                    onChange={(e) => setChatSessionId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="launchToken">Launch Token</Label>
                  <Textarea
                    id="launchToken"
                    placeholder="Optional: auto-filled by createVaultLaunchToken()"
                    value={launchToken}
                    onChange={(e) => setLaunchToken(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accessToken">Access Token</Label>
                  <Textarea
                    id="accessToken"
                    placeholder="Optional: auto-filled by redeemVaultLaunchToken()"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  <Button type="button" variant="outline" disabled={loading} onClick={handleCreateLaunchToken}>
                    {loading ? "Working..." : "Run createVaultLaunchToken"}
                  </Button>
                  <Button type="button" variant="outline" disabled={loading} onClick={handleRedeemLaunchToken}>
                    {loading ? "Working..." : "Run redeemVaultLaunchToken"}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Connecting..." : "Run connectToBotChat"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDisconnectBotChat}>
                    Run disconnectBotChat
                  </Button>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <Button type="button" variant="secondary" onClick={handleJoinBotChat}>
                    Run joinBotChat
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleSendTyping}>
                    Run sendBotChatTyping
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
              <CardDescription>
                History is optional. If provided, paste a JSON array like
                `[{"{"}"role":"user","content":"Hi"{"}"}]`.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSendBotChatMessage}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chatInput">Message</Label>
                  <Textarea
                    id="chatInput"
                    placeholder="Ask your bot something..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chatHistoryInput">Optional History JSON</Label>
                  <Textarea
                    id="chatHistoryInput"
                    placeholder='[{"role":"user","content":"Previous question"}]'
                    value={chatHistoryInput}
                    onChange={(e) => setChatHistoryInput(e.target.value)}
                    rows={5}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading || !chatConnected || chatStreaming}>
                  {chatStreaming ? "Streaming..." : "Run sendBotChatMessage"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Live Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-72 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {chatTranscript.length > 0
                  ? chatTranscript
                      .map((entry) => `${entry.role.toUpperCase()}:\n${entry.content}`)
                      .join("\n\n")
                  : "No chat messages yet."}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Bot Chat Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {launchTokenResult
                  ? JSON.stringify(launchTokenResult, null, 2)
                  : "No launch token response yet."}
              </pre>
              <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {redeemTokenResult
                  ? JSON.stringify(redeemTokenResult, null, 2)
                  : "No redeem token response yet."}
              </pre>
              <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {connectBotChatResult
                  ? JSON.stringify(connectBotChatResult, null, 2)
                  : "No connectToBotChat response yet."}
              </pre>
              <pre className="max-h-48 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {lastChatEvent
                  ? JSON.stringify(lastChatEvent, null, 2)
                  : "No live bot chat event yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
