import { childType } from '@/pages/delivery/components/order_print_modal_new/enum'
import {
  PrintOrderListData,
  PrintOrderListType,
  PrintOrderDataType,
} from '@/pages/system/template/print_template/types'
import { Application } from 'gm_api/src/preference'
import _ from 'lodash'
import { groupByType } from './enum'

/** 配送 根据打印类型进行打印 */
/** 配送三种类型单据来源三个数据处理方法,添加新的childTypeValue时需要在对应的数据处理下对应字段 */
export const splitOrderData = ({
  item,
  template,
  targetAppObj,
  showRise,
  childTypeValue,
  formatOrder,
}: {
  item: PrintOrderDataType
  template: any
  showRise: string
  childTypeValue: childType
  formatOrder: (item: PrintOrderDataType, key?: string) => PrintOrderListData
  targetAppObj?: Application
}): PrintOrderListType[] => {
  const order = _.groupBy(item.details, (v) => v[groupByType[childTypeValue]])
  const orderLength = Object.keys(order).length
  let num = 0
  return _.map(order, (v, key) => {
    const cloneTemplate = _.cloneDeep(template)
    if (JSON.parse(showRise)) {
      num++
      const riseTitle = _.remove(cloneTemplate.header.blocks, { type: 'rise' })
      cloneTemplate.header.blocks = [
        ..._.toArray(cloneTemplate.header.blocks),
        ..._.map(riseTitle, (v) => ({
          ...v,
          text: `${v.text}(${num}/${orderLength} -${key})`,
        })),
      ]
    }
    return {
      config: cloneTemplate,
      data: formatOrder({ ...item, details: v }, targetAppObj?.key),
    }
  })
}
