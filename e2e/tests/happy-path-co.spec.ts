import { expect, test } from '@playwright/test';
import { fillValidCoStep1Form } from './co-step1-form';

const RAW_DOCUMENT_NUMBER = '1012345678';
const MASKED_DOCUMENT_NUMBER = '10••••••78';

test.describe('Colombia — full happy-path wizard flow', () => {
  test('quotes, pays and confirms, and does not resurrect a payable summary afterward', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Colombia', exact: true }).click();

    // US-01 — fill a fully valid step-1 form.
    await expect(page).toHaveURL(/\/quote\/form$/);
    await fillValidCoStep1Form(page);
    await page.getByRole('button', { name: 'Continue' }).click();

    // US-02 — pick a plan.
    await expect(page).toHaveURL(/\/quote\/plans$/);
    const planRadios = page.getByRole('radiogroup', { name: 'Available plans' }).getByRole('radio');
    await expect(planRadios.first()).toBeVisible();
    await planRadios.first().check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // US-03 — summary: document number is visible but masked, never in full.
    await expect(page).toHaveURL(/\/quote\/summary$/);
    const documentRow = page.locator('dd', { hasText: MASKED_DOCUMENT_NUMBER });
    await expect(documentRow).toBeVisible();
    const summaryText = await page.locator('.quote-summary-page').innerText();
    expect(summaryText).not.toContain(RAW_DOCUMENT_NUMBER);

    // Terms must be accepted before Pay is enabled.
    const payButton = page.getByRole('button', { name: 'Pay', exact: true });
    await expect(payButton).toBeDisabled();
    await page.getByLabel('I have read and accept the terms and conditions').check();
    await expect(payButton).toBeEnabled();

    // Successful payment: button locks while processing, then shows the confirmation.
    await payButton.click();
    await expect(page.getByRole('button', { name: 'Processing…' })).toBeDisabled();

    const confirmationHeading = page.getByRole('heading', { name: 'Payment approved' });
    await expect(confirmationHeading).toBeVisible();
    const quoteNumberText = await page.locator('.quote-summary-page__confirmation').innerText();
    expect(quoteNumberText).toMatch(/CO-\d{10}/);

    // Navigating back (and forward again) must not resurrect a payable summary.
    await page.goBack();
    await expect(page).toHaveURL(/\/quote\/plans$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/quote\/summary$/);
    await expect(confirmationHeading).toBeVisible();
    await expect(page.getByRole('button', { name: 'Pay', exact: true })).not.toBeVisible();
  });
});
