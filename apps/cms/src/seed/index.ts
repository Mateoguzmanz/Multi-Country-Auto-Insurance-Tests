import type { Core } from '@strapi/strapi';

import { grantPublicReadPermissions } from './permissions';
import { FORM_FIELD_SEEDS } from './form-fields';
import { PLAN_SEEDS } from './plans';
import { TERMS_SEEDS } from './terms';

async function seedIfEmpty<T extends Record<string, unknown>>(
  strapi: Core.Strapi,
  uid: 'api::form-field.form-field' | 'api::plan.plan' | 'api::terms-and-condition.terms-and-condition',
  seeds: T[]
) {
  const count = await strapi.db.query(uid).count();

  if (count > 0) {
    return;
  }

  for (const data of seeds) {
    await strapi.documents(uid).create({ data, status: 'published' });
  }
}

export async function runBootstrapSeed(strapi: Core.Strapi) {
  await grantPublicReadPermissions(strapi);

  await seedIfEmpty(strapi, 'api::form-field.form-field', FORM_FIELD_SEEDS);
  await seedIfEmpty(strapi, 'api::plan.plan', PLAN_SEEDS);
  await seedIfEmpty(strapi, 'api::terms-and-condition.terms-and-condition', TERMS_SEEDS);
}
