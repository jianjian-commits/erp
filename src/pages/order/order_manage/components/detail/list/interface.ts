import { Ssu, Sku, DetailListItem } from '../../interface'

export interface CellProps {
  index: number
  [key: string]: any
}

export interface CellPropsWidthOriginal {
  sku: DetailListItem
  index: number
  status?: string
}
