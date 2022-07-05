/*
 * @Description: 配送分享页
 */
import { ListSharedOrderData } from 'gm_api/src/orderlogic'
import { handleOrderPrinterData } from '@/pages/system/template/print_template/delivery_template/util'
import { useSharePrint } from '@/common/hooks'
import formatOrder from './config/data_to_key/order'

const DeliveryTemplatePrint = () => {
  useSharePrint(getBillData)

  function getBillData(token: string) {
    return ListSharedOrderData({
      token,
    }).then(({ response }) => {
      const { order_pairs = [] } = response

      const printOrderList = order_pairs.reduce((pre, currentOrderPair) => {
        const { template } = currentOrderPair
        const list = handleOrderPrinterData(currentOrderPair)
        const config = JSON.parse((template?.attrs?.layout as string) || '{}')

        pre = pre.concat(
          list.map((item) => ({
            config,
            data: formatOrder(item),
          })),
        )
        return pre
      }, [] as any)

      return printOrderList
    })
  }

  return null
}

export default DeliveryTemplatePrint
