import orderTypeHandler from './order_type_handler'
import ordersHandler from './orders_handler'
import productHandler from './product_handler'
import skusHandler from './skus_handler'

import { TABLE_TYPE } from '../table_type'

const tableTypeHandler = {
  [TABLE_TYPE.ORDERS]: ordersHandler,
  [TABLE_TYPE.ORDER_TYPE]: orderTypeHandler,
  [TABLE_TYPE.PRODUCT]: productHandler,
  [TABLE_TYPE.SKUS]: skusHandler,
} as const

export default tableTypeHandler
