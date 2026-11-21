import type { Core } from '@strapi/strapi';

import { grantPublicReadPermissions } from './permissions';
import { FORM_FIELD_SEEDS } from './form-fields';
import { PLAN_SEEDS } from './plans';
import { TERMS_SEEDS } from './terms';

async function seedFormFieldsIfEmpty(strapi: Core.Strapi) {
  const count = await strapi.db.query('api::form-field.form-field').count();
  if (count > 0) {
    return;
  }

  for (const data of FORM_FIELD_SEEDS) {
    await strapi.documents('api::form-field.form-field').create({ data, status: 'published' });
  }
}

async function seedPlansIfEmpty(strapi: Core.Strapi) {
  const count = await strapi.db.query('api::plan.plan').count();
  if (count > 0) {
    return;
  }

  for (const data of PLAN_SEEDS) {
    await strapi.documents('api::plan.plan').create({ data, status: 'published' });
  }
}

async function seedTermsIfEmpty(strapi: Core.Strapi) {
  const count = await strapi.db.query('api::terms-and-condition.terms-and-condition').count();
  if (count > 0) {
    return;
  }

  for (const data of TERMS_SEEDS) {
    await strapi
      .documents('api::terms-and-condition.terms-and-condition')
      .create({ data, status: 'published' });
  }
}

export async function runBootstrapSeed(strapi: Core.Strapi) {
  await grantPublicReadPermissions(strapi);

  await seedFormFieldsIfEmpty(strapi);
  await seedPlansIfEmpty(strapi);
  await seedTermsIfEmpty(strapi);
}
