import { expect, test } from '@playwright/test';
import { fillValidClStep1Form } from './cl-step1-form';

const RAW_RUT = '12345678-5';
const MASKED_RUT = '12.•••.•••-5';

test.describe('Chile — full happy-path wizard flow', () => {
  test('validates documentNumber conditionally on documentType, then quotes, pays and confirms', async ({
    page,
  }) => {
    await page.goto('/');
    // The app defaults to Spanish; this suite asserts the English app-chrome strings.
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('button', { name: 'Chile' }).click();

    // US-01 — fill a fully valid step-1 form (RUT as the document type).
    await expect(page).toHaveURL(/\/quote\/form$/);
    await fillValidClStep1Form(page);

    // Conditional validation (ADR-0002 follow-up): documentNumber's pattern depends on the
    // currently selected documentType, and must re-validate live without a reload.
    const documentNumberField = page.getByLabel('Número de documento');
    await documentNumberField.fill('AB123456');
    await documentNumberField.blur();
    await expect(page.getByRole('alert').filter({ hasText: 'Ingresa un RUT chileno válido.' })).toBeVisible();

    await page.getByLabel('Tipo de documento').selectOption('PASSPORT');
    await expect(page.getByRole('alert').filter({ hasText: 'Ingresa un RUT chileno válido.' })).not.toBeVisible();

    // Switch back to RUT with a valid value before continuing.
    await page.getByLabel('Tipo de documento').selectOption('RUT');
    await documentNumberField.fill(RAW_RUT);
    await documentNumberField.blur();

    await page.getByRole('button', { name: 'Continue' }).click();

    // US-02 — pick a plan.
    await expect(page).toHaveURL(/\/quote\/plans$/);
    const planRadios = page.getByRole('radiogroup', { name: 'Available plans' }).getByRole('radio');
    await expect(planRadios.first()).toBeVisible();
    await planRadios.first().check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // US-03 — summary: the RUT is visible but masked (grouped with its separators), never
    // in full, and the document type's label ("RUT") rather than the raw select value shows.
    await expect(page).toHaveURL(/\/quote\/summary$/);
    const documentRow = page.locator('dd', { hasText: MASKED_RUT });
    await expect(documentRow).toBeVisible();
    const summaryText = await page.locator('.quote-summary-page').innerText();
    expect(summaryText).not.toContain(RAW_RUT);

    await page.getByLabel('I have read and accept the terms and conditions').check();
    const payButton = page.getByRole('button', { name: 'Pay', exact: true });
    await payButton.click();

    const confirmationHeading = page.getByRole('heading', { name: 'Payment approved' });
    await expect(confirmationHeading).toBeVisible();
    const quoteNumberText = await page.locator('.quote-summary-page__confirmation').innerText();
    expect(quoteNumberText).toMatch(/CL-\d{10}/);
  });
});
