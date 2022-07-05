import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import moment from 'moment'
import { t } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import { Dialog, Flex, RightSideModal, Tip } from '@gm-pc/react'

import { getDateByTimestamp, isValid } from '@/common/util'
import WarningPopover from '@/common/components/icon/warning_popover'

import { BatchSelect } from '@/pages/sales_invoicing/components'
import { BatchDetail } from '@/pages/sales_invoicing/sales_invoicing_type'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'
import {
  calculateSurplusByBatchSelected,
  compareInDp,
} from '@/pages/sales_invoicing/util'

import globalStore from '@/stores/global'
import { ProductDetailProps } from '../../stores/details_store'
import { DetailStore } from '../../stores/index'

interface Props {
  index: number
  data: ProductDetailProps
  warehouseId: string
}

const verifyBatch = (
  data: BatchDetail[],
  total: number,
  flag: boolean,
  cb: (free?: boolean) => void,
): boolean => {
  let isBatchValid = true

  if (data.length === 0) {
    // Tip.danger(t('请选择需要出库的批次！'))
    isBatchValid = true
    return isBatchValid
  }

  let totalBaseQuantity = 0

  _.each(data, (item) => {
    if (!isValid(item.sku_base_quantity)) {
      isBatchValid = false
      Tip.danger(t('出库数（基本单位）为必填'))
    } else if (+item.sku_base_quantity! === 0) {
      isBatchValid = false
      Tip.danger(t('出库数（基本单位）不能为0'))
    } else if (
      compareInDp('gt', item.sku_base_quantity!, item.sku_stock_base_quantity)
    ) {
      isBatchValid = false
      Tip.danger(t('出库数（基本单位）不能大于账面库存（基本单位）'))
    }
    // else if (compareInDp('gt', item.ssu_quantity!, item.ssu_stock_quantity)) {
    //   isBatchValid = false
    //   // Tip.danger(
    //   //   t('出库数（包装单位(废弃)）不能大于账面库存（包装单位(废弃)）'),
    //   // )
    // }
    else {
      totalBaseQuantity = +Big(item.sku_base_quantity!)
        .plus(totalBaseQuantity)
        .toFixed(globalStore.dpSalesInvoicing)
    }
  })

  // 校验通过了才继续校验
  if (isBatchValid && flag && totalBaseQuantity !== total) {
    isBatchValid = false
    // Tip.danger(t('所选批次出库数（基本单位）需要等于待出库数'))
    const tips =
      +totalBaseQuantity > +total
        ? t('已选的批次出库数大于商品出库数， 是否修改出库数？')
        : t('已选的批次出库数小于商品出库数， 是否修改出库数？')
    Dialog.render({
      title: '提示',
      buttons: [
        {
          text: t('取消'),
          onClick: () => {
            Dialog.hide()
          },
        },
        {
          text: t('确定'),
          onClick: () => {
            // eslint-disable-next-line standard/no-callback-literal
            cb && cb(true)
            RightSideModal.hide()
            Dialog.hide()
          },
          btnType: 'primary',
        },
      ],
      children: tips,
    })
  }
  return isBatchValid
}

const BatchDetailCell: FC<Props> = observer(({ index, data, warehouseId }) => {
  const { changeProductDetailsItem, receiptDetail } = DetailStore
  const { out_stock_time, sheet_status } = receiptDetail
  const { batch_selected, sku_base_unit_id } = data

  const isApproved = sheet_status === RECEIPT_STATUS.approved
  const is_has_selected = !!batch_selected.length

  const [isError, setIsError] = useState(false)
  const [isTimeError, setIsTimeError] = useState(false)
  const [isStockError, setIsStockError] = useState(false)
  const [isSsuStockError, setIsSsuStockError] = useState(false)

  useEffect(() => {
    if (!isApproved) {
      if (batch_selected.length === 0) {
        setIsError(false)
        setIsTimeError(false)
        setIsStockError(false)
        setIsSsuStockError(false)
      }
      _.each(batch_selected, (batch) => {
        if (batch.batch_delete_time !== '0') {
          setIsError(true)
        } else {
          setIsError(false)
        }

        if (
          out_stock_time &&
          batch.in_stock_time &&
          Big(batch.in_stock_time).gt(out_stock_time)
        ) {
          setIsTimeError(true)
        } else {
          setIsTimeError(false)
        }

        if (
          compareInDp(
            'lt',
            batch.sku_stock_base_quantity,
            batch.sku_base_quantity_show,
          )
        ) {
          setIsStockError(true)
        } else {
          setIsStockError(false)
        }

        if (
          compareInDp('lt', batch.ssu_stock_quantity, batch.ssu_quantity_show)
        ) {
          setIsSsuStockError(true)
        } else {
          setIsSsuStockError(false)
        }
      })
    }
  }, [batch_selected, out_stock_time, isApproved])

  const handleEnsure = (batchSelected: BatchDetail[]) => {
    const { base_quantity, batch_details } = data
    let base_quantity_ =
      base_quantity ??
      +Big(
        batchSelected
          .map((it) => {
            return it.sku_base_quantity ?? 0
          })
          .reduce((a, c) => a + c, 0),
      ).div(1)

    const skuBaseCount = +Big(base_quantity_ ?? 0)
      .times(1)
      .toFixed(globalStore.dpSalesInvoicing)

    const fn = (free = false) => {
      if (free) {
        base_quantity_ = +Big(
          batchSelected
            .map((it) => {
              return it.sku_base_quantity ?? 0
            })
            .reduce((a, c) => a + c, 0),
        ).div(1)
      }
      let amount = 0
      _.each(batchSelected, (selected) => {
        amount = +Big(amount).plus(
          Big(selected.batch_average_price || 0).times(
            selected.sku_base_quantity || 0,
          ),
        )
      })

      // 出库单价
      const out_stock_base_price = +Big(amount).div(base_quantity_ || 1)

      changeProductDetailsItem(index, {
        batch_selected: batchSelected.map((item) => {
          // 修改批次 quantity 的值为 输入的值
          return {
            ...item,
            input_stock: {
              ...item.input_stock,
              input: {
                ...item.input_stock.input,
                quantity: item.sku_base_quantity ?? '0',
              },
            },
          }
        }),
        amount,
        out_stock_base_price,
        batch_details: !batchSelected.length ? [] : batch_details,
        input_stock: {
          input: {
            unit_id: sku_base_unit_id,
            quantity: String(base_quantity_),
            price: '0',
          },
          input2: {
            unit_id: sku_base_unit_id,
            quantity: String(base_quantity_),
            price: '0',
          },
        },
      })
    }
    if (verifyBatch(batchSelected, skuBaseCount, true, fn)) {
      RightSideModal.hide()
      fn()
    }
  }

  const handleBatch = () => {
    const {
      sku_base_unit_id,
      ssu_unit_id,
      sku_id,
      sku_base_unit_name,
      base_quantity,
      sku_type,
    } = data

    const { out_stock_time } = DetailStore.receiptDetail

    if (sku_id === '0') {
      Tip.danger(t('请先填写商品'))
      return
    }

    const skuBaseCount = +Big(base_quantity ?? 0)
      .times(1)
      .toFixed(globalStore.dpSalesInvoicing)
    const maxTime = getDateByTimestamp(out_stock_time) ?? new Date()
    const nowDate = new Date()
    RightSideModal.render({
      children: (
        <BatchSelect
          free
          selectKey='batch_id'
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
          hasSkuUnit
          defaultFilter={{
            end_time: moment(nowDate).isAfter(maxTime) ? maxTime : nowDate,
          }}
          filterInfo={{
            maxTime,
          }}
          needInputLimit
          adapterDataFunc={(data) =>
            calculateSurplusByBatchSelected(
              data,
              DetailStore.productDetails,
              'sku_stock_base_quantity',
              index,
            )
          }
        />
      ),
      title: t('选择出库批次'),
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
      {!isApproved && isTimeError && (
        <>
          <div className='gm-gap-10' />
          <WarningPopover
            popup={
              <div className='gm-padding-tb-10 gm-padding-lr-15'>
                {t('存在批次入库时间晚于单据出库时间，请重新编辑')}
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
                {t('存在批次账面库存小于所填出库数（基本单位）')}
              </div>
            }
          />
        </>
      )}
      {!isApproved && isSsuStockError && (
        <>
          <div className='gm-gap-10' />
          <WarningPopover
            popup={
              <div className='gm-padding-tb-10 gm-padding-lr-15'>
                {t('存在批次账面库存小于所填出库数（包装单位(废弃)）')}
              </div>
            }
          />
        </>
      )}
    </Flex>
  )
})

export default BatchDetailCell
