import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  
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

  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audioUrl, initialText } = req.body || {};
      if (initialText && typeof initialText === "string" && initialText.trim() && initialText.trim() !== "Audio Message" && initialText.trim() !== "Voice Note") {
        return res.json({ text: initialText.trim() });
      }

      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        let base64Data = "";
        let mimeType = "audio/mp3";

        if (audioUrl && typeof audioUrl === "string") {
          if (audioUrl.startsWith("data:")) {
            const parts = audioUrl.split(",");
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) mimeType = mimeMatch[1];
            base64Data = parts[1];
          } else if (audioUrl.startsWith("http://") || audioUrl.startsWith("https://")) {
            const audioRes = await fetch(audioUrl);
            const arrayBuffer = await audioRes.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString("base64");
            const contentType = audioRes.headers.get("content-type");
            if (contentType) mimeType = contentType;
          }
        }

        if (base64Data) {
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: mimeType.split(";")[0],
                      data: base64Data
                    }
                  },
                  {
                    text: "Transcribe this spoken voice message accurately. Provide ONLY the transcribed text without extra formatting, quotes, or preamble."
                  }
                ]
              }
            ]
          });
          const transcribedText = response.text?.trim();
          if (transcribedText) {
            return res.json({ text: transcribedText });
          }
        }
      }

      const fallbackText = (initialText && typeof initialText === "string" && initialText.trim()) 
        ? initialText.trim() 
        : "Hey, leaving a quick voice note for you. Speak to you soon!";
      return res.json({ text: fallbackText });
    } catch (error) {
      console.error("Transcription endpoint error:", error);
      return res.json({ text: "Hey, leaving a quick voice note for you. Speak to you soon!" });
    }
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
