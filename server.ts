import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Gemini client securely
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json({ limit: "15mb" }));

  // API Route for chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, systemPrompt } = req.body;
      
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured in environment variables." });
      }

      // Format history properly for @google/genai SDK:
      const contents = [];
      if (history && history.length > 0) {
        history.forEach((h: any) => {
          contents.push({
            role: h.role === "assistant" || h.role === "model" ? "model" : "user",
            parts: [{ text: h.text }]
          });
        });
      }
      
      // Append current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: systemPrompt || "You are a helpful assistant.",
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Failed to generate content" });
    }
  });

  // Interfaces for SVG Poster Generator
  interface PosterData {
    theme: string;
    category: string;
    mainTitle: string;
    subtitle: string;
    warningText: string;
    rules: string[];
    checklist: string[];
    slogan: string;
  }

  const FALLBACK_POSTERS: Record<string, PosterData> = {
    foley: {
      theme: "indigo",
      category: "尿管置放與護理 SOP",
      mainTitle: "尿管防漏與合規無菌引流",
      subtitle: "總院-護理-作標-3-01024",
      warningText: "⚠️ 消毒重大變革：置放尿管全面禁止 CHG 消毒！應用水溶性優碘！",
      rules: [
        "無菌消毒：置放一律採「水溶性優碘」消毒，再以無菌水清潔。",
        "打水禁忌：氣囊打無菌蒸餾水，禁止使用 N.S. 生理食鹽水以免結晶。",
        "管路固定：男性固定於恥骨聯合處，女性固定於大腿內側。"
      ],
      checklist: [
        "確認用「水溶性優碘」與無菌水配裝，不與 CHG 混淆",
        "水球僅限注入「蒸餾水」，每班評估管路引流並防止尿袋碰地",
        "尿袋每班或達 2/3 (1250ml) 必須排空並落實自解追蹤"
      ],
      slogan: "落實無菌消毒 ‧ 遠離尿路感染"
    },
    iad: {
      theme: "emerald",
      category: "失禁皮膚炎 IAD 預防標準",
      mainTitle: "失禁修復與防護三明治程序",
      subtitle: "總院-護理-作標-3-01010",
      warningText: "⚠️ 2級點狀破皮：噴灑適透膜粉加無痛膜，連續重疊 3 遍！",
      rules: [
        "輕柔清潔：禁止用力摩擦！採 pH 4-7 之弱酸性乾洗潔膚液按壓。",
        "修復屏障：0-1級塗抹保膚膏/氧化鋅；2級點狀破皮採三明治法。",
        "微氣候管理：肛門口塞「散紗」吸附滲便，每 2 小時翻身檢視。"
      ],
      checklist: [
        "按壓清洗避粗糙，每次更換洗淨舊保護膏與分泌物",
        "破皮處落實「造口粉+無痛膜 Q8-12H 重疊 3 次」噴塗",
        "懷疑黴菌感染時通知醫師，禁止將抗黴藥膏混合粉霜"
      ],
      slogan: "三明治防護防潮 ‧ 守護脆弱肌膚"
    },
    pressure: {
      theme: "amber",
      category: "壓力性損傷預防及護理",
      mainTitle: "壓傷精準防護與分級照護",
      subtitle: "總院-護理-作標-3-01040",
      warningText: "⚠️ 臨床禁忌：慢性傷口忌用優碘與克菌靈！避免抑制細胞生長！",
      rules: [
        "高危評估：Braden Scale ≦ 16 分立即採取防壓及翻身措施。",
        "足跟屏障：足跟緊密乾燥之焦痂(Stable Eschar)不宜清除/軟化。",
        "創面施藥：3級捲邊由醫師清創；4級乾淨NS濕敷，發炎NS+優碘1:20。"
      ],
      checklist: [
        "高危患者每 2 小時翻身，足跟輔以懸空減壓或矽膠貼",
        "傷口大小長寬深用紙尺，潛行深度拿 ENT 棉棒鐘向測量",
        "不隨意清除跟骨乾燥乾痂，3-4級傷口照會專業傷口師"
      ],
      slogan: "減壓翻身最關鍵 ‧ 生物乾痂莫清創"
    },
    bowel: {
      theme: "rose",
      category: "腸蠕動音聽診評估技術",
      mainTitle: "舒適屈膝與暖膜聽診技術",
      subtitle: "總院-護理-作標-3-01008",
      warningText: "⚠️ 聽診禁忌：禁止直接放置冰冷膜面，應雙手摩擦溫暖膜面！",
      rules: [
        "擺位放鬆：請病人排尿，平躺採「雙膝打彎屈膝姿勢」放鬆腹肌。",
        "聽診順序：肚臍劃分四象限，由右下(RLQ)起順時針聽診。",
        "異常確認：若聽診減少，每個象限必須「聽診滿整整1分鐘」。"
      ],
      checklist: [
        "聽診器膜面用手雙面揉搓溫熱，防止病人腹肌緊張",
        "聽診自右下象限(RLQ)順時針環形進行 5-34 次/分",
        "聽診音偏低時，每個象限完整計時重聽達 1 分鐘以上"
      ],
      slogan: "暖膜聽診屈膝平躺 ‧ 順序測量精細掌握"
    },
    admin: {
      theme: "teal",
      category: "8B病房排班管理規範",
      mainTitle: "排班特休與預假自主勾稽",
      subtitle: "總院-護理-8B-3-A0001",
      warningText: "⚠️ 排班底線：連續 5 個月相同班別者，第 6 個月必須轉班！",
      rules: [
        "特休申請：特休天數上限與申請限至多 2 次。",
        "預假額度：預假總預1、預2上限均為 5 天。",
        "班別轉換：拒絕單一班別無限期留置，保障同仁作息調適平衡。"
      ],
      checklist: [
        "自填預假比對特休額度，不超限額與干擾病房人力",
        "追蹤班表輪轉度，第 6 個月確實落實班別與夜班輪調",
        "病房護理長綜合評估科室總體合規性與公平排班"
      ],
      slogan: "公平考勤彈性調度 ‧ 連續限假守護健康"
    }
  };

  function buildSvgPoster(data: PosterData): string {
    const themeColors: Record<string, { primary: string; secondary: string; light: string; accent: string }> = {
      indigo: { primary: "#4f46e5", secondary: "#1e1b4b", light: "#f5f3ff", accent: "#a5b4fc" },
      emerald: { primary: "#059669", secondary: "#022c22", light: "#ecfdf5", accent: "#6ee7b7" },
      amber: { primary: "#d97706", secondary: "#451a03", light: "#fef3c7", accent: "#fde047" },
      rose: { primary: "#e11d48", secondary: "#4c0519", light: "#fff1f2", accent: "#fda4af" },
      teal: { primary: "#0d9488", secondary: "#114e4a", light: "#f0fdfa", accent: "#5eead4" },
      red: { primary: "#dc2626", secondary: "#450a0a", light: "#fef2f2", accent: "#fca5a5" },
    };

    const colors = themeColors[data.theme] || themeColors.indigo;

    return `
  <svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850">
    <rect width="600" height="850" fill="#f8fafc" />
    <rect width="570" height="820" x="15" y="15" rx="16" fill="#ffffff" stroke="${colors.primary}" stroke-width="4" />
    <rect width="554" height="804" x="23" y="23" rx="12" fill="none" stroke="${colors.primary}33" stroke-width="1.5" stroke-dasharray="6 4" />
    
    <defs>
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="0.5" />
      </pattern>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colors.secondary}" />
        <stop offset="100%" stop-color="${colors.primary}" />
      </linearGradient>
    </defs>
    <rect width="538" height="788" x="31" y="31" fill="url(#grid)" opacity="0.6" rx="8" />

    <!-- Header Option -->
    <path d="M 31 39 Q 31 31 39 31 L 561 31 Q 569 31 569 39 L 569 135 L 31 135 Z" fill="url(#headerGrad)" />
    
    <!-- Cross icon -->
    <circle cx="70" cy="83" r="24" fill="#ffffff" />
    <path d="M 62 83 H 78 M 70 75 V 91" stroke="${colors.primary}" stroke-width="5" stroke-linecap="round" />
    
    <text x="110" y="70" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="18" fill="#ffffff" letter-spacing="1">${data.mainTitle}</text>
    <text x="110" y="94" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="11" fill="${colors.accent}" text-transform="uppercase" letter-spacing="1.5">${data.category} ‧ 臨床落實規範</text>
    <text x="110" y="112" font-family="'Inter', system-ui, sans-serif" font-size="11" fill="#cbd5e1">${data.subtitle}</text>

    <!-- Stamp -->
    <g transform="translate(485, 55)">
      <circle cx="25" cy="25" r="26" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3 2" />
      <circle cx="25" cy="25" r="23" fill="#ffffff22" />
      <text x="25" y="21" font-family="'Inter', system-ui, sans-serif" font-weight="950" font-size="7" fill="#ffffff" text-anchor="middle">8BQ大補丸</text>
      <text x="25" y="31" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="6" fill="${colors.accent}" text-anchor="middle">APPROVED</text>
      <text x="25" y="41" font-family="'Inter', system-ui, sans-serif" font-weight="black" font-size="7" fill="#ffffff" text-anchor="middle">2026評鑑</text>
    </g>

    <!-- WARNING BANNER -->
    <rect x="45" y="155" width="510" height="42" rx="8" fill="#fef2f2" stroke="#fee2e2" stroke-width="1" />
    <text x="300" y="181" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="12" fill="#ef4444" text-anchor="middle">${data.warningText}</text>

    <!-- PART A: CORE RULES -->
    <text x="45" y="228" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="14" fill="${colors.secondary}">【 核心作業標準 ‧ 臨床指引 】</text>
    <line x1="45" y1="236" x2="555" y2="236" stroke="${colors.primary}33" stroke-width="1.5" />

    <!-- Card 1 -->
    <g transform="translate(45, 250)">
      <rect width="510" height="65" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
      <path d="M 0 8 Q 0 0 8 0 L 15 0 L 15 65 L 8 65 Q 0 65 0 57 Z" fill="${colors.primary}" />
      <circle cx="35" cy="32.5" r="14" fill="${colors.light}" />
      <text x="35" y="36.5" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="13" fill="${colors.primary}" text-anchor="middle">1</text>
      <text x="65" y="38" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="12" fill="#1e293b">${data.rules[0] || "落實標準臨床洗手，確保無菌面"}</text>
    </g>

    <!-- Card 2 -->
    <g transform="translate(45, 327)">
      <rect width="510" height="65" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
      <path d="M 0 8 Q 0 0 8 0 L 15 0 L 15 65 L 8 65 Q 0 65 0 57 Z" fill="${colors.primary}" />
      <circle cx="35" cy="32.5" r="14" fill="${colors.light}" />
      <text x="35" y="36.5" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="13" fill="${colors.primary}" text-anchor="middle">2</text>
      <text x="65" y="38" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="12" fill="#1e293b">${data.rules[1] || "精準執行病患管路、防止滑脫壓迫"}</text>
    </g>

    <!-- Card 3 -->
    <g transform="translate(45, 404)">
      <rect width="510" height="65" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
      <path d="M 0 8 Q 0 0 8 0 L 15 0 L 15 65 L 8 65 Q 0 65 0 57 Z" fill="${colors.primary}" />
      <circle cx="35" cy="32.5" r="14" fill="${colors.light}" />
      <text x="35" y="36.5" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="13" fill="${colors.primary}" text-anchor="middle">3</text>
      <text x="65" y="38" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="12" fill="#1e293b">${data.rules[2] || "依據手冊程序執行，完成護理記錄"}</text>
    </g>

    <!-- PART B: COMPLIANCE CHECKLIST -->
    <text x="45" y="505" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="14" fill="${colors.secondary}">【 臨床督導稽核指標 ‧ Checklist 】</text>
    <line x1="45" y1="513" x2="555" y2="513" stroke="${colors.primary}33" stroke-width="1.5" />

    <g transform="translate(45, 525)">
      <rect width="510" height="190" rx="10" fill="${colors.light}" stroke="${colors.primary}1f" stroke-width="1" />
      
      <!-- Item 1 -->
      <g transform="translate(20, 20)">
        <circle cx="15" cy="18" r="9" fill="${colors.primary}" />
        <path d="M 11 18 L 14 21 L 19 15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <text x="35" y="22" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="11.5" fill="#334155">${data.checklist[0] || "準備無菌包盤，手部清潔確實"}</text>
      </g>

      <!-- Item 2 -->
      <g transform="translate(20, 75)">
        <circle cx="15" cy="18" r="9" fill="${colors.primary}" />
        <path d="M 11 18 L 14 21 L 19 15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <text x="35" y="22" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="11.5" fill="#334155">${data.checklist[1] || "確認消毒浸潤乾燥時間，符合規定"}</text>
      </g>

      <!-- Item 3 -->
      <g transform="translate(20, 130)">
        <circle cx="15" cy="18" r="9" fill="${colors.primary}" />
        <path d="M 11 18 L 14 21 L 19 15" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <text x="35" y="22" font-family="'Inter', system-ui, sans-serif" font-weight="bold" font-size="11.5" fill="#334155">${data.checklist[2] || "管路防壓固定與排空紀錄，確實勾稽"}</text>
      </g>
    </g>

    <!-- Bottom Slogan -->
    <g transform="translate(45, 735)">
      <rect width="510" height="42" rx="21" fill="url(#headerGrad)" />
      <circle cx="45" cy="21" r="5" fill="#ffffff" opacity="0.4" />
      <circle cx="45" cy="21" r="2" fill="#ffffff" />
      <text x="255" y="26" font-family="'Inter', system-ui, sans-serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle" letter-spacing="3">${data.slogan}</text>
    </g>

    <text x="300" y="805" font-family="'Inter', system-ui, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">奇美醫院護理部 8B 病房合規自主管理委員會 ‧ 2026 年宣導製</text>
  </svg>
    `.trim();
  }

  // API Route for image/poster generation
  app.post("/api/gemini/poster", async (req, res) => {
    try {
      const { title } = req.body;
      let posterData: PosterData;

      const promptText = `你是一個專業的台灣臨床護理品管與海報排版專家。請為以下臨床規範主題設計一張高畫質、排版嚴謹的「宣導海報」內容關係對應：
主題：「${title}」

請分析此主題，並輸出為以下 JSON 格式。請只返回一個合法的 JSON 物件，不需要包含任何 Markdown 標記 (\`\`\`json ...) 或外圍文字，格式如下：
{
  "theme": "indigo" | "emerald" | "amber" | "rose" | "teal" | "red",
  "category": "臨床 SOP 重點 或 處罰與法規警告 或 品質指標規範",
  "mainTitle": "海報的大標題，簡短醒目，中文，15字內",
  "subtitle": "副標題，中文，22字內",
  "warningText": "⚠️ 警告防錯字句，例如：⚠️ 違反標準列入住院、全院品質指標扣點！",
  "rules": [
    "第 1 條核心指引（中文，22字內，精準）",
    "第 2 條核心指引（中文，22字內，精準）",
    "第 3 條核心指引（中文，22字內，精準）"
  ],
  "checklist": [
    "稽核重點 1：22字內",
    "稽核重點 2：22字內",
    "稽核重點 3：22字內"
  ],
  "slogan": "下方響亮宣導標語，5-15字"
}`;

      // 1. Try to query Gemini 3.5 Flash text model
      if (apiKey) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            config: {
              responseMimeType: "application/json"
            }
          });

          let responseText = response.text || "";
          responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsed = JSON.parse(responseText);

          if (parsed.mainTitle && parsed.rules && parsed.rules.length >= 3) {
            posterData = {
              theme: parsed.theme || "indigo",
              category: parsed.category || "臨床合規標準",
              mainTitle: parsed.mainTitle,
              subtitle: parsed.subtitle || title,
              warningText: parsed.warningText || "⚠️ 請嚴格落實標準程序，違者列入考核！",
              rules: parsed.rules,
              checklist: parsed.checklist || ["確認無菌環境操作", "執行手部洗手標準", "落實每班勾稽與登錄"],
              slogan: parsed.slogan || "落實指引 ‧ 安全醫療"
            };
          } else {
            throw new Error("Invalid structure from Gemini JSON response");
          }
        } catch (gemError) {
          console.warn("Gemini poster text extraction failed, mapping fallback static blueprint", gemError);
          posterData = getStaticPosterData(title);
        }
      } else {
        posterData = getStaticPosterData(title);
      }

      // 2. Generate the beautiful SVG poster!
      const svg = buildSvgPoster(posterData);
      const base64Image = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
      return res.json({ image: base64Image });

    } catch (error: any) {
      console.error("Poster creation error:", error);
      res.status(500).json({ error: error.message || "Failed to construct poster." });
    }
  });

  // Local helper to match keyword fallbacks
  function getStaticPosterData(title: string): PosterData {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("尿管") || lowerTitle.includes("導尿") || lowerTitle.includes("foley")) {
      return FALLBACK_POSTERS.foley;
    } else if (lowerTitle.includes("失禁") || lowerTitle.includes("iad") || lowerTitle.includes("皮膚")) {
      return FALLBACK_POSTERS.iad;
    } else if (lowerTitle.includes("壓傷") || lowerTitle.includes("損傷") || lowerTitle.includes("pressure") || lowerTitle.includes("褥")) {
      return FALLBACK_POSTERS.pressure;
    } else if (lowerTitle.includes("腸") || lowerTitle.includes("聽診") || lowerTitle.includes("蠕動") || lowerTitle.includes("bowel")) {
      return FALLBACK_POSTERS.bowel;
    } else if (lowerTitle.includes("排班") || lowerTitle.includes("班") || lowerTitle.includes("8b")) {
      return FALLBACK_POSTERS.admin;
    } else {
      return {
        theme: "indigo",
        category: "臨床合規與評鑑標準",
        mainTitle: title.length > 15 ? title.slice(0, 15) : title,
        subtitle: "總院護理部 - 品質指標宣導",
        warningText: "⚠️ 警告：違反臨床護理標準將影響評鑑優等！",
        rules: [
          "確實執行：完整研讀作業指導書指引，無例外執行。",
          "加強查檢：護理長與督導不定期抽查現場操作實務。",
          "正確病歷：所有臨床技術皆需於護理病歷中詳實勾稽。"
        ],
        checklist: [
          "技術執行前詳閱病患與醫囑，準備齊全備品",
          "技術中遵循無菌操作，確實維護臨床品管",
          "下班前完成品質指標核對，未有缺漏遲誤"
        ],
        slogan: "以病人安全為中心 ‧ 讓醫療標準更精準"
      };
    }
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
