import { test, expect } from '@playwright/test';
import { ChatGPTPage } from '../src/pages/ChatGPTPage';

test.describe('ChatGPT Automation', () => {
  test('should be able to open ChatGPT', async ({ page }) => {
    const chatGPT = new ChatGPTPage(page);
    await chatGPT.goto();
    // Since we need login, this will likely hit the login page first
    // This is just a structure test
    await expect(page).toHaveTitle(/ChatGPT/);
  });
});
