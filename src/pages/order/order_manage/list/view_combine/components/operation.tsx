import React from 'react'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gm-pc/table-x'
import { observer } from 'mobx-react'
import store from '../store'
import { DeleteOrderDetail, Order_State } from 'gm_api/src/order'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
const { OperationDelete, OperationCell } = TableXUtil

const Operation = observer((props: { index: number }) => {
  const d = store.list[props.index]
  const { ...orderDetail } = d
  function handleReFetch() {
    store.doRequest()
  }

  function handleDelete() {
    DeleteOrderDetail({
      order_id: orderDetail.order_id,
      order_detail_id: orderDetail.order_detail_id,
    }).then(() => {
      handleReFetch()
      return null
    })
  }

  return (
    <>
      {+d?.status! & (1 << 12) ||
      +d.order!.state! === Order_State.STATE_RECEIVABLE ? (
        <OperationCell />
      ) : (
        <OperationCell>
          <OperationDelete
            disabled={
              !globalStore.hasPermission(
                Permission.PERMISSION_ORDER_UPDATE_ORDER,
              )
            }
            title={t('警告')}
            onClick={handleDelete}
          >
            {t('确认删除商品') + `${d.sku_name}？`}
          </OperationDelete>
        </OperationCell>
      )}
    </>
  )
})

export default Operation
