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

  await page.getByLabel('Nombre completo').fill('María González');
  await page.getByLabel('Tipo de documento').selectOption('RUT');
  await page.getByLabel('Número de documento').fill('12345678-5');
  await page.getByLabel('Fecha de nacimiento').fill(overrides.dateOfBirth ?? '1990-05-20');
  await page.getByLabel('Correo electrónico').fill('maria.gonzalez@example.com');
  await page.getByLabel('Teléfono de contacto').fill('912345678');
  await page.getByLabel('Marca del vehículo').selectOption('toyota');
  await page.getByLabel('Modelo del vehículo').fill('Corolla');
  await page.getByLabel('Año del vehículo').fill(vehicleYear);
  await page.getByLabel('Patente').fill('AB1234');
  await page.getByLabel('Uso del vehículo').selectOption('personal');
}
