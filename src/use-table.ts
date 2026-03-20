import { ref, shallowRef, computed } from 'vue';
import type { Component, VNode, Ref, ShallowRef, ComputedRef } from 'vue';

export interface PaginationResult<T> {
  /**
   * Page number [页码]
   */
  page: number;
  /**
   * Page size [每页条数]
   */
  pageSize: number;
  /**
   * Total count [总数]
   */
  total: number;
  /**
   * List data [列表数据]
   */
  list: T[];
}

type GetApiData<ApiData, Pagination extends boolean> = Pagination extends true ? PaginationResult<ApiData> : ApiData[];

type Transform<ResponseData, ApiData, Pagination extends boolean> = (
  response: ResponseData
) => GetApiData<ApiData, Pagination>;

export type TableColumnCheckTitle = VNode | Component | string;

export type TableColumnCheck = {
  key: string;
  title: TableColumnCheckTitle;
  checked?: boolean;
  hidden?: boolean;
  fixed?: boolean | 'right';
};

export interface UseTableOptions<ResponseData, ApiData, Column, Pagination extends boolean> {
  /**
   * api function to get table data
   */
  api: () => Promise<ResponseData>;
  /**
   * whether to enable pagination
   */
  pagination?: Pagination;
  /**
   * transform api response to table data
   */
  transform: Transform<ResponseData, ApiData, Pagination>;
  /**
   * columns factory
   */
  columns: () => Column[];
  /**
   * get column checks
   */
  getColumnChecks: (columns: Column[]) => TableColumnCheck[];
  /**
   * get columns
   */
  getColumns: (columns: Column[], checks: TableColumnCheck[]) => Column[];
  /**
   * callback when response fetched
   */
  onFetched?: (data: GetApiData<ApiData, Pagination>) => void | Promise<void>;
  /**
   * whether to get data immediately
   *
   * @default true
   */
  immediate?: boolean;
}

export function useTable<ResponseData, ApiData, Column, Pagination extends boolean>(
  options: UseTableOptions<ResponseData, ApiData, Column, Pagination>
) {
  const loading: ShallowRef<boolean> = shallowRef(false);
  const empty: ShallowRef<boolean> = shallowRef(false);

  const { api, pagination, transform, columns, getColumnChecks, getColumns, onFetched, immediate = true } = options;

  const data = ref([]) as Ref<ApiData[]>;

  const columnChecks = ref(getColumnChecks(columns())) as Ref<TableColumnCheck[]>;

  const $columns: ComputedRef<Column[]> = computed(() => getColumns(columns(), columnChecks.value));

  function reloadColumns() {
    const checkMap = new Map<string, Pick<TableColumnCheck, 'checked' | 'fixed'>>();

    columnChecks.value.forEach(col => {
      const { key, checked, fixed } = col;

      checkMap.set(key, {
        checked,
        fixed
      });
    });

    const defaultChecks = getColumnChecks(columns());

    columnChecks.value = defaultChecks.map(col => {
      const { checked, fixed } = checkMap.get(col.key) || {};

      return {
        ...col,
        checked: checked ?? col.checked,
        fixed: fixed ?? col.fixed
      };
    });
  }

  async function getData() {
    try {
      loading.value = true;

      const response = await api();

      const transformed = transform(response);

      data.value = getTableData(transformed, pagination);

      empty.value = data.value.length === 0;

      await onFetched?.(transformed);
    } finally {
      loading.value = false;
    }
  }

  if (immediate) {
    getData();
  }

  return {
    loading,
    empty,
    data,
    columns: $columns,
    columnChecks,
    reloadColumns,
    getData
  };
}

function getTableData<ApiData, Pagination extends boolean>(
  data: GetApiData<ApiData, Pagination>,
  pagination?: Pagination
) {
  if (pagination) {
    return (data as PaginationResult<ApiData>).list;
  }

  return data as ApiData[];
}
