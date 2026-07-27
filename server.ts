import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Gemini AI Wedding Assistant Endpoint
  app.post("/api/gemini/wedding-assistant", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm khóa API trong cài đặt bí mật.",
        });
      }

      const { prompt, type } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Thiếu nội dung yêu cầu (prompt)." });
      }

      const ai = new GoogleGenAI({ apiKey });

      let systemInstruction = `Bạn là chuyên gia tư vấn tổ chức đám cưới truyền thống và hiện đại tại Việt Nam. 
Hãy trả lời một cách tinh tế, ấm áp, rõ ràng và thiết thực bằng tiếng Việt. 
Trình bày bằng định dạng Markdown đẹp mắt, có danh sách rõ ràng, ước tính thực tế nếu liên quan đến chi phí hoặc mốc thời gian.`;

      if (type === "invitation") {
        systemInstruction += ` Nhiệm vụ hiện tại: Soạn thảo tin nhắn/lời mời đám cưới lịch sự, sang trọng hoặc ấm áp gần gũi cho cô dâu chú rể.`;
      } else if (type === "checklist") {
        systemInstruction += ` Nhiệm vụ hiện tại: Gợi ý các danh mục công việc cần chuẩn bị theo thời gian đếm ngược.`;
      } else if (type === "script") {
        systemInstruction += ` Nhiệm vụ hiện tại: Soạn thảo kịch bản chương trình (Lễ ăn hỏi, Lễ gia tiên, Tiệc cưới).`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      return res.status(500).json({
        error: err?.message || "Đã xảy ra lỗi khi kết nối với Trợ lý AI.",
      });
    }
  });

  // Vite middleware setup for Development / Express Static for Production
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Wedding Planner server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
