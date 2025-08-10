import { test, expect } from '@playwright/test';
import path from 'path';

const TEST_PAGE_PATH = path.resolve(__dirname, '../test.html');
const TEST_PAGE_URL = `file://${TEST_PAGE_PATH}`;

test.describe('UI Test Helper - test.html E2E', () => {
  
  test('should load test page', async ({ page }) => {
    // Navigate to the test HTML file
    await page.goto(TEST_PAGE_URL);
    
    // Verify page loads correctly
    await expect(page).toHaveTitle('UI Test Helper - Test Page');
    await expect(page.locator('h1')).toContainText('UI Test Helper - Test Page');
  });

  test('should interact with form elements', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Test form elements are present and functional
    await expect(page.locator('input#username')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    
    // Test interaction with username input
    await page.fill('input#username', 'testuser');
    await expect(page.locator('input#username')).toHaveValue('testuser');
    
    // Test interaction with email input
    await page.fill('input#email', 'test@example.com');
    await expect(page.locator('input#email')).toHaveValue('test@example.com');
  });

  test('should interact with buttons and show alert', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Test button is visible
    await expect(page.locator('button#test-btn')).toBeVisible();
    
    // Test button click (should show alert)
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Test button clicked!');
      await dialog.accept();
    });
    await page.click('button#test-btn');
  });

  test('should show and hide notification', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Test notification is initially hidden
    await expect(page.locator('#notification')).not.toBeVisible();
    
    // Test show notification button
    await expect(page.locator('[data-testid="show-notification"]')).toBeVisible();
    await page.click('[data-testid="show-notification"]');
    
    // Test notification appears
    await expect(page.locator('#notification')).toBeVisible();
    await expect(page.locator('#notification p')).toContainText('This is a notification message');
    
    // Test dismiss notification
    await page.click('#notification button');
    await expect(page.locator('#notification')).not.toBeVisible();
  });

  test('should handle elements with special characters', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Test input with special characters in placeholder
    const specialInput = page.locator('#special-chars');
    await expect(specialInput).toBeVisible();
    await expect(specialInput).toHaveAttribute('placeholder', 'Enter symbols: @#$%^&*()');
    
    // Test filling with special characters
    await specialInput.fill('Test @#$%^&*() symbols');
    await expect(specialInput).toHaveValue('Test @#$%^&*() symbols');
  });

  test('should handle button with very long text', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Test button with extremely long text
    const longTextBtn = page.locator('[data-testid="long-text-btn"]');
    await expect(longTextBtn).toBeVisible();
    
    const buttonText = await longTextBtn.textContent();
    expect(buttonText.length).toBeGreaterThan(100); // Verify it's actually long
    expect(buttonText).toContain('extremely long text content');
    
    // Test that it's still clickable
    await longTextBtn.click();
  });

  test('should handle hidden and dynamic elements', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Test that hidden element is initially not visible
    await expect(page.locator('#hidden-element')).not.toBeVisible();
    await expect(page.locator('[data-testid="hidden-btn"]')).not.toBeVisible();
    
    // Test toggle button exists
    const toggleBtn = page.locator('#toggle-hidden');
    await expect(toggleBtn).toBeVisible();
    
    // Click to show hidden element
    await toggleBtn.click();
    await expect(page.locator('#hidden-element')).toBeVisible();
    await expect(page.locator('[data-testid="hidden-btn"]')).toBeVisible();
    
    // Click to hide element again
    await toggleBtn.click();
    await expect(page.locator('#hidden-element')).not.toBeVisible();
  });

  test('should handle dynamic text changes', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Test dynamic text button
    const dynamicBtn = page.locator('#dynamic-text-btn');
    await expect(dynamicBtn).toBeVisible();
    
    // Initial state should be "Click me"
    await expect(dynamicBtn).toHaveText('Click me');
    
    // Click to change text
    await dynamicBtn.click();
    await expect(dynamicBtn).toHaveText('Clicked!');
    
    // Click again to revert
    await dynamicBtn.click();
    await expect(dynamicBtn).toHaveText('Click me');
  });

});