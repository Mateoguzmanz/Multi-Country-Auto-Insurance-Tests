import { expect, test } from '@playwright/test';
import { fillValidCoStep1Form } from './co-step1-form';

test.describe('Colombia — invalid-field scenario (US-01)', () => {
  test('shows the configured error message and blocks advancing to the plans step', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Colombia', exact: true }).click();
    await expect(page).toHaveURL(/\/quote\/form$/);

    // Everything else is valid except an under-age date of birth.
    await fillValidCoStep1Form(page, { dateOfBirth: '2018-01-01' });

    const dateOfBirthField = page.getByLabel('Date of birth');
    await dateOfBirthField.blur();

    await expect(page.getByRole('alert').filter({ hasText: 'You must be of legal age (18 years) to continue.' })).toBeVisible();

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    // The wizard must not advance while the field remains invalid.
    await expect(page).toHaveURL(/\/quote\/form$/);
  });
});
