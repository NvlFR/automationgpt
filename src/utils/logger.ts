import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'logs', 'debug.log');

export function logToFile(message: string, data?: any) {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] ${message}\n`;
    if (data) {
        logMessage += `${JSON.stringify(data, null, 2)}\n`;
    }
    logMessage += '-'.repeat(50) + '\n';
    fs.appendFileSync(LOG_FILE, logMessage);
}

export async function dumpPage(page: any, name: string) {
    const content = await page.content();
    const filePath = path.join(process.cwd(), 'dumps', `${name}-${Date.now()}.html`);
    fs.writeFileSync(filePath, content);
    logToFile(`Page dump saved to: ${filePath}`);
}
