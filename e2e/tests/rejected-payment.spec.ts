import { expect, test } from '@playwright/test';
import { fillValidCoStep1Form } from './co-step1-form';

// Per specs/US-03-summary-payment.md's "Phase 10 correction" resolution, the UI exposes a
// second, clearly-labeled "Simulate a declined payment" control next to Pay, making the
// Gherkin "Rejected payment" scenario directly exercisable through real UI interaction
// (superseding the earlier "mock it at the test level only" decision).
test.describe('Colombia — rejected payment (US-03)', () => {
  test('shows a clear error, returns to a retryable state, and keeps all entered data', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Colombia' }).click();
    await fillValidCoStep1Form(page);
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('radiogroup', { name: 'Available plans' }).getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByLabel('I have read and accept the terms and conditions').check();

    const declineButton = page.getByRole('button', { name: 'Simulate a declined payment' });
    await expect(declineButton).toBeEnabled();
    await declineButton.click();

    const errorAlert = page.getByRole('alert').filter({ hasText: 'Your information has been preserved' });
    await expect(errorAlert).toBeVisible();

    const payButton = page.getByRole('button', { name: 'Pay', exact: true });
    await expect(payButton).toBeEnabled();
    await expect(declineButton).toBeEnabled();

    // Previously entered data must still be there — going back to step 1 shows it untouched.
    await page.getByRole('link', { name: 'Edit data' }).click();
    await expect(page).toHaveURL(/\/quote\/form$/);
    await expect(page.getByLabel('Nombre completo')).toHaveValue('Juan Pérez');
    await expect(page.getByLabel('Número de documento')).toHaveValue('1012345678');
  });
});
