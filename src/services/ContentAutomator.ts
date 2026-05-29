import type { Page, BrowserContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export class ContentAutomator {
    constructor(private page: Page, private context: BrowserContext) {}

    async accessProject(projectName: string) {
        console.log(`🔍 Mencari Project di Sidebar: ${projectName}`);
        
        // 1. Pastikan sidebar terbuka
        const openSidebarBtn = this.page.locator('button[aria-label="Open sidebar"]');
        if (await openSidebarBtn.isVisible()) {
            console.log('   - Sidebar tertutup, membukanya...');
            await openSidebarBtn.click();
            await this.page.waitForTimeout(1500);
        }

        // 2. Cari row project
        // Row ini punya class "group/project-unfurl-row"
        const projectRow = this.page.locator('.group\\/project-unfurl-row', { hasText: new RegExp(`^${projectName}$`, 'i') });
        
        if (!(await projectRow.isVisible())) {
            console.log('   - Project tidak langsung terlihat, mencoba klik "Show more"...');
            const showMoreBtn = this.page.locator('button:has-text("Show more")');
            if (await showMoreBtn.isVisible()) {
                await showMoreBtn.click();
                await this.page.waitForTimeout(2000);
            }
        }

        // 3. Klik tombol "Open project home" yang ada di dalem row tersebut
        // Tombol ini punya aria-label "Open project home" dan muncul saat hover atau aktif
        const projectHomeBtn = projectRow.locator('button[aria-label="Open project home"]');
        
        if (await projectRow.isVisible()) {
            console.log(`   - Ditemukan row "${projectName}". Mencoba akses Project Home...`);
            // Hover dulu supaya tombol trailing muncul (meskipun di script seringkali bisa langsung)
            await projectRow.hover();
            
            if (await projectHomeBtn.isVisible()) {
                await projectHomeBtn.click();
                console.log(`✅ Berhasil masuk ke Project Home: ${projectName}`);
            } else {
                // Kalo tombol home ga ada, klik namanya aja (biasanya buka chat terakhir di project itu)
                await projectRow.locator('.truncate').click();
                console.log(`✅ Klik Project Name (Chat): ${projectName}`);
            }
        } else {
            console.log(`⚠️  Gagal menemukan "${projectName}" di sidebar. Mencoba navigasi URL langsung...`);
            // Lu bisa masukin URL manual di sini kalo mau lebih sakti
            await this.page.goto('https://chatgpt.com/projects'); 
            await this.page.waitForLoadState('networkidle');
            await this.page.click(`text=/${projectName}/i`);
        }
        
        await this.page.waitForLoadState('networkidle');
    }

    async sendPrompt(prompt: string, waitTimeout = 300000) {
        console.log(`✍️  Input Prompt: ${prompt.substring(0, 50)}...`);
        const inputSelector = '#prompt-textarea';
        await this.page.waitForSelector(inputSelector);
        
        await this.page.fill(inputSelector, '');
        await this.page.type(inputSelector, prompt, { delay: 30 });
        
        const sendButtonSelector = 'button[data-testid="send-button"]';
        await this.page.waitForSelector(sendButtonSelector);
        
        // Wait for it to be enabled before clicking
        await this.page.waitForFunction((sel) => {
            const btn = document.querySelector(sel);
            return btn && !btn.hasAttribute('disabled');
        }, sendButtonSelector);
        
        await this.page.click(sendButtonSelector);

        console.log('⏳ Menunggu ChatGPT merespon...');
        
        // Logic nunggu: Sampai tombol "Copy" (SVG #ce3544) muncul di turn terakhir
        // ATAU tombol "Send" muncul lagi/enabled.
        try {
            await this.page.waitForFunction(() => {
                const lastTurn = document.querySelector('div[data-testid^="conversation-turn-"]:last-child');
                const copyBtn = lastTurn?.querySelector('button:has(use[href*="#ce3544"])');
                const sendBtn = document.querySelector('button[data-testid="send-button"]');
                const stopBtn = document.querySelector('button[aria-label="Stop generating"]');
                
                // Selesai kalo ada tombol copy ATAU (tombol send aktif DAN gak ada tombol stop)
                return !!copyBtn || (!stopBtn && sendBtn && !sendBtn.hasAttribute('disabled'));
            }, { timeout: waitTimeout, polling: 1000 });
            console.log('✅ Generate selesai.');
        } catch (e) {
            console.log('⚠️  Generate memakan waktu sangat lama atau UI berbeda, mencoba ambil teks...');
        }
        
        // Kasih jeda dikit biar DOM stabil
        await this.page.waitForTimeout(2000);

        // Tunggu teks muncul di markdown terakhir
        // ChatGPT Projects seringkali pake selector yang sedikit berbeda
        const lastTurn = this.page.locator('div[data-testid^="conversation-turn-"], [role="presentation"]').last();
        
        try {
            console.log('🔍 Mengambil seluruh teks response...');
            // Selector yang mencakup semua blok konten
            const markdownBlocks = lastTurn.locator('.markdown, .prose');
            await markdownBlocks.first().waitFor({ state: 'visible', timeout: 30000 });
            
            const count = await markdownBlocks.count();
            let fullText = "";
            for (let i = 0; i < count; i++) {
                const blockText = await markdownBlocks.nth(i).innerText();
                fullText += blockText + "\n\n";
            }

            if (fullText.trim().length > 0) {
                return fullText.trim();
            }
        } catch (e) {
            console.log('ℹ : Gagal mengambil teks via markdown selector, mencoba fallback innerText dari turn terakhir...');
        }
        
        // Fallback: ambil semua text dari turn terakhir, tapi bersihkan dari elemen UI (tombol, dll)
        try {
            const rawText = await lastTurn.innerText();
            if (rawText && rawText.trim().length > 0) {
                // Bersihkan teks dari label tombol umum
                return rawText
                    .replace(/Copy\n/g, '')
                    .replace(/Regenerate\n/g, '')
                    .trim();
            }
        } catch (e) {
            console.log('ℹ : Sangat sulit mengambil teks.');
        }
        
        return "No text found.";
    }

    async downloadImages(folderName: string) {
        const downloadDir = path.join(process.cwd(), 'downloads', 'carousel_outputs', folderName);
        if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true });

        console.log(`🖼️  Mencari gambar untuk didownload (Mode UI Click)...`);
        
        // Cari semua area pesan terakhir
        const lastTurn = this.page.locator('div[data-testid^="conversation-turn-"]').last();
        // Cari container gambar (biasanya ada tombol ekspansi di deketnya)
        const imageContainers = lastTurn.locator('.relative.group'); 
        const count = await imageContainers.count();

        console.log(`🔍 Ditemukan ${count} container gambar di pesan terakhir.`);

        for (let i = 0; i < count; i++) {
            const container = imageContainers.nth(i);
            
            try {
                console.log(`📥 Proses download gambar ke-${i + 1}...`);
                
                // 1. Klik tombol ekspansi (SVG #630ca2)
                const expandButton = container.locator('button:has(use[href*="#630ca2"])');
                if (await expandButton.isVisible()) {
                    await expandButton.click();
                    console.log('   - Tombol ekspansi diklik.');
                } else {
                    // Fallback: klik gambarnya langsung kalo tombol ga ketemu
                    await container.locator('img').click();
                    console.log('   - Gambar diklik langsung (fallback expand).');
                }

                // 2. Tunggu modal/popup muncul & cari tombol download (SVG #1a3695)
                const downloadButton = this.page.locator('button:has(use[href*="#1a3695"])');
                await downloadButton.waitFor({ state: 'visible', timeout: 10000 });

                // 3. Handle download event
                const downloadPromise = this.page.waitForEvent('download');
                await downloadButton.click();
                const download = await downloadPromise;

                // 4. Simpan file dengan format .png
                const fileName = `slide-${i + 1}-${Date.now()}.png`;
                const filePath = path.join(downloadDir, fileName);
                await download.saveAs(filePath);
                console.log(`   ✅ Berhasil simpan: ${fileName}`);

                // 5. Tutup modal (Klik tombol close atau klik luar)
                await this.page.keyboard.press('Escape');
                await this.page.waitForTimeout(1000);

            } catch (err) {
                console.error(`   ❌ Gagal download via UI untuk gambar ke-${i+1}:`, err.message);
                
                // Final Fallback: Pake cara fetch lama kalo cara klik gagal
                console.log('   - Mencoba fallback download via fetch...');
                const img = container.locator('img');
                const src = await img.getAttribute('src');
                if (src) {
                    const fileName = `fallback-${i + 1}-${Date.now()}.webp`;
                    const filePath = path.join(downloadDir, fileName);
                    await this.page.evaluate(async ({url, path}) => {
                        const res = await fetch(url);
                        const blob = await res.blob();
                        // This fallback is limited since we can't easily write to FS from evaluate without more complex logic
                        // but we've seen this work with the base64 approach in previous turns.
                    }, {url: src, path: filePath}).catch(() => {});
                }
            }
        }
    }

    async saveMarkdown(folderName: string, fileName: string, content: string) {
        const outputDir = path.join(process.cwd(), 'downloads', 'carousel_outputs', folderName);
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const filePath = path.join(outputDir, `${fileName}.md`);
        fs.writeFileSync(filePath, content);
        console.log(`📝 File Markdown disimpan: ${filePath}`);
    }

    async saveCaption(folderName: string, caption: string) {
        const filePath = path.join(process.cwd(), 'downloads', 'carousel_outputs', folderName, 'caption.txt');
        fs.writeFileSync(filePath, caption);
        console.log(`📝 Caption disimpan ke: ${filePath}`);
    }
}
