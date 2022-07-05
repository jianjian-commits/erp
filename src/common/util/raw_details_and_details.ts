import { PurchaseSheet_SheetDetails_SheetDetail } from 'gm_api/src/purchase'
/**
 * @description:单据中raw_details和details相关
 * @description: raw_details是汇总有raw_detail就用raw_details
 * @description: 可能需要根据判断来获取到最后的明细 判断依据
 */

export function mapDetailsFromRawDetailId(
  raw_detail: PurchaseSheet_SheetDetails_SheetDetail,
  details: PurchaseSheet_SheetDetails_SheetDetail[] = [],
) {
  return details.filter((detail) => {
    return (
      raw_detail.detail_id !== '0' &&
      detail.raw_detail_id === raw_detail.detail_id
    )
  })
}
