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
  await page.getByRole('button',{name:'Save Transaction',exact:true}).click();
  await expect(page.getByText('Monthly Expense',{exact:true}).locator('..').locator('p')).toContainText('250.00');
  await expect(page.getByRole('img',{name:"Pie chart of selected month's expense categories"})).toBeVisible();
  await page.getByRole('button',{name:'Income',exact:true}).click();
  await page.getByPlaceholder('0.00').fill('1000.00');
  await page.locator('input[type="date"]').fill('2026-11-09');
  await page.getByRole('button',{name:'Save Transaction',exact:true}).click();
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

test('transaction editing preserves scroll position and creation draft', async ({page}) => {
  const suffix = randomUUID().slice(0, 12);

  // Register an isolated test account.
  await page.goto('/');
  await page.getByRole('button', {
    name: 'New user? Register',
    exact: true,
  }).click();

  await page.getByPlaceholder('Your name').fill('QA Edit User');

  await page.getByPlaceholder('you@example.com')
    .fill(`edit-${suffix}@example.test`);

  await page.getByPlaceholder('Minimum 12 characters')
    .fill('QA-Secure-Password-123!');

  await page.getByRole('button', {
    name: 'Create Account',
  }).click();

  await expect(page.getByRole('button', {
    name: 'Logout',
  })).toBeVisible();

  // Create a transaction.
  await page.locator('input[type="month"]').fill('2026-11');
  await page.getByPlaceholder('0.00').fill('250.00');
  await page.locator('input[type="date"]').fill('2026-11-09');

  await page.getByPlaceholder('e.g. Lunch, Bus Fare')
    .fill('QA original transaction');

  await page.getByRole('button', {
    name: 'Save Transaction',
    exact: true,
  }).click();

  const row = page.getByRole('row').filter({
    hasText: 'QA original transaction',
  });

  await expect(row).toBeVisible();

  // Prepare an unfinished new transaction.
  await page.getByPlaceholder('0.00').fill('999.00');

  await page.getByPlaceholder('e.g. Lunch, Bus Fare')
    .fill('Unfinished transaction draft');

  // Scroll to the existing transaction.
  const editButton = row.getByTitle('Edit');

  await editButton.scrollIntoViewIfNeeded();

  const scrollBefore = await page.evaluate(() => window.scrollY);

  expect(scrollBefore).toBeGreaterThan(0);

  // Open the edit dialog.
  await editButton.click();

  const dialog = page.getByRole('dialog', {
    name: 'Edit Transaction',
  });

  await expect(dialog).toBeVisible();

  // Verify scroll preservation.
  await expect.poll(async () =>
    Math.abs(
      (await page.evaluate(() => window.scrollY)) - scrollBefore
    )
  ).toBeLessThanOrEqual(2);

  // Verify existing transaction details.
  await expect(dialog.getByLabel('Amount (BDT)'))
    .toHaveValue('250.00');

  await expect(dialog.getByLabel('Description'))
    .toHaveValue('QA original transaction');

  await expect(dialog.getByLabel('Date'))
    .toHaveValue('2026-11-09');

  // Modify and cancel.
  await dialog.getByLabel('Amount (BDT)').fill('500.00');

  await dialog.getByRole('button', {
    name: 'Cancel',
    exact: true,
  }).click();

  await expect(dialog).toHaveCount(0);

  await expect(row).toContainText('250.00');

  await expect.poll(async () =>
    Math.abs(
      (await page.evaluate(() => window.scrollY)) - scrollBefore
    )
  ).toBeLessThanOrEqual(2);

  // Reopen and verify Escape closes the dialog.
  await editButton.click();
  await expect(dialog).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  // Reopen and save an actual change.
  await editButton.click();

  await dialog.getByLabel('Amount (BDT)').fill('300.00');

  await dialog.getByLabel('Description')
    .fill('QA updated transaction');

  await dialog.getByRole('button', {
    name: 'Save Changes',
  }).click();

  await expect(dialog).toHaveCount(0);

  const updatedRow = page.getByRole('row').filter({
    hasText: 'QA updated transaction',
  });

  await expect(updatedRow).toContainText('300.00');

  // Verify the dashboard summary was refreshed.
  await expect(
    page.getByText('Monthly Expense', {exact: true})
      .locator('..')
      .locator('p')
  ).toContainText('300.00');

  // Verify the unfinished creation draft survived editing.
  await expect(page.getByPlaceholder('0.00'))
    .toHaveValue('999.00');

  await expect(page.getByPlaceholder('e.g. Lunch, Bus Fare'))
    .toHaveValue('Unfinished transaction draft');
});
