import type { Page } from '@playwright/test';

export interface Step1Overrides {
  dateOfBirth?: string;
}

/**
 * Fills Chile's step-1 form with values that satisfy every configured validation
 * (specs/US-01-policyholder-vehicle-form.md, apps/cms/src/seed/form-fields.ts), choosing
 * RUT as the document type. The vehicle year is derived from the current year so the test
 * keeps passing the configured min/max window without needing updates every year.
 */
export async function fillValidClStep1Form(page: Page, overrides: Step1Overrides = {}): Promise<void> {
  const vehicleYear = String(new Date().getFullYear() - 2);

  await page.getByLabel('Full name').fill('María González');
  await page.getByLabel('Document type').selectOption('RUT');
  await page.getByLabel('Document number').fill('12345678-5');
  await page.getByLabel('Date of birth').fill(overrides.dateOfBirth ?? '1990-05-20');
  await page.getByLabel('Email').fill('maria.gonzalez@example.com');
  await page.getByLabel('Contact phone').fill('912345678');
  await page.getByLabel('Vehicle make').selectOption('toyota');
  await page.getByLabel('Vehicle model').fill('Corolla');
  await page.getByLabel('Vehicle year').fill(vehicleYear);
  await page.getByLabel('License plate').fill('AB1234');
  await page.getByLabel('Vehicle usage').selectOption('personal');
}
