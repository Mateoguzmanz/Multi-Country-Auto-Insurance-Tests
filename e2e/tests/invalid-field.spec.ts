import { expect, test } from '@playwright/test';
import { fillValidCoStep1Form } from './co-step1-form';

test.describe('Colombia — invalid-field scenario (US-01)', () => {
  test('shows the configured error message and blocks advancing to the plans step', async ({ page }) => {
    await page.goto('/');
    // The app defaults to Spanish; this suite asserts the English app-chrome strings.
    await page.getByRole('button', { name: 'English' }).click();
    await page.getByRole('button', { name: 'Colombia' }).click();
    await expect(page).toHaveURL(/\/quote\/form$/);

    // Everything else is valid except an under-age date of birth.
    await fillValidCoStep1Form(page, { dateOfBirth: '2018-01-01' });

    const dateOfBirthField = page.getByLabel('Fecha de nacimiento');
    await dateOfBirthField.blur();

    await expect(page.getByRole('alert').filter({ hasText: 'Debes ser mayor de edad (18 años) para continuar.' })).toBeVisible();

    const continueButton = page.getByRole('button', { name: 'Continue' });
    await expect(continueButton).toBeDisabled();

    // The wizard must not advance while the field remains invalid.
    await expect(page).toHaveURL(/\/quote\/form$/);
  });
});
