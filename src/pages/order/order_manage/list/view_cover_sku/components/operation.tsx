import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { TableXUtil } from '@gm-pc/table-x'
import { Popover, Tip } from '@gm-pc/react'
import { observer } from 'mobx-react'
import store from '../store'
import {
  DeleteOrderDetail,
  Order_State,
  UpdateOrderDetailByOrderDetail,
} from 'gm_api/src/order'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import SVGDelete from '@/svg/delete.svg'
import classNames from 'classnames'
import { App_Type } from 'gm_api/src/common'

const { OperationDelete, OperationCellRowEdit } = TableXUtil

const Operation = observer((props: { index: number }) => {
  const d = store.list[props.index]
  const { order, editing, canDelete, ...orderDetail } = d

  function handleReFetch(): void {
    store.doRequest()
  }

  function handleClose() {
    store.doRequest()
  }

  function handleDelete(): void {
    DeleteOrderDetail({
      order_id: orderDetail.order_id,
      order_detail_id: orderDetail.order_detail_id,
    }).then(() => {
      handleReFetch()
      return null
    })
  }

  function handleSave(): void {
    if (!isSaveOrderNum() && isAddOrderNum()) {
      Tip.danger(`${d.sku_name} 下单数量必须大于0，且不小于最小下单数`)
      throw new Error('num error')
    }

    UpdateOrderDetailByOrderDetail({ order_detail: d }).then(() => {
      Tip.success('更新成功')
      handleClose()
      return null
    })
  }

  function handleEdit(): void {
    store.updateSku(props.index, 'editing', true)
  }

  function isSaveOrderNum() {
    const orderVal = d?.order_unit_value_v2?.quantity?.val
    return !!orderVal && +orderVal >= 0
  }

  // 判断编辑是否设置了加单数
  function isAddOrderNum() {
    return +d?.total_add_order_value?.quantity?.val! === 0
  }

  // // // 如果商品是组合商品的原料时，置 disabled 态，hover上去提示。先额外处理下吧
  // const isCombineMaterial = isMaterialOfCombine()

  // 只要属于组合商品，都不能被删除
  // const isMenuMaterial = order?.quotation_type === Quotation_Type.WITH_TIME

  // const isCombineMaterial =
  //   +order?.status! & Order_Status.STATUS_HAS_COMBINE_SSU

  const RenderOperationEdit: FC = (props) => {
    return (
      <OperationCellRowEdit
        isEditing={!!editing}
        disabled={
          !globalStore.hasPermission(Permission.PERMISSION_ORDER_UPDATE_ORDER)
        }
        onClick={() => {
          handleEdit()
        }}
        onCancel={() => {
          handleClose()
        }}
        onSave={() => {
          handleSave()
        }}
      >
        {props.children}
      </OperationCellRowEdit>
    )
  }
  if (order?.state === Order_State.STATE_RECEIVABLE) return null

  // 售后异常，不可编辑，不可删除
  if (+d?.status! & (1 << 12)) return null

  return (
    <>
      {!canDelete && !d.detail_random_id?.startsWith('10') ? (
        <RenderOperationEdit>
          <Popover
            type='hover'
            popup={
              <div className='gm-padding-5'>
                {t(
                  // `${
                  //   isMenuMaterial
                  //     ? '该商品来源于菜谱，如需删除请在订单详情中删除'
                  //     : '该商品是组合商品的原料，如需删除请在订单详情中删除'
                  // }`,
                  '该商品是组合商品的原料，如需删除请在订单详情中删除',
                )}
              </div>
            }
            right
          >
            <span>
              {order?.app_type !== App_Type.TYPE_ESHOP && (
                <SVGDelete
                  className={classNames(
                    'gm-text-14 gm-inline-block gm-text-desc',
                  )}
                  style={{ cursor: 'not-allowed', marginLeft: 10 }}
                />
              )}
            </span>
          </Popover>
        </RenderOperationEdit>
      ) : (
        <RenderOperationEdit>
          {order?.app_type !== App_Type.TYPE_ESHOP && (
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
          )}
        </RenderOperationEdit>
      )}
    </>
  )
})

export default Operation
