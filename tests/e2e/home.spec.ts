import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the title or a key branding element is visible
    // Based on previous context, this is "PolisayAI"
    await expect(page).toHaveTitle(/PolisayAI/i);
    
    // Check for a key heading or button
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });
});
