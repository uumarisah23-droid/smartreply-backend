require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartReply Backend Running");
});

app.get("/test-claude", async (req, res) => {
  try {
    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-6",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: "Say hello from Claude.",
          },
        ],
      },
      {
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      text: response.data.content[0].text,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

app.post("/generate-replies", async (req, res) => {
  try {
    const { message, language } = req.body;

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `
A user received this message:

"${message}"

If language is "Auto Detect",
detect the language of the user's message and respond in that language.

Otherwise generate ALL replies in:
${language}

The selected language is:
${language}

Generate replies in EXACTLY this format:

CASUAL:
- reply 1
- reply 2
- reply 3

FRIENDLY:
- reply 1
- reply 2
- reply 3

FUNNY:
- reply 1
- reply 2
- reply 3

PROFESSIONAL:
- reply 1
- reply 2
- reply 3

ROMANTIC:
- reply 1
- reply 2
- reply 3

SAVAGE:
- reply 1
- reply 2
- reply 3


Rules:
- Detect the language of the user's message automatically.
- Generate replies in the SAME language as the original message.
- If the message contains multiple languages, respond in the dominant language.
- Keep cultural context and tone appropriate for that language.
- Each reply must be short.
- Each reply must be different.
- Make them ready to copy and send.
- Return ONLY the categories above.
`,
          },
        ],
      },
      {
        headers: {
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
      }
    );
    const text = response.data.content[0].text;

console.log("Claude Reply:");
console.log(text);

res.json({
  success: true,
  text,
});
    
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: "Failed to generate reply",
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});