import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../config";
import { getBrowserId } from "../utils/browserId";

let homeSecurityConnection: signalR.HubConnection | null = null;

const signalRLogger: signalR.ILogger = {
    log(logLevel: signalR.LogLevel, message: string) {
        // Filter out noisy transient network negotiation errors when the dev tunnel or server is offline/reconnecting
        if (typeof message === "string" && (
            message.includes("Failed to fetch") || 
            message.includes("Failed to complete negotiation") ||
            message.includes("Failed to start the connection") ||
            message.includes("negotiate")
        )) {
            console.debug("[SignalR Network Notice]:", message);
            return;
        }
        if (logLevel >= signalR.LogLevel.Warning) {
            console.warn(`[SignalR]:`, message);
        }
    }
};

export const initSignalR = () => {
    const baseUrl = API_BASE_URL.replace('/Home_Security', '');

    if (!homeSecurityConnection) {
        const hubHeaders: Record<string, string> = {
            "X-Tunnel-Skip-AntiPhishing-Page": "true",
        };
        Object.defineProperty(hubHeaders, "X-Browser-Id", {
            enumerable: true,
            configurable: true,
            get: () => getBrowserId(),
        });

        homeSecurityConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/HomeSecurityHub`, {
                accessTokenFactory: () => localStorage.getItem("token") || "",
                headers: hubHeaders,
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    // Exponential backoff up to 30 seconds
                    return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                }
            })
            .configureLogging(signalRLogger)
            .build();
    }

    return { homeSecurityConnection };
};

export const resetSignalRConnection = async () => {
    if (homeSecurityConnection) {
        const conn = homeSecurityConnection;
        homeSecurityConnection = null;
        try {
            await conn.stop();
        } catch {
            // Ignore errors while stopping connection during logout/reset
        }
    }
};
