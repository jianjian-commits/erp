import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { KCMoreSelect } from '@gm-pc/keyboard'
import { Flex, Select } from '@gm-pc/react'
import { t } from 'gm-i18n'
import store, { PDetail } from '../../stores/receipt_store'

import { isInShareV2 } from '@/pages/sales_invoicing/util'
import { checkDigit } from '@/common/util'
import { MODULE_STATUS, MODULE_SELECT } from '@/pages/sales_invoicing/enum'

interface Props {
  data: PDetail
  index: number
}

const CustomerCell: FC<Props> = observer((props) => {
  const {
    target_customer_id,
    target_customer_name,
    target_route_id,
    target_route_name,
    sku_id,
    ssu_unit_id,
  } = props.data

  const [moduleType, setModuleType] = useState(MODULE_SELECT.customer)

  useEffect(() => {
    const type = target_route_name
      ? MODULE_SELECT.route
      : MODULE_SELECT.customer
    setModuleType(type)
    store.changeProductDetailsItem(props.index, {
      module: type,
    })
  }, [])

  const { apportionList, receiptDetail, customerList, routerList } = store

  const handleSelectChange = (select: number) => {
    store.changeProductDetailsItem(props.index, {
      module: select,
    })
    setModuleType(select)
  }
  const handleChange = (
    selected: MoreSelectDataItem<string>,
    type: 'customer' | 'route',
  ) => {
    if (type === 'customer') {
      store.changeProductDetailsItem(props.index, {
        target_customer_id: selected?.value,
        target_customer_name: selected?.text,
      })
      return
    }
    store.changeProductDetailsItem(props.index, {
      target_route_id: selected?.value,
      target_route_name: selected?.text,
    })
  }

  let customerSelected, routeSelect
  if (+target_customer_id! && target_customer_name) {
    customerSelected = { value: target_customer_id, text: target_customer_name }
  }
  if (+target_route_id! && target_route_name) {
    routeSelect = { value: target_route_id, text: target_route_name }
  }

  const canEdit =
    !isInShareV2(apportionList, sku_id) && !checkDigit(receiptDetail.status, 8)

  return (
    <>
      {!canEdit ? (
        target_customer_name || target_route_name
      ) : (
        <Flex>
          <Select
            className='gm-margin-right-5 b-select-width'
            data={MODULE_STATUS}
            value={moduleType}
            onChange={handleSelectChange}
          />
          {moduleType === MODULE_SELECT.customer && (
            <KCMoreSelect
              style={{ flex: 1 }}
              data={customerList.slice()}
              selected={customerSelected}
              onSelect={(select) => handleChange(select, 'customer')}
              placeholder={t('输入客户信息查找')}
            />
          )}
          {moduleType === MODULE_SELECT.route && (
            <KCMoreSelect
              style={{ flex: 1 }}
              data={routerList.slice()}
              selected={routeSelect}
              onSelect={(select) => handleChange(select, 'route')}
              placeholder={t('输入线路信息查找')}
            />
          )}
        </Flex>
      )}
    </>
  )
})

export default CustomerCell
