import { WebSocketServer } from "ws";
import { Server } from "http";

let wss: WebSocketServer;

export const setupWebSocket = (server: Server) => {
    wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("🟢 Client connected to WebSocket");

        ws.on("close", () => {
            console.log("🔴 Client disconnected");
        });
    });
};

export const broadcastToClients = (data: any) => {
    if (!wss) return;
    wss.clients.forEach((client) => {
        if (client.readyState === 1) {
            client.send(JSON.stringify(data));
        }
    });
};