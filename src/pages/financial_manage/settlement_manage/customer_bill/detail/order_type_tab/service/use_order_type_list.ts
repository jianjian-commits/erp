import { ListCustomizeType } from 'gm_api/src/order'
import _ from 'lodash'
import { useEffect, useState } from 'react'

export interface OrderTypeList {
  /** 类型id */
  id: string
  /** 类型名称 */
  name?: string
  /** 企业id */
  groupId?: string
}

/**
 * 获取用户定义的“订单类型”
 */
function useOrderTypeList() {
  const [list, setList] = useState<OrderTypeList[]>()

  useEffect(() => {
    let isDiscarded = false

    ListCustomizeType().then(({ response }) => {
      if (isDiscarded) {
        return
      }
      const result = _.map(
        response.customize_types,
        (item): OrderTypeList | undefined => {
          if (item.delete_time !== '0') {
            return undefined
          }
          return {
            name: item.name,
            id: item.customize_type_id,
            groupId: item.group_id,
          }
        },
      ).filter((item): item is OrderTypeList => !_.isNil(item))
      setList(result)
    })

    return () => {
      isDiscarded = true
    }
  }, [])

  return {
    list,
    // isEmpty: Array.isArray(list) && _.isEmpty(list)
  }
}

export default useOrderTypeList
