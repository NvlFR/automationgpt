# AutomationGPT 🚀

AutomationGPT is a sophisticated automation framework designed to streamline the process of creating Instagram Carousel content using ChatGPT. By leveraging Playwright in stealth mode, it bypasses advanced bot detection (like Cloudflare) to interact with ChatGPT Projects, generate content frameworks, and produce high-quality AI images.

## ✨ Features

- **🛡️ Stealth Browser Automation**: Powered by `playwright-extra` and `puppeteer-extra-plugin-stealth` to mimic human behavior and avoid detection.
- **📁 Persistent Session**: Stores browser sessions in `.user_data`, allowing you to login once and run automated tasks indefinitely.
- **🏗️ Content Workflow Orchestrator**: Automatically navigates between ChatGPT Projects (Topic Research -> Content Framework -> Slide Generation).
- **🖼️ High-Quality Image Downloader**: Interacts with the ChatGPT UI to download generated DALL-E images in original `.png` format.
- **📄 Markdown Export**: Automatically saves ChatGPT summaries and responses into organized `.md` files.
- **📜 History Tracking**: Logs every ChatGPT conversation URL into a `history.json` file for future reference.
- **🤖 Telegram Bot Integration**:
    - Real-time status notifications.
    - Automated delivery of generated Markdown reports and images to your Telegram chat.
    - Support for custom commands (e.g., `/status`, `/help`, `/generate`).

## 🛠️ Tech Stack

- **Engine**: [Playwright](https://playwright.dev/)
- **Runtime**: Node.js
- **Language**: TypeScript
- **Stealth**: [playwright-extra](https://github.com/berstend/puppeteer-extra/tree/master/packages/playwright-extra)
- **Telegram API**: [Telegraf](https://telegraf.js.org/)
- **HTTP Client**: [undici](https://undici.nodejs.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NvlFR/automationgpt.git
   cd automationgpt
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup environment variables**:
   Create a `.env` file in the root directory and fill in your details:
   ```env
   CHATGPT_EMAIL=your_email@example.com
   CHATGPT_PASSWORD=your_password
   HEADLESS=false

   # Telegram Configuration
   TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
   TELEGRAM_CHAT_ID=your_chat_id
   ```

4. **Initialize Playwright**:
   ```bash
   npx playwright install chromium
   ```

### Usage

1. **First Run (Manual Login)**:
   Run the bot for the first time to log in manually to ChatGPT. The session will be saved in the `.user_data` folder.
   ```bash
   npm start
   ```

2. **Run Automation**:
   Once logged in, the bot will autonomously execute the workflow:
   - Access designated ChatGPT Projects.
   - Generate summaries and frameworks.
   - Download images and export Markdown files.
   - Send reports to your Telegram bot.

## 📁 Project Structure

```text
├── src/
│   ├── services/
│   │   ├── ContentAutomator.ts  # Core automation logic
│   │   └── TelegramService.ts   # Telegram bot integration
│   ├── pages/                   # Page Object Models
│   ├── utils/                   # Helpers and loggers
│   └── index.ts                 # Main entry point
├── downloads/                   # Generated images and reports
├── data/                        # History logs
├── logs/                        # Debug logs
└── tests/                       # Playwright tests
```

## 📜 License

This project is licensed under the ISC License.

## 🙌 Contributing

Feel free to open issues or submit pull requests to improve the automation workflow!

---
Built with ❤️ by [Gemini CLI](https://github.com/google/gemini-cli)
