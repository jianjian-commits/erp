import { CSSProperties } from 'react'
interface SelectSingleOptions {
  value: string
  text: string
  children?: SelectSingleOptions[]
}

interface SelectedOptions {
  category1_ids: SelectSingleOptions[]
  category2_ids: SelectSingleOptions[]
  pinlei_ids?: SelectSingleOptions[]
}

interface SelectedSingleOptions {
  category1: SelectSingleOptions
  category2: SelectSingleOptions
  pinlei: SelectSingleOptions
}

interface CategoryLevelSelectOptions {
  selected: string[]
  onChange: (value: string[]) => void
}

interface CategoryFilterOptions {
  disableCategory1?: boolean
  disableCategory2?: boolean
  disablePinLei?: boolean
  selected?: SelectedOptions
  onChange?: (value: SelectedOptions) => void
  style?: CSSProperties
}

interface CategoryFilterSingleOptions {
  disablePinLei?: boolean
  selected: SelectedSingleOptions
  onChange: (value: SelectedSingleOptions) => void
}

interface Category1Options {
  name: string
  parent_id: string
  text?: string
  value?: string
  category_id: string
  children?: Category2Options[]
}

interface SpuOptions {
  name: string
  parent_id: string
  spu_id: string
  text?: string
  value?: string
}

interface Category2Options {
  name: string
  parent_id: string
  text?: string
  value?: string
  category_id: string
  children?: SpuOptions[]
}

interface Category1MapOptions {
  [key: string]: Category1Options
}

interface Category2MapOptions {
  [key: string]: Category2Options
}

interface SpuMapOptions {
  [key: string]: SpuOptions
}

export type {
  CategoryLevelSelectOptions,
  CategoryFilterOptions,
  SelectedOptions,
  CategoryFilterSingleOptions,
  SelectSingleOptions,
  SelectedSingleOptions,
  Category1Options,
  Category1MapOptions,
  SpuOptions,
  SpuMapOptions,
  Category2Options,
  Category2MapOptions,
}
