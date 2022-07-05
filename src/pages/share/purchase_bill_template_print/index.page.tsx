/**
 * @description: 采购分享
 */

import { GetPurchaseOrderSharedData } from 'gm_api/src/purchase'
import { useSharePrint } from '@/common/hooks'
import purchaseBill from './config/data_to_key'

const PurchaseBillTemplatePrint = () => {
  useSharePrint(getPurchaseData)

  function getPurchaseData(token: string) {
    return GetPurchaseOrderSharedData({
      token,
    }).then(({ response }) => {
      const { purchase_sheet, template, ...rest } = response
      return [
        {
          data: purchaseBill(purchase_sheet!, rest),
          config: JSON.parse(template?.attrs?.layout || ''),
        },
      ]
    })
  }

  return null
}

export default PurchaseBillTemplatePrint
