import {
  OrderImportTemplete_Type,
  map_OrderImportTemplete_Type,
} from 'gm_api/src/orderlogic'

export const ORDER_IMPORT_TYPE = [
  {
    value: OrderImportTemplete_Type.TYPE_SYSTEM,
    text: map_OrderImportTemplete_Type[OrderImportTemplete_Type.TYPE_SYSTEM],
  },
  {
    value: OrderImportTemplete_Type.TYPE_CUSTOMIZE,
    text: map_OrderImportTemplete_Type[OrderImportTemplete_Type.TYPE_CUSTOMIZE],
  },
]
