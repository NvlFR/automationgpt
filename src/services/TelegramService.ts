import { Telegraf } from 'telegraf';
import fs from 'fs';

export class TelegramService {
    private bot: Telegraf;
    private chatId: string;

    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        this.chatId = process.env.TELEGRAM_CHAT_ID || "";
        
        if (!token) {
            console.warn('⚠️ TELEGRAM_BOT_TOKEN tidak ditemukan di .env');
        }
        this.bot = new Telegraf(token || "");

        this.setupCommands();
    }

    private setupCommands() {
        this.bot.start((ctx) => ctx.reply('👋 Halo! Bot ChatGPT Automation siap melayani. Gunakan /help untuk melihat menu.'));
        
        this.bot.command('help', (ctx) => {
            ctx.reply(`🛠️ *Menu Perintah (Placeholder):*
/generate - Mulai workflow carousel
/status   - Cek status bot
/history  - Lihat history URL terakhir
/reset    - Reset sesi browser`, { parse_mode: 'Markdown' });
        });

        this.bot.command('generate', (ctx) => ctx.reply('🚀 Workflow generate carousel sedang disiapkan... (Fungsi ini akan segera aktif)'));
        this.bot.command('status', (ctx) => ctx.reply('✅ Bot sedang standby dan siap digunakan.'));
        this.bot.command('history', (ctx) => ctx.reply('📜 Menampilkan 5 history terakhir... (Fungsi ini akan segera aktif)'));

        // Jalankan bot dalam mode polling agar bisa menerima perintah
        this.bot.launch().catch(err => console.error('❌ Telegram Bot Error:', err));
    }

    async sendMessage(text: string) {
        if (!this.chatId) return;
        try {
            await this.bot.telegram.sendMessage(this.chatId, text);
            console.log('📨 Pesan terkirim ke Telegram.');
        } catch (error) {
            console.error('❌ Gagal kirim pesan Telegram:', error);
        }
    }

    async sendDocument(filePath: string, caption?: string) {
        if (!this.chatId || !fs.existsSync(filePath)) return;
        try {
            await this.bot.telegram.sendDocument(this.chatId, { source: filePath }, { caption });
            console.log(`📄 Dokumen ${filePath} terkirim ke Telegram.`);
        } catch (error) {
            console.error('❌ Gagal kirim dokumen Telegram:', error);
        }
    }

    async sendPhoto(filePath: string, caption?: string) {
        if (!this.chatId || !fs.existsSync(filePath)) return;
        try {
            await this.bot.telegram.sendPhoto(this.chatId, { source: filePath }, { caption });
            console.log(`🖼️ Foto ${filePath} terkirim ke Telegram.`);
        } catch (error) {
            console.error('❌ Gagal kirim foto Telegram:', error);
        }
    }
}
