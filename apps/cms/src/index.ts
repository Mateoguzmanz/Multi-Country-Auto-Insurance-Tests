import type { Core } from '@strapi/strapi';

import { runBootstrapSeed } from './seed';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await runBootstrapSeed(strapi);
  },
};
