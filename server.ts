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

  app.post("/api/assistant/ask", async (req, res) => {
    try {
      const { question, context } = req.body || {};
      if (!question || typeof question !== "string" || !question.trim()) {
        return res.json({ answer: "I didn't hear a question. How can I help you?" });
      }

      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const systemPrompt = "You are Friday, a smart, helpful, friendly female AI smart home and personal assistant. Answer the user's question clearly, politely, and concisely (in 1 to 3 short sentences suitable for text-to-speech voice output). Do NOT use markdown, bullet points, asterisks, or complex symbols.";
        const fullPrompt = context ? `${systemPrompt}\nContext: ${context}\n\nUser Question: ${question}` : `${systemPrompt}\n\nUser Question: ${question}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: fullPrompt,
        });

        const answer = response.text?.trim()?.replace(/[*#_~`]/g, '');
        if (answer) {
          return res.json({ answer });
        }
      }

      // Smart fallback responses when Gemini key is not set
      const qLower = question.toLowerCase();
      if (qLower.includes("time") || qLower.includes("clock")) {
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return res.json({ answer: `The current time is ${timeStr}.` });
      }
      if (qLower.includes("date") || qLower.includes("day is it") || qLower.includes("today")) {
        const dateStr = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        return res.json({ answer: `Today is ${dateStr}.` });
      }
      if (qLower.includes("who are you") || qLower.includes("your name")) {
        return res.json({ answer: "I am Friday, your personal AI assistant." });
      }
      if (qLower.includes("how are you")) {
        return res.json({ answer: "I'm doing wonderfully, thank you! How can I help you today?" });
      }

      return res.json({ answer: `I heard you ask: "${question}". I'm here to assist with all your smart home devices, calls, messages, and questions.` });
    } catch (error) {
      console.error("Assistant ask endpoint error:", error);
      return res.json({ answer: "I am here to help you. What would you like to know?" });
    }
  });

  app.post("/api/transcribe", async (req, res) => {
    try {
      const { audioUrl } = req.body || {};

      if (process.env.GEMINI_API_KEY && audioUrl && typeof audioUrl === "string") {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        let base64Data = "";
        let mimeType = "audio/webm";

        if (audioUrl.startsWith("data:")) {
          const parts = audioUrl.split(",");
          const mimeMatch = parts[0].match(/:(.*?);/);
          if (mimeMatch && mimeMatch[1]) mimeType = mimeMatch[1];
          base64Data = parts[1] || "";
        } else {
          const targetUrl = audioUrl.startsWith("http://") || audioUrl.startsWith("https://") 
            ? audioUrl 
            : `http://127.0.0.1:3000${audioUrl.startsWith('/') ? '' : '/'}${audioUrl}`;
          const audioRes = await fetch(targetUrl);
          if (audioRes.ok) {
            const arrayBuffer = await audioRes.arrayBuffer();
            base64Data = Buffer.from(arrayBuffer).toString("base64");
            const contentType = audioRes.headers.get("content-type");
            if (contentType) mimeType = contentType;
          }
        }

        if (base64Data) {
          const cleanMimeType = mimeType.split(";")[0].trim() || "audio/webm";
          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: cleanMimeType,
                      data: base64Data
                    }
                  },
                  {
                    text: "Please transcribe this spoken voice message accurately word-for-word. Provide ONLY the transcribed text without extra formatting, quotes, commentary, or preamble. If there are no clear spoken words or you are unable to transcribe it, respond with: Unable to transcribe message"
                  }
                ]
              }
            ]
          });

          let transcribedText = response.text?.trim();
          if (transcribedText) {
            if ((transcribedText.startsWith('"') && transcribedText.endsWith('"')) ||
                (transcribedText.startsWith("'") && transcribedText.endsWith("'"))) {
              transcribedText = transcribedText.slice(1, -1).trim();
            }
            if (transcribedText) {
              return res.json({ text: transcribedText });
            }
          }
        }
      }

      return res.json({ text: "Unable to transcribe message" });
    } catch (error) {
      console.error("Transcription endpoint error:", error);
      return res.json({ text: "Unable to transcribe message" });
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
