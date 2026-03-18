# @soybeanjs/hooks

Some useful hooks for Vue 3.

## Features

- **TypeScript** — Written in TypeScript with full type support
- **`useTable`** — A composable for managing table data, including pagination, column visibility, and async data fetching

## Installation

```bash
# npm
npm install @soybeanjs/hooks

# pnpm
pnpm add @soybeanjs/hooks

# yarn
yarn add @soybeanjs/hooks
```

> **Note:** Vue 3 is a peer dependency. Make sure it is installed in your project.

## Usage

### `useTable`

A composable for managing table data with support for pagination, column checks, and async fetching.

```ts
import { useTable } from '@soybeanjs/hooks';

const { loading, empty, data, columns, columnChecks, reloadColumns, getData } = useTable({
  api: fetchTableData,
  pagination: true,
  transform: response => response.data,
  columns: () => rawColumns,
  getColumnChecks: cols =>
    cols.map(col => ({
      key: col.key,
      title: col.title,
      checked: true,
      hidden: false,
      fixed: false
    })),
  getColumns: (cols, checks) =>
    cols.filter(col => {
      const check = checks.find(c => c.key === col.key);
      return check?.checked;
    })
});
```

## API

### `useTable(options)`

#### Options

| Property          | Type                                                                   | Default | Description                                     |
| ----------------- | ---------------------------------------------------------------------- | ------- | ----------------------------------------------- |
| `api`             | `() => Promise<ResponseData>`                                          | —       | API function to fetch table data                |
| `pagination`      | `boolean`                                                              | —       | Whether to enable pagination mode               |
| `transform`       | `(response: ResponseData) => ApiData[]` \| `PaginationResult<ApiData>` | —       | Transform API response to table data            |
| `columns`         | `() => Column[]`                                                       | —       | Factory function that returns raw column config |
| `getColumnChecks` | `(columns: Column[]) => TableColumnCheck[]`                            | —       | Derive column check state from columns          |
| `getColumns`      | `(columns: Column[], checks: TableColumnCheck[]) => Column[]`          | —       | Derive rendered columns from columns + checks   |
| `onFetched`       | `(data) => void \| Promise<void>`                                      | —       | Callback invoked after data is fetched          |
| `immediate`       | `boolean`                                                              | `true`  | Whether to fetch data immediately on mount      |

#### Returns

| Property        | Type                      | Description                                                  |
| --------------- | ------------------------- | ------------------------------------------------------------ |
| `loading`       | `ShallowRef<boolean>`     | Whether data is being fetched                                |
| `empty`         | `ShallowRef<boolean>`     | Whether the current data list is empty                       |
| `data`          | `Ref<ApiData[]>`          | Current table row data                                       |
| `columns`       | `ComputedRef<Column[]>`   | Columns derived from `getColumns` (reacts to `columnChecks`) |
| `columnChecks`  | `Ref<TableColumnCheck[]>` | Column visibility and pin state                              |
| `reloadColumns` | `() => void`              | Reset columns while preserving current check state           |
| `getData`       | `() => Promise<void>`     | Manually trigger a data fetch                                |

### Types

```ts
interface PaginationResult<T> {
  page: number;
  pageSize: number;
  total: number;
  list: T[];
}

type TableColumnCheck = {
  key: string;
  title: VNode | Component | string;
  checked: boolean;
  hidden: boolean;
  fixed: boolean | 'right';
};
```

## License

[MIT](./LICENSE) License © 2026-PRESENT [Soybean](https://github.com/soybeanjs)
