import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // In-memory chat history
  const messages: any[] = [
    {
      id: "1",
      userId: "system",
      userName: "HanssonHub",
      text: "Welcome to the home chat! This is a secure space for your family.",
      timestamp: new Date().toISOString(),
      type: "text"
    }
  ];

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Send history
    socket.emit("chat:history", messages);

    socket.on("chat:message", (msg) => {
      const newMessage = {
        ...msg,
        timestamp: msg.timestamp || new Date().toISOString()
      };
      messages.push(newMessage);
      io.emit("chat:message", newMessage);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
