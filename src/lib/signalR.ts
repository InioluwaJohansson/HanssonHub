import * as signalR from "@microsoft/signalr";
import { API_BASE_URL } from "../config";

let homeSecurityConnection: signalR.HubConnection | null = null;
let chatConnection: signalR.HubConnection | null = null;

export const initSignalR = () => {
    const baseUrl = API_BASE_URL.replace('/Home_Security', '');
    const token = localStorage.getItem('token') || '';

    if (!homeSecurityConnection) {
        homeSecurityConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/HomeSecurityHub`, {
                accessTokenFactory: () => localStorage.getItem("token") || "",
                //transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect().configureLogging(signalR.LogLevel.Information)
            .build();
    }

    if (!chatConnection) {
        chatConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${baseUrl}/HomeSecurityChatHub`, {
                accessTokenFactory: () => localStorage.getItem("token") || "",
                //transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect().configureLogging(signalR.LogLevel.Information)
            .build();
    }

    return { homeSecurityConnection, chatConnection };
};
