import type { Core } from '@strapi/strapi';

const READ_ONLY_CONTENT_TYPES = ['form-field', 'plan', 'terms-and-condition'];
const READ_ACTIONS = ['find', 'findOne'];

export async function grantPublicReadPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });

  if (!publicRole) {
    return;
  }

  for (const contentType of READ_ONLY_CONTENT_TYPES) {
    for (const action of READ_ACTIONS) {
      const actionId = `api::${contentType}.${contentType}.${action}`;

      const existing = await strapi.db
        .query('plugin::users-permissions.permission')
        .findOne({ where: { action: actionId, role: publicRole.id } });

      if (!existing) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: { action: actionId, role: publicRole.id },
        });
      }
    }
  }
}
