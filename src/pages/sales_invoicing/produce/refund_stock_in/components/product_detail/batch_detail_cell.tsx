import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Flex, RightSideModal, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import moment from 'moment'
import Big from 'big.js'
import _ from 'lodash'

import { BatchSelect } from '@/pages/sales_invoicing/components'
import store, { PDetail } from '../../stores/receipt_store'
import { BatchDetail } from '@/pages/sales_invoicing/sales_invoicing_type'
import { getDateByTimestamp, isValid, toFixedByType } from '@/common/util'
import globalStore from '@/stores/global'
import WarningPopover from '@/common/components/icon/warning_popover'

import { OperateType } from 'gm_api/src/inventory'
import {
  calculateSurplusByBatchSelected,
  getShelfSelected,
} from '@/pages/sales_invoicing/util'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'

interface Props {
  index: number
  data: PDetail
  warehouseId?: string
}

const verifyBatch = (data: BatchDetail[], total: number): boolean => {
  let isBatchValid = true

  if (data.length === 0) {
    isBatchValid = true
    return isBatchValid
  }

  let totalBaseQuantity = 0

  _.each(data, (item) => {
    if (!isValid(item.sku_base_quantity)) {
      isBatchValid = false
      Tip.danger(t('入库数（基本单位）为必填'))
    } else if (+item.sku_base_quantity! === 0) {
      isBatchValid = false
      Tip.danger(t('入库数（基本单位）不能为0'))
    } else {
      totalBaseQuantity = +Big(item.sku_base_quantity!)
        .plus(totalBaseQuantity)
        .toFixed(globalStore.dpSalesInvoicing)
    }
  })

  // 校验通过了才继续校验
  // if (isBatchValid && totalBaseQuantity !== total) {
  //   isBatchValid = false
  //   Tip.danger(t('所选批次入库数（基本单位）需要等于待入库数'))
  // }
  return isBatchValid
}

const BatchDetailCell: FC<Props> = observer(({ index, data, warehouseId }) => {
  const { batch_selected } = data
  const { sheet_status } = store.receiptDetail
  const isApproved = sheet_status === RECEIPT_STATUS.approved

  const is_has_selected = !!batch_selected.length

  const [isError, setIsError] = useState(false)
  const [isStockError, setIsStockError] = useState(false)

  useEffect(() => {
    if (!isApproved) {
      if (batch_selected.length === 0) {
        setIsError(false)
        store.changeErrorMap('batchDeleteError', false)
      }
      _.each(batch_selected, (batch) => {
        if (batch.batch_delete_time !== '0') {
          setIsError(true)
          store.changeErrorMap('batchDeleteError', true)
        }
      })
    }
  }, [batch_selected, isApproved])

  const handleEnsure = (batchSelected: BatchDetail[]) => {
    const {
      // base_quantity,
      // sku_base_unit_rate, // sku base_unit_id对应基本单位的换算比例
      input_stock: { input, input2 },
    } = data
    const skuBaseCount = +Big(_.toNumber(input?.quantity) || 0)
      .times(1)
      .toFixed(globalStore.dpSalesInvoicing)

    if (verifyBatch(batchSelected, skuBaseCount)) {
      let amount = 0
      // let total_quantity = 0
      _.each(batchSelected, (selected) => {
        amount = +Big(amount).plus(
          Big(selected.batch_average_price || 0).times(
            selected.sku_base_quantity || 1,
          ),
        )
      })
      const base_quantity_ =
        // input?.quantity ??
        +Big(
          batchSelected
            .map((it) => {
              return it.sku_base_quantity ?? 0
            })
            .reduce((a, c) => a + c, 0),
        )

      // TODO： 暂时不需要进行second_base_unit_ratio换算，后续需要补充
      const secondInputValue = Big(base_quantity_ || 0).times(1)
      /** 辅助单位 */
      const second_base_unit_quantity = toFixedByType(
        base_quantity_,
        'dpInventoryAmount',
      )
      _.set(data, 'input_stock', {
        input: {
          ...input,
          quantity: base_quantity_.toString(),
        },
        input2: {
          ...input2,
          quantity: secondInputValue.toString(),
        },
      })

      store.changeProductDetailsItem(index, {
        ...data,
        second_base_unit_quantity,
        batch_selected: batchSelected,
        amount,
        base_price: +Big(amount).div(base_quantity_ || 1),
        shelf_selected: +batchSelected[0]?.shelf_id!
          ? getShelfSelected(store.shelfResponse, batchSelected[0].shelf_id)
          : [],
      })

      RightSideModal.hide()
    }
  }

  const handleBatch = () => {
    const {
      sku_base_unit_id,
      ssu_unit_id,
      sku_id,
      sku_base_unit_name,
      sku_type,
      production_task_id,
      sku_base_unit_rate, // sku base_unit_id对应基本单位的换算比例
      input_stock: { input },
    } = data
    const { submit_time, material_order_id } = store.receiptDetail
    if (!(sku_id && material_order_id)) {
      Tip.danger(t('请先填写商品、领料单'))
      return
    }

    const skuBaseCount = +Big(_.toNumber(input?.quantity) || 0)
      .times(1)
      // .times(sku_base_unit_rate!)
      .toFixed(globalStore.dpSalesInvoicing)
    const maxTime = getDateByTimestamp(submit_time) ?? new Date()
    const nowDate = new Date()
    RightSideModal.render({
      children: (
        <BatchSelect
          selectKey='batch_id'
          type='refund_stock_in'
          selected={batch_selected.slice()}
          warehouseId={warehouseId}
          productInfo={{
            skuInfo: {
              skuBaseCount,
              skuBaseUnitName: sku_base_unit_name,
              sku_id,
              sku_type,
              sku_base_unit_id,
            },
            ssuInfo: { ssu_unit_id },
          }}
          onEnsure={handleEnsure}
          onCancel={() => {
            RightSideModal.hide()
          }}
          filterInfo={{
            maxTime,
          }}
          defaultFilter={{
            material_order_id,
            operates: [
              OperateType.OPERATE_TYPE_MATERIAL_IN_ROLL_BACK,
              OperateType.OPERATE_TYPE_MATERIAL_OUT_ROLL_BACK,
              OperateType.OPERATE_TYPE_MATERIAL_IN,
              OperateType.OPERATE_TYPE_MATERIAL_OUT,
            ],
            end_time: moment(nowDate).isAfter(maxTime) ? maxTime : nowDate,
          }}
          needInputLimit
          adapterDataFunc={(data) =>
            calculateSurplusByBatchSelected(
              data,
              store.productDetails,
              'sku_base_material_out',
              index,
            )
          }
        />
      ),
      title: t('选择退料批次'),
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '1000px',
      },
    })
  }

  return (
    <Flex>
      <a onClick={handleBatch} className='gm-cursor'>
        {is_has_selected ? t('查看批次') : t('选择批次')}
      </a>
      {!isApproved && isError && (
        <>
          <div className='gm-gap-10' />
          <WarningPopover
            popup={
              <div className='gm-padding-tb-10 gm-padding-lr-15'>
                {t('存在批次已删除，请重新选择')}
              </div>
            }
          />
        </>
      )}
      {!isApproved && isStockError && (
        <>
          <div className='gm-gap-10' />
          <WarningPopover
            popup={
              <div className='gm-padding-tb-10 gm-padding-lr-15'>
                {t('存在批次领料数（基本单位）小于所填入库数（基本单位）')}
              </div>
            }
          />
        </>
      )}
    </Flex>
  )
})

export default BatchDetailCell
