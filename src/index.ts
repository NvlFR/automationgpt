import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as dotenv from 'dotenv';
import path from 'path';
import { ContentAutomator } from './services/ContentAutomator.js';

chromium.use(stealthPlugin());
dotenv.config();

const USER_DATA_DIR = path.join(process.cwd(), '.user_data');

async function runAutomation() {
    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
        headless: false,
        args: ['--disable-blink-features=AutomationControlled'],
    });

    const page = context.pages().length > 0 ? context.pages()[0]! : await context.newPage();
    const bot = new ContentAutomator(page, context);

    try {
        console.log('🧪 TEST: DIRECT URL NAVIGATION & SUMMARY');

        // 1. Langsung tembak URL Project lu (URL yang lu kasih tadi)
        const PROJECT_URL = "https://chatgpt.com/g/g-p-6a1669c057e881918ba9615e0165b896-content-framework/project";
        console.log(`🌐 Navigasi langsung ke: ${PROJECT_URL}`);
        await page.goto(PROJECT_URL, { waitUntil: 'networkidle' });

        // 2. Kirim prompt untuk summary
        console.log('✍️  Meminta summary...');
        const result = await bot.sendPrompt("create sunmary on News Ai Automation and langguege indonesia");

        const TOPIC_FOLDER = "news_ai_automation";
        if (result !== "No text found.") {
            // Simpan ke Markdown
            await bot.saveMarkdown(TOPIC_FOLDER, "summary_report", result);
        } else {
            console.log('🔍 Debug: Mengambil dump halaman karena teks tidak ditemukan...');
            const { dumpPage } = await import('./utils/logger.js');
            await dumpPage(page, 'failed-summary');
        }

        console.log('--------------------------------------------------');
        console.log('📄 RESULT SUMMARY (Saved to .md):');
        console.log(result.substring(0, 200) + "...");
        console.log('--------------------------------------------------');
        
        console.log(`✅ TEST SELESAI! Hasil summary sudah diambil.`);

    } catch (error) {
        console.error('❌ Terjadi Error saat Test:', error);
    } finally {
        console.log('Selesai. Menutup browser dalam 10 detik...');
        await page.waitForTimeout(10000);
        await context.close();
    }
}

runAutomation();
