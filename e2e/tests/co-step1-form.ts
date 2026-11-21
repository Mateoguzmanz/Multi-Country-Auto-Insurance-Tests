import type { Page } from '@playwright/test';

export interface Step1Overrides {
  dateOfBirth?: string;
}

/**
 * Fills Colombia's step-1 form with values that satisfy every configured validation
 * (specs/US-01-policyholder-vehicle-form.md, apps/cms/src/seed/form-fields.ts). The
 * vehicle year is derived from the current year so the test keeps passing the
 * configured min/max window without needing updates every year.
 */
export async function fillValidCoStep1Form(page: Page, overrides: Step1Overrides = {}): Promise<void> {
  const vehicleYear = String(new Date().getFullYear() - 2);

  await page.getByLabel('Nombre completo').fill('Juan Pérez');
  await page.getByLabel('Tipo de documento').selectOption('CC');
  await page.getByLabel('Número de documento').fill('1012345678');
  await page.getByLabel('Fecha de nacimiento').fill(overrides.dateOfBirth ?? '1990-05-20');
  await page.getByLabel('Correo electrónico').fill('juan.perez@example.com');
  await page.getByLabel('Teléfono de contacto').fill('3001234567');
  await page.getByLabel('Marca del vehículo').selectOption('toyota');
  await page.getByLabel('Modelo del vehículo').fill('Corolla');
  await page.getByLabel('Año del vehículo').fill(vehicleYear);
  await page.getByLabel('Placa').fill('ABC123');
  await page.getByLabel('Uso del vehículo').selectOption('personal');
}
