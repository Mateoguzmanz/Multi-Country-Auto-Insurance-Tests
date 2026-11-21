export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export type StrapiRecord<TAttributes> = TAttributes & {
  id: number;
  documentId: string;
};

export interface StrapiCollectionResponse<TAttributes> {
  data: StrapiRecord<TAttributes>[];
  meta: {
    pagination: StrapiPagination;
  };
}
