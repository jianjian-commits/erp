import { ImportSpecialBasicPriceData_ImportSpecialBasicPriceInfo } from 'gm_api/src/merchandise'
interface FilterOptions {
  search_text: string
  category_id: string
}

interface ErrorListProps
  extends ImportSpecialBasicPriceData_ImportSpecialBasicPriceInfo {
  unit_id_from_user: string
  copyName: string
}

enum CODE_ERROR {
  UNKNOWN_QUANTITY = '无法识别下单数',
  UNIT = '下单单位异常',
  MULTIPLE = '匹配到多个商品',
  NOT_SALE = '商品已下架',

  // 仅有两种异常情况
  NOT_FOUND = '未找到该商品',
  MULTIPLE_UNIT = '单位与商品库商品不一致，请更改',
}

export type { FilterOptions, ErrorListProps, CODE_ERROR }
