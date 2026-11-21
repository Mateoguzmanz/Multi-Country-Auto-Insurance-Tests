import type { Schema, Struct } from '@strapi/strapi';

export interface SharedPlanDetailItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_plan_detail_items';
  info: {
    description: 'A single coverage or benefit entry shared by the plan content-type';
    displayName: 'Plan Detail Item';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.plan-detail-item': SharedPlanDetailItem;
    }
  }
}
