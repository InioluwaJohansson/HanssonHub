import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../config";

let homeSecurityConnection: signalR.HubConnection | null = null;

export const initSignalR = () => {
    const baseUrl = API_BASE_URL.replace('/Home_Security', '');

    if (!homeSecurityConnection) {
        homeSecurityConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/HomeSecurityHub`, {
                accessTokenFactory: () => localStorage.getItem("token") || "",
                transport: signalR.HttpTransportType.ServerSentEvents | signalR.HttpTransportType.LongPolling
            })
            .withAutomaticReconnect().configureLogging(signalR.LogLevel.Information)
            .build();
    }

    return { homeSecurityConnection };
};
