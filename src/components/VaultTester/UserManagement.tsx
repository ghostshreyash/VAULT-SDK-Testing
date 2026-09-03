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
  const [updateBotId, setUpdateBotId] = useState("");
  const [updateBotName, setUpdateBotName] = useState("");
  const [updateBotProfession, setUpdateBotProfession] = useState("");
  const [updateBotDescription, setUpdateBotDescription] = useState("");
  const [updateBotUseLLMFallback, setUpdateBotUseLLMFallback] = useState("");
  const [updateBotWordLimit, setUpdateBotWordLimit] = useState("");
  const [updateBotResult, setUpdateBotResult] = useState<unknown>(null);
  const [deleteBotId, setDeleteBotId] = useState("");
  const [deleteBotResult, setDeleteBotResult] = useState<unknown>(null);
  const [botDetailsBotId, setBotDetailsBotId] = useState("");
  const [botDetailsResult, setBotDetailsResult] = useState<unknown>(null);
  const [botSessionsBotId, setBotSessionsBotId] = useState("");
  const [botSessionsSessionId, setBotSessionsSessionId] = useState("");
  const [botSessionsResult, setBotSessionsResult] = useState<unknown>(null);
  const [deleteSessionsBotId, setDeleteSessionsBotId] = useState("");
  const [deleteSessionIds, setDeleteSessionIds] = useState("");
  const [deleteSessionsResult, setDeleteSessionsResult] = useState<unknown>(null);
  const [exportSessionsBotId, setExportSessionsBotId] = useState("");
  const [exportSessionIds, setExportSessionIds] = useState("");
  const [exportSaveOption, setExportSaveOption] = useState("drive");
  const [exportTargetBotId, setExportTargetBotId] = useState("");
  const [exportSessionsResult, setExportSessionsResult] = useState<unknown>(null);
  const [removeAssetBotId, setRemoveAssetBotId] = useState("");
  const [removeAssetType, setRemoveAssetType] = useState("file");
  const [removeAssetId, setRemoveAssetId] = useState("");
  const [removeAssetPermanent, setRemoveAssetPermanent] = useState(false);
  const [removeAssetKeepTranscript, setRemoveAssetKeepTranscript] = useState(false);
  const [removeAssetResult, setRemoveAssetResult] = useState<unknown>(null);
  const [botTextBotId, setBotTextBotId] = useState("");
  const [botTextFileId, setBotTextFileId] = useState("");
  const [botTextResult, setBotTextResult] = useState("");
  const [botFileActionBotId, setBotFileActionBotId] = useState("");
  const [botFileActionFileId, setBotFileActionFileId] = useState("");
  const [botFileActionResult, setBotFileActionResult] = useState<unknown>(null);
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

  const handleUpdateBot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "updateBot", "Initialize SDK before updating bots");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "updateBot",
        "Provide Target Vault ID in the dashboard header before updating a bot"
      );
      return;
    }

    const activeBotId = updateBotId.trim();
    if (!activeBotId) {
      addLog("warning", "updateBot", "Enter a Bot ID before updating a bot");
      return;
    }

    const updates: Record<string, unknown> = {};
    if (updateBotName.trim()) updates.name = updateBotName.trim();
    if (updateBotProfession.trim()) updates.profession = updateBotProfession.trim();
    if (updateBotDescription.trim()) updates.description = updateBotDescription.trim();
    if (updateBotUseLLMFallback) {
      updates.useLLMFallback = updateBotUseLLMFallback === "true";
    }
    if (updateBotWordLimit.trim()) {
      const parsedWordLimit = Number(updateBotWordLimit);
      if (!Number.isInteger(parsedWordLimit)) {
        addLog("warning", "updateBot", "Word limit must be a whole number");
        return;
      }
      updates.wordLimit = parsedWordLimit;
    }

    if (!Object.keys(updates).length) {
      addLog("warning", "updateBot", "Provide at least one field to update");
      return;
    }

    setLoading(true);
    try {
      addLog("info", "updateBot", `Updating bot ${activeBotId} for vault ${activeVaultId}...`);
      const response = await vault.updateBot(activeVaultId, activeBotId, updates);
      setUpdateBotResult(response);
      setBotDetailsBotId(activeBotId);
      addLog("success", "updateBot", "Bot updated successfully", response);
    } catch (error) {
      addLog("error", "updateBot", "Failed to update bot", error);
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

  const handleGetBotSessions = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "getBotSessions", "Initialize SDK before fetching bot sessions");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "getBotSessions",
        "Provide Target Vault ID in the dashboard header before fetching bot sessions"
      );
      return;
    }

    const activeBotId = botSessionsBotId.trim();
    if (!activeBotId) {
      addLog("warning", "getBotSessions", "Enter a Bot ID before fetching bot sessions");
      return;
    }

    const activeSessionId = botSessionsSessionId.trim();

    setLoading(true);
    try {
      addLog(
        "info",
        "getBotSessions",
        activeSessionId
          ? `Fetching messages for session ${activeSessionId} on bot ${activeBotId}...`
          : `Fetching chat sessions for bot ${activeBotId} in vault ${activeVaultId}...`
      );
      const response = await vault.getBotSessions(
        activeVaultId,
        activeBotId,
        activeSessionId || undefined
      );
      setBotSessionsResult(response);
      addLog(
        "success",
        "getBotSessions",
        activeSessionId ? "Session messages fetched" : "Bot sessions fetched",
        response
      );
    } catch (error) {
      addLog("error", "getBotSessions", "Failed to fetch bot sessions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBotSessions = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "deleteBotSessions", "Initialize SDK before deleting bot sessions");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "deleteBotSessions",
        "Provide Target Vault ID in the dashboard header before deleting bot sessions"
      );
      return;
    }

    const activeBotId = deleteSessionsBotId.trim();
    if (!activeBotId) {
      addLog("warning", "deleteBotSessions", "Enter a Bot ID before deleting bot sessions");
      return;
    }

    const normalizedSessionIds = deleteSessionIds
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!normalizedSessionIds.length) {
      addLog("warning", "deleteBotSessions", "Enter at least one Session ID before deleting");
      return;
    }

    setLoading(true);
    try {
      addLog(
        "info",
        "deleteBotSessions",
        `Deleting ${normalizedSessionIds.length} bot session(s) for bot ${activeBotId}...`
      );
      const response = await vault.deleteBotSessions(
        activeVaultId,
        activeBotId,
        normalizedSessionIds.length === 1 ? normalizedSessionIds[0] : normalizedSessionIds
      );
      setDeleteSessionsResult(response);
      addLog("success", "deleteBotSessions", "Bot session(s) deleted", response);
    } catch (error) {
      addLog("error", "deleteBotSessions", "Failed to delete bot session(s)", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportBotSessions = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "exportBotSessions", "Initialize SDK before exporting bot sessions");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "exportBotSessions",
        "Provide Target Vault ID in the dashboard header before exporting bot sessions"
      );
      return;
    }

    const activeBotId = exportSessionsBotId.trim();
    if (!activeBotId) {
      addLog("warning", "exportBotSessions", "Enter a Bot ID before exporting bot sessions");
      return;
    }

    const normalizedSessionIds = exportSessionIds
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!normalizedSessionIds.length) {
      addLog("warning", "exportBotSessions", "Enter at least one Session ID before exporting");
      return;
    }

    setLoading(true);
    try {
      addLog(
        "info",
        "exportBotSessions",
        `Exporting ${normalizedSessionIds.length} bot session(s) for bot ${activeBotId} to ${exportSaveOption}...`
      );
      const response = await vault.exportBotSessions(
        activeVaultId,
        activeBotId,
        normalizedSessionIds.length === 1 ? normalizedSessionIds[0] : normalizedSessionIds,
        exportSaveOption,
        exportTargetBotId.trim() || undefined
      );
      setExportSessionsResult(response);
      addLog("success", "exportBotSessions", "Bot session(s) exported", response);
    } catch (error) {
      addLog("error", "exportBotSessions", "Failed to export bot session(s)", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBotAsset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "removeBotAsset", "Initialize SDK before removing a bot asset");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "removeBotAsset",
        "Provide Target Vault ID in the dashboard header before removing a bot asset"
      );
      return;
    }

    const activeBotId = removeAssetBotId.trim();
    if (!activeBotId) {
      addLog("warning", "removeBotAsset", "Enter a Bot ID before removing a bot asset");
      return;
    }

    const activeAssetId = removeAssetId.trim();
    if (!activeAssetId) {
      addLog("warning", "removeBotAsset", "Enter an Asset ID before removing a bot asset");
      return;
    }

    setLoading(true);
    try {
      addLog(
        "info",
        "removeBotAsset",
        `Removing ${removeAssetType} ${activeAssetId} from bot ${activeBotId}...`
      );
      const response = await vault.removeBotAsset(
        activeVaultId,
        activeBotId,
        removeAssetType,
        activeAssetId,
        removeAssetType === "file"
          ? {
              permanent: removeAssetPermanent,
              keepTranscript: removeAssetKeepTranscript,
            }
          : undefined
      );
      setRemoveAssetResult(response);
      addLog("success", "removeBotAsset", "Bot asset removed", response);
    } catch (error) {
      addLog("error", "removeBotAsset", "Failed to remove bot asset", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBot = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "deleteBot", "Initialize SDK before deleting bots");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "deleteBot",
        "Provide Target Vault ID in the dashboard header before deleting a bot"
      );
      return;
    }

    const activeBotId = deleteBotId.trim();
    if (!activeBotId) {
      addLog("warning", "deleteBot", "Enter a Bot ID before deleting");
      return;
    }

    setLoading(true);
    try {
      console.log("deleteBot payload", {
        activeBotId,
        activeVaultId,
        rawVaultId: vaultId,
      });
      addLog("info", "deleteBot", "Delete bot payload", {
        activeBotId,
        activeVaultId,
        rawVaultId: vaultId,
      });
      addLog("info", "deleteBot", `Deleting bot ${activeBotId}...`);
      const response = await vault.deleteBot(activeBotId, activeVaultId);
      setDeleteBotResult(response);

      if (botDetailsBotId.trim() === activeBotId) setBotDetailsBotId("");
      if (uploadBotId.trim() === activeBotId) setUploadBotId("");
      if (driveFileBotId.trim() === activeBotId) setDriveFileBotId("");
      if (driveFolderBotId.trim() === activeBotId) setDriveFolderBotId("");
      if (chatBotId.trim() === activeBotId) setChatBotId("");
      setDeleteBotId("");

      addLog("success", "deleteBot", "Bot deleted successfully", response);
    } catch (error) {
      addLog("error", "deleteBot", "Failed to delete bot", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetBotFileText = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!vault) {
      addLog("warning", "getBotFileText", "Initialize SDK before reading bot file text");
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        "getBotFileText",
        "Provide Target Vault ID in the dashboard header before reading bot file text"
      );
      return;
    }

    const activeBotId = botTextBotId.trim();
    if (!activeBotId) {
      addLog("warning", "getBotFileText", "Enter a Bot ID before reading bot file text");
      return;
    }

    const activeFileId = botTextFileId.trim();
    if (!activeFileId) {
      addLog("warning", "getBotFileText", "Enter a File ID before reading bot file text");
      return;
    }

    setLoading(true);
    try {
      addLog("info", "getBotFileText", `Fetching extracted text for file ${activeFileId}...`);
      const response = await vault.getBotFileText(activeVaultId, activeBotId, activeFileId);
      setBotTextResult(typeof response === "string" ? response : JSON.stringify(response, null, 2));
      addLog("success", "getBotFileText", "Bot file text fetched");
    } catch (error) {
      setBotTextResult("");
      addLog("error", "getBotFileText", "Failed to fetch bot file text", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBotFileAction = async (action: "cancel" | "retry") => {
    if (!vault) {
      addLog(
        "warning",
        action === "cancel" ? "cancelBotFile" : "retryBotFile",
        "Initialize SDK before updating bot file status"
      );
      return;
    }

    const activeVaultId = vaultId.trim();
    if (!activeVaultId) {
      addLog(
        "warning",
        action === "cancel" ? "cancelBotFile" : "retryBotFile",
        "Provide Target Vault ID in the dashboard header before updating bot file status"
      );
      return;
    }

    const activeBotId = botFileActionBotId.trim();
    if (!activeBotId) {
      addLog(
        "warning",
        action === "cancel" ? "cancelBotFile" : "retryBotFile",
        "Enter a Bot ID before updating bot file status"
      );
      return;
    }

    const activeFileId = botFileActionFileId.trim();
    if (!activeFileId) {
      addLog(
        "warning",
        action === "cancel" ? "cancelBotFile" : "retryBotFile",
        "Enter a File ID before updating bot file status"
      );
      return;
    }

    setLoading(true);
    try {
      addLog(
        "info",
        action === "cancel" ? "cancelBotFile" : "retryBotFile",
        `${action === "cancel" ? "Cancelling" : "Retrying"} bot file ${activeFileId}...`
      );
      const response =
        action === "cancel"
          ? await vault.cancelBotFile(activeVaultId, activeBotId, activeFileId)
          : await vault.retryBotFile(activeVaultId, activeBotId, activeFileId);
      setBotFileActionResult(response);
      addLog(
        "success",
        action === "cancel" ? "cancelBotFile" : "retryBotFile",
        action === "cancel" ? "Bot file cancelled" : "Bot file retry started",
        response
      );
    } catch (error) {
      addLog(
        "error",
        action === "cancel" ? "cancelBotFile" : "retryBotFile",
        action === "cancel"
          ? "Failed to cancel bot file"
          : "Failed to retry bot file",
        error
      );
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
            "No bot chat token provided. Creating a launch token first..."
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
          "Redeeming launch token for a bot chat access token..."
        );
        const redeemResponse = await vault.redeemVaultLaunchToken(resolvedLaunchToken);
        setRedeemTokenResult(redeemResponse);

        resolvedAccessToken = extractAccessToken(redeemResponse);
        if (!resolvedAccessToken) {
          throw new Error("Access token was not returned by redeemVaultLaunchToken");
        }

        setAccessToken(resolvedAccessToken);
      }

      if (!resolvedAccessToken) {
        throw new Error("Bot chat access token is empty");
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
        `getBotDetails`, `getBotSessions`, `addDriveFilesToBot`, `addDriveFoldersToBot`,
        `uploadFilesToBot`, and the new bot chat methods. Bot creation works after the vault is
        linked to the same
        `clientApiKey`, and successful onboarding will auto-fill the shared Target Vault ID for
        the next step.
      </div>

      <Tabs defaultValue="platform" >
        <TabsList className="h-auto w-full flex-wrap justify-start ">
          <TabsTrigger value="platform" className="flex-none">
            Platform
          </TabsTrigger>
          <TabsTrigger value="bot" className="flex-none">
            Bot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="space-y-4">
          <Tabs defaultValue="create-user" className="space-y-4">
            <TabsList className="h-auto min-h-[5.5rem] w-full flex-wrap justify-start gap-1 sm:min-h-0">
              <TabsTrigger value="create-user" className="flex-none">
                Create Vault
              </TabsTrigger>
              <TabsTrigger value="import-vault" className="flex-none">
                Import Vault
              </TabsTrigger>
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

          </Tabs>
        </TabsContent>

        <TabsContent value="bot" className="space-y-4">
          <Tabs defaultValue="create-bot" >
            <TabsList className="!flex !h-auto !w-full flex-wrap content-start !items-start justify-start gap-1 py-1">
              <TabsTrigger value="create-bot" className="flex-none">
                Create Bot
              </TabsTrigger>
              <TabsTrigger value="update-bot" className="flex-none">
                Update Bot
              </TabsTrigger>
              <TabsTrigger value="delete-bot" className="flex-none">
                Delete Bot
              </TabsTrigger>
              <TabsTrigger value="get-bot-details" className="flex-none">
                Get Bot Details
              </TabsTrigger>
              <TabsTrigger value="get-bot-sessions" className="flex-none">
                Get Bot Sessions
              </TabsTrigger>
              <TabsTrigger value="delete-bot-sessions" className="flex-none">
                Delete Bot Sessions
              </TabsTrigger>
              <TabsTrigger value="export-bot-sessions" className="flex-none">
                Export Bot Sessions
              </TabsTrigger>
              <TabsTrigger value="remove-bot-asset" className="flex-none">
                Remove Bot Asset
              </TabsTrigger>
              <TabsTrigger value="get-bot-file-text" className="flex-none">
                Get Bot File Text
              </TabsTrigger>
              <TabsTrigger value="bot-file-actions" className="flex-none">
                Bot File Actions
              </TabsTrigger>
              <TabsTrigger value="add-drive-file" className="flex-none">
                Add Storage File
              </TabsTrigger>
              <TabsTrigger value="add-drive-folder" className="flex-none">
                Add Storage Folder
              </TabsTrigger>
              <TabsTrigger value="upload-bot-files" className="flex-none">
                Upload Bot Files
              </TabsTrigger>
              <TabsTrigger value="bot-chat" className="flex-none">
                Bot Chat
              </TabsTrigger>
            </TabsList>

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

        <TabsContent value="update-bot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Bot</CardTitle>
              <CardDescription>
                Runs `updateBot(vaultId, botId, updates)`. Fill only the fields you want to change.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleUpdateBot}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="updateBotVaultId">Target Vault ID</Label>
                  <Input
                    id="updateBotVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateBotId">Bot ID</Label>
                  <Input
                    id="updateBotId"
                    placeholder="Paste bot ID or create a bot above"
                    value={updateBotId}
                    onChange={(e) => setUpdateBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateBotName">Bot Name</Label>
                  <Input
                    id="updateBotName"
                    placeholder="Optional new bot name"
                    value={updateBotName}
                    onChange={(e) => setUpdateBotName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateBotProfession">Profession</Label>
                  <Input
                    id="updateBotProfession"
                    placeholder="Optional profession"
                    value={updateBotProfession}
                    onChange={(e) => setUpdateBotProfession(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateBotDescription">Description</Label>
                  <Textarea
                    id="updateBotDescription"
                    placeholder="Optional personality / bot description"
                    value={updateBotDescription}
                    onChange={(e) => setUpdateBotDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateBotUseLLMFallback">Use LLM Fallback</Label>
                  <select
                    id="updateBotUseLLMFallback"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={updateBotUseLLMFallback}
                    onChange={(e) => setUpdateBotUseLLMFallback(e.target.value)}
                  >
                    <option value="">Leave unchanged</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="updateBotWordLimit">Word Limit</Label>
                  <Input
                    id="updateBotWordLimit"
                    type="number"
                    min={10}
                    max={800}
                    step={1}
                    placeholder="Optional word limit"
                    value={updateBotWordLimit}
                    onChange={(e) => setUpdateBotWordLimit(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Run updateBot"}
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
                {updateBotResult
                  ? JSON.stringify(updateBotResult, null, 2)
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

        <TabsContent value="get-bot-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Bot Sessions</CardTitle>
              <CardDescription>
                Runs `getBotSessions(vaultId, botId, sessionId?)`. Leave Session ID empty to
                fetch all sessions for a bot, or provide one to fetch that session&apos;s messages.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleGetBotSessions}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="getBotSessionsVaultId">Target Vault ID</Label>
                  <Input
                    id="getBotSessionsVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="getBotSessionsBotId">Bot ID</Label>
                  <Input
                    id="getBotSessionsBotId"
                    placeholder="Paste bot ID or create a bot above"
                    value={botSessionsBotId}
                    onChange={(e) => setBotSessionsBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="getBotSessionsSessionId">Session ID</Label>
                  <Input
                    id="getBotSessionsSessionId"
                    placeholder="Optional: leave empty to fetch all sessions"
                    value={botSessionsSessionId}
                    onChange={(e) => setBotSessionsSessionId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Add a session ID only when you want the full message history for one chat.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Fetching..." : "Run getBotSessions"}
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
                {botSessionsResult
                  ? JSON.stringify(botSessionsResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delete-bot-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delete Bot Sessions</CardTitle>
              <CardDescription>
                Runs `deleteBotSessions(vaultId, botId, sessionIds)`. You can paste one Session
                ID or several separated by commas or new lines.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleDeleteBotSessions}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteBotSessionsVaultId">Target Vault ID</Label>
                  <Input
                    id="deleteBotSessionsVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deleteBotSessionsBotId">Bot ID</Label>
                  <Input
                    id="deleteBotSessionsBotId"
                    placeholder="Paste bot ID"
                    value={deleteSessionsBotId}
                    onChange={(e) => setDeleteSessionsBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deleteBotSessionsIds">Session ID(s)</Label>
                  <Textarea
                    id="deleteBotSessionsIds"
                    placeholder={"session-id-one\nsession-id-two"}
                    value={deleteSessionIds}
                    onChange={(e) => setDeleteSessionIds(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple session IDs with commas or new lines.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} variant="destructive">
                  {loading ? "Deleting..." : "Run deleteBotSessions"}
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
                {deleteSessionsResult
                  ? JSON.stringify(deleteSessionsResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export-bot-sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Bot Sessions</CardTitle>
              <CardDescription>
                Runs `exportBotSessions(vaultId, botId, sessionIds, saveOption, targetBotId?)`.
                You can paste one Session ID or several separated by commas or new lines.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleExportBotSessions}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exportBotSessionsVaultId">Target Vault ID</Label>
                  <Input
                    id="exportBotSessionsVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exportBotSessionsBotId">Bot ID</Label>
                  <Input
                    id="exportBotSessionsBotId"
                    placeholder="Paste bot ID"
                    value={exportSessionsBotId}
                    onChange={(e) => setExportSessionsBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exportBotSessionsIds">Session ID(s)</Label>
                  <Textarea
                    id="exportBotSessionsIds"
                    placeholder={"session-id-one\nsession-id-two"}
                    value={exportSessionIds}
                    onChange={(e) => setExportSessionIds(e.target.value)}
                    rows={4}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple session IDs with commas or new lines.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exportBotSessionsSaveOption">Save Option</Label>
                  <select
                    id="exportBotSessionsSaveOption"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={exportSaveOption}
                    onChange={(e) => setExportSaveOption(e.target.value)}
                  >
                    <option value="drive">drive</option>
                    <option value="brain">brain</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exportBotSessionsTargetBotId">Target Bot ID</Label>
                  <Input
                    id="exportBotSessionsTargetBotId"
                    placeholder="Optional: leave empty to export into the same bot when using brain"
                    value={exportTargetBotId}
                    onChange={(e) => setExportTargetBotId(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Exporting..." : "Run exportBotSessions"}
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
                {exportSessionsResult
                  ? JSON.stringify(exportSessionsResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remove-bot-asset" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Remove Bot Asset</CardTitle>
              <CardDescription>
                Runs `removeBotAsset(vaultId, botId, assetType, assetId)` for either a bot file
                or a linked storage folder.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRemoveBotAsset}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="removeBotAssetVaultId">Target Vault ID</Label>
                  <Input
                    id="removeBotAssetVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="removeBotAssetBotId">Bot ID</Label>
                  <Input
                    id="removeBotAssetBotId"
                    placeholder="Paste bot ID"
                    value={removeAssetBotId}
                    onChange={(e) => setRemoveAssetBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="removeBotAssetType">Asset Type</Label>
                  <select
                    id="removeBotAssetType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={removeAssetType}
                    onChange={(e) => setRemoveAssetType(e.target.value)}
                  >
                    <option value="file">file</option>
                    <option value="folder">folder</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="removeBotAssetId">Asset ID</Label>
                  <Input
                    id="removeBotAssetId"
                    placeholder="Paste file ID or folder ID"
                    value={removeAssetId}
                    onChange={(e) => setRemoveAssetId(e.target.value)}
                    required
                  />
                </div>
                {removeAssetType === "file" ? (
                  <div className="space-y-3 rounded-md border p-3">
                    <Label className="text-sm">File Options</Label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={removeAssetPermanent}
                        onChange={(e) => setRemoveAssetPermanent(e.target.checked)}
                      />
                      Permanently delete the drive file too
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={removeAssetKeepTranscript}
                        onChange={(e) => setRemoveAssetKeepTranscript(e.target.checked)}
                      />
                      Keep the transcript after removing the media file
                    </label>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} variant="destructive">
                  {loading ? "Removing..." : "Run removeBotAsset"}
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
                {removeAssetResult
                  ? JSON.stringify(removeAssetResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delete-bot" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Delete Bot</CardTitle>
              <CardDescription>
                Runs `deleteBot(botId, vaultId)`. The shared Target Vault ID is passed with
                the request so deletion stays in the expected vault context.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleDeleteBot}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="deleteBotVaultId">Target Vault ID</Label>
                  <Input
                    id="deleteBotVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deleteBotId">Bot ID</Label>
                  <Input
                    id="deleteBotId"
                    placeholder="Paste bot ID or create a bot above"
                    value={deleteBotId}
                    onChange={(e) => setDeleteBotId(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading} variant="destructive">
                  {loading ? "Deleting..." : "Run deleteBot"}
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
                {deleteBotResult
                  ? JSON.stringify(deleteBotResult, null, 2)
                  : "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="get-bot-file-text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Bot File Text</CardTitle>
              <CardDescription>
                Runs `getBotFileText(vaultId, botId, fileId)`. Use this to fetch the
                extracted plain-text content for a bot file through the SDK route.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleGetBotFileText}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botTextVaultId">Target Vault ID</Label>
                  <Input
                    id="botTextVaultId"
                    value={vaultId}
                    readOnly
                    placeholder="Set Target Vault ID in the dashboard header"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botTextBotId">Bot ID</Label>
                  <Input
                    id="botTextBotId"
                    placeholder="Paste bot ID"
                    value={botTextBotId}
                    onChange={(e) => setBotTextBotId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="botTextFileId">File ID</Label>
                  <Input
                    id="botTextFileId"
                    placeholder="Paste bot file ID"
                    value={botTextFileId}
                    onChange={(e) => setBotTextFileId(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Fetching..." : "Run getBotFileText"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {botTextResult || "No response yet."}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot-file-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot File Actions</CardTitle>
              <CardDescription>
                Runs `cancelBotFile(vaultId, botId, fileId)` and
                `retryBotFile(vaultId, botId, fileId)` through the SDK route.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botFileActionVaultId">Target Vault ID</Label>
                <Input
                  id="botFileActionVaultId"
                  value={vaultId}
                  readOnly
                  placeholder="Set Target Vault ID in the dashboard header"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="botFileActionBotId">Bot ID</Label>
                <Input
                  id="botFileActionBotId"
                  placeholder="Paste bot ID"
                  value={botFileActionBotId}
                  onChange={(e) => setBotFileActionBotId(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="botFileActionFileId">File ID</Label>
                <Input
                  id="botFileActionFileId"
                  placeholder="Paste bot file ID"
                  value={botFileActionFileId}
                  onChange={(e) => setBotFileActionFileId(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleBotFileAction("cancel")}
              >
                {loading ? "Working..." : "Run cancelBotFile"}
              </Button>
              <Button
                type="button"
                disabled={loading}
                onClick={() => handleBotFileAction("retry")}
              >
                {loading ? "Working..." : "Run retryBotFile"}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Latest Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-56 overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-100">
                {botFileActionResult
                  ? JSON.stringify(botFileActionResult, null, 2)
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
                Test `getBotSessions`, `createVaultLaunchToken`, `redeemVaultLaunchToken`,
                `connectToBotChat`, `joinBotChat`, `sendBotChatMessage`, `sendBotChatTyping`,
                and `disconnectBotChat`. If you leave token fields empty, `connectToBotChat` will
                mint and redeem them automatically.
              </CardDescription>
            </CardHeader>
            <div className="px-6 pb-2 text-xs text-muted-foreground">
              Bot chat uses the newer token-based `/ws/bot-chat` flow. It does not depend on
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
