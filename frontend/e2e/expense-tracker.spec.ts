import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

test('registration -> transactions -> dashboard -> charts -> logout', async ({page}) => {
  const suffix=randomUUID().slice(0,12);
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Log in',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'New user? Register',exact:true}).click();
  await page.getByPlaceholder('Your name').fill('QA Browser User');
  await page.getByPlaceholder('you@example.com').fill(`browser-${suffix}@example.test`);
  await page.getByPlaceholder('Minimum 12 characters').fill('QA-Secure-Password-123!');
  await page.getByRole('button',{name:'Create Account'}).click();
  await expect(page.getByRole('button',{name:'Logout'})).toBeVisible();
  await page.locator('input[type="month"]').fill('2026-11');
  await page.getByPlaceholder('0.00').fill('250.00');
  await page.locator('input[type="date"]').fill('2026-11-09');
  await page.getByPlaceholder('e.g. Lunch, Bus Fare').fill('QA browser expense');
  await page.getByRole('button',{name:'Save Transaction'}).click();
  await expect(page.getByText('Monthly Expense',{exact:true}).locator('..').locator('p')).toContainText('250.00');
  await expect(page.getByRole('img',{name:"Pie chart of selected month's expense categories"})).toBeVisible();
  await page.getByRole('button',{name:'Income',exact:true}).click();
  await page.getByPlaceholder('0.00').fill('1000.00');
  await page.locator('input[type="date"]').fill('2026-11-09');
  await page.getByRole('button',{name:'Save Transaction'}).click();
  await expect(page.getByText('Monthly Balance',{exact:true}).locator('..').locator('p')).toContainText('750.00');
  await expect(page.getByText('Income vs Expense')).toBeVisible();
  await page.getByRole('button',{name:'Logout'}).click();
  await expect(page.getByRole('heading',{name:'Log in',exact:true})).toBeVisible();
  await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
  await expect(page.getByPlaceholder('Your name')).toHaveCount(0);
});

test('category management and narrow-screen access', async ({page, isMobile}) => {
  const suffix=randomUUID().slice(0,12);
  await page.goto('/');
  await page.getByRole('button',{name:'New user? Register',exact:true}).click();
  await page.getByPlaceholder('Your name').fill('QA Category User');
  await page.getByPlaceholder('you@example.com').fill(`category-${suffix}@example.test`);
  await page.getByPlaceholder('Minimum 12 characters').fill('QA-Secure-Password-123!');
  await page.getByRole('button',{name:'Create Account'}).click();
  await page.getByRole('button',{name:'Categories',exact:true}).click();
  await page.getByPlaceholder('e.g. Books').fill(`Office ${suffix}`);
  await page.getByRole('button',{name:'Create Category'}).click();
  await expect(page.getByText(`Office ${suffix}`)).toBeVisible();
  if(isMobile) {
    // Additional manual QA must check horizontal overflow for all pages and charts.
    await expect(page.getByRole('button',{name:'Dashboard',exact:true})).toBeVisible();
  }
});
