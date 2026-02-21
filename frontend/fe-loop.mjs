#!/usr/bin/env node
/**
 * Frontend Interactive Loop Tool
 *
 * This tool enables Claude to truly "see" and "operate" the frontend
 * by combining Playwright automation with screenshot analysis.
 *
 * Usage:
 *   cd /Users/macmini/Project/taipower-tou-web/frontend && node fe-loop.mjs [command]
 *
 * Examples:
 *   node fe-loop.mjs homepage         # Capture homepage
 *   node fe-loop.mjs manual           # Click 手動輸入 and capture result
 *   node fe-loop.mjs full             # Run complete test flow
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const CONFIG = {
  FRONTEND_URL: 'http://localhost:5173/taipower-tou-web/',
  SCREENSHOT_DIR: '/tmp/fe-loop',
  VIEWPORT: { width: 1920, height: 1080 }
};

// State file for persistent browser session
const STATE_FILE = '/tmp/fe-loop-state.json';

class FrontendLoop {
  constructor() {
    this.browser = null;
    this.page = null;
    this.screenshotCounter = 0;
  }

  async init() {
    if (!existsSync(CONFIG.SCREENSHOT_DIR)) {
      mkdirSync(CONFIG.SCREENSHOT_DIR, { recursive: true });
    }

    this.browser = await chromium.launch({
      headless: false,
      slowMo: 100 // Slow down for better visibility
    });

    this.page = await this.browser.newPage({
      viewport: CONFIG.VIEWPORT
    });

    console.log('🚀 Frontend Loop Started');
    console.log('📍 URL:', CONFIG.FRONTEND_URL);
  }

  async goto(url = CONFIG.FRONTEND_URL) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
    return this.screenshot('navigate');
  }

  async click(selector) {
    await this.page.click(selector);
    await this.page.waitForTimeout(1000);
    return this.screenshot('click-' + selector.replace(/[^a-zA-Z0-9]/g, '-'));
  }

  async fill(selector, value) {
    await this.page.fill(selector, value);
    await this.page.waitForTimeout(300);
    return this.screenshot('fill-' + selector.replace(/[^a-zA-Z0-9]/g, '-'));
  }

  async selectOption(selector, value) {
    await this.page.selectOption(selector, value);
    await this.page.waitForTimeout(300);
    return this.screenshot('select-' + selector.replace(/[^a-zA-Z0-9]/g, '-'));
  }

  async screenshot(label = 'capture') {
    this.screenshotCounter++;
    const filename = `${CONFIG.SCREENSHOT_DIR}/${label}-${this.screenshotCounter}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    console.log('📸', filename);

    // Return analysis data
    const data = await this.page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        buttons: Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()),
        inputs: document.querySelectorAll('input, select, textarea').length,
        visibleText: document.body.textContent.substring(0, 500)
      };
    });

    return { filename, ...data };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('✅ Frontend Loop Closed');
    }
  }
}

// CLI Interface
const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  const loop = new FrontendLoop();

  try {
    await loop.init();

    switch (command) {
      case 'homepage':
      case 'home':
        await loop.goto();
        break;

      case 'manual':
        await loop.goto();
        await loop.click('button:has-text("手動輸入")');
        break;

      case 'fill-form':
        await loop.goto();
        await loop.click('button:has-text("手動輸入")');
        const selects = await loop.page.$$('select');
        if (selects.length >= 4) {
          await selects[0].selectOption('2025');
          await selects[1].selectOption('7');
          await selects[2].selectOption('10');
          await selects[3].selectOption('110');
        }
        await loop.fill('input[type="number"]', '500');
        await loop.screenshot('form-filled');
        break;

      case 'submit':
        await loop.goto();
        await loop.click('button:has-text("手動輸入")');
        await loop.page.waitForTimeout(1000);
        const sels = await loop.page.$$('select');
        if (sels.length >= 4) {
          await sels[0].selectOption('2025');
          await sels[1].selectOption('7');
          await sels[2].selectOption('10');
          await sels[3].selectOption('110');
        }
        await loop.fill('input[type="number"]', '500');
        await loop.click('button:has-text("開始比較")');
        await loop.screenshot('after-submit');
        break;

      case 'full':
        await loop.goto();
        await loop.click('button:has-text("手動輸入")');
        await loop.page.waitForTimeout(1000);
        const sel = await loop.page.$$('select');
        if (sel.length >= 4) {
          await sel[0].selectOption('2025');
          await sel[1].selectOption('7');
          await sel[2].selectOption('10');
          await sel[3].selectOption('110');
        }
        await loop.fill('input[type="number"]', '500');
        await loop.click('button:has-text("開始比較")');
        await loop.page.waitForTimeout(3000);
        await loop.screenshot('habit-selection');
        await loop.click('button:has-text("使用此估算結果")');
        await loop.page.waitForTimeout(3000);
        await loop.screenshot('final-result');
        break;

      case 'help':
        console.log(`
Frontend Interactive Loop Tool

Commands:
  homepage    - Capture homepage
  manual      - Click 手動輸入 and capture
  fill-form   - Fill the form with test data
  submit      - Submit form and show result
  full        - Run complete test flow

Example:
  node fe-loop.mjs homepage
        `);
        break;

      default:
        console.log('Unknown command:', command);
        console.log('Use "help" for available commands');
    }

    await loop.page.waitForTimeout(3000);
    await loop.close();

  } catch (error) {
    console.error('❌ Error:', error.message);
    await loop.close();
    process.exit(1);
  }
}

main();
