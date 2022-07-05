import * as React from 'react'
import { FC, useEffect, useState } from 'react'
import Big from 'big.js'
import { observer } from 'mobx-react'
import moment from 'moment'
import { t } from 'gm-i18n'
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
  sortByCustomerId,
} from '@/pages/sales_invoicing/util'

import globalStore from '@/stores/global'
import { PDetail } from '../../stores/detail_store'
import { DetailStore } from '../../stores/index'

interface Props {
  index: number
  data: PDetail
  warehouseId: string | undefined
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
    } else {
      totalBaseQuantity = +Big(item.sku_base_quantity!)
        .plus(totalBaseQuantity)
        .toFixed(globalStore.dpSalesInvoicing)
    }
  })

  // 校验通过了才继续校验
  if (isBatchValid && flag && totalBaseQuantity !== total) {
    isBatchValid = false
    const tips =
      +totalBaseQuantity > +total
        ? t('已选的批次出库数大于商品出库数， 是否修改出库数？')
        : t('已选的批次出库数小于商品出库数， 是否修改出库数？')
    const tip = globalStore.salesInvoicingSetting.allow_negative_stock
      ? t(
          '所选批次出库数（基本单位）需要等于待出库数，若库存不足，可以使用批量出库进行负库存出库',
        )
      : t('所选批次出库数（基本单位）需要等于待出库数')
    // Tip.tip(tip)

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
            cb(true)
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
  const { batch_selected } = data
  const { changeProductDetailsItem } = DetailStore
  const { out_stock_time, sheet_status } = DetailStore.receiptDetail
  const is_has_selected = !!batch_selected.length

  const [isError, setIsError] = useState(false)
  const [isTimeError, setIsTimeError] = useState(false)
  const [isStockError, setIsStockError] = useState(false)
  const [isSsuStockError, setIsSsuStockError] = useState(false)

  const isApproved = sheet_status === RECEIPT_STATUS.approved

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
    const {
      base_quantity,
      second_base_unit_ratio,
      input_stock: { input, input2 },
      batch_details,
      second_base_unit_quantity,
    } = data

    let base_quantity_ =
      base_quantity ??
      +Big(
        batchSelected
          .map((it) => {
            return it.sku_base_quantity ?? 0
          })
          .reduce((a, c) => a + c, 0),
      )
    const skuBaseCount = +Big(base_quantity_).toFixed(
      globalStore.dpSalesInvoicing,
    )

    const fn = (free = false) => {
      if (free)
        base_quantity_ = +Big(
          batchSelected
            .map((it) => {
              return it.sku_base_quantity ?? 0
            })
            .reduce((a, c) => a + c, 0),
        )
      let amount = 0
      _.each(batchSelected, (selected) => {
        amount = +Big(amount).plus(
          Big(selected.batch_average_price || 0).times(
            selected.sku_base_quantity || 0,
          ),
        )
      })

      // 单价
      const base_price = +Big(amount).div(base_quantity_ || 1)
      // 辅助单位的处理
      const isSecondFilled =
        !_.isNil(second_base_unit_quantity) &&
        !!_.toNumber(second_base_unit_quantity)
      const isValidValue = !_.isNil(base_quantity_)
      const secondInputValue = isValidValue
        ? +Big(base_quantity_).div(+second_base_unit_ratio || 1)
        : ''

      _.set(data, 'input_stock', {
        input: {
          ...input,
          quantity: base_quantity_.toString(),
          price: base_price,
        },
        input2: {
          ...input2,
          quantity: secondInputValue.toString(),
          price: base_price,
        },
      })

      DetailStore.changeProductDetailsItem(index, {
        ...data,
        batch_selected: batchSelected.map((item) => {
          return {
            ...item,
            input_stock: {
              ...item.input_stock,
              input: {
                ...item.input_stock.input,
                quantity: String(item.sku_base_quantity) ?? '0',
              },
              input2: {
                ...item.input_stock.input2,
                quantity: String(item.sku_base_quantity) ?? '0',
              },
            },
          }
        }),
        batch_details: !batchSelected.length ? [] : batch_details,
        amount,
        base_price, // 目前没用了
        second_base_unit_quantity: isSecondFilled
          ? second_base_unit_quantity.toString()
          : secondInputValue.toString(),
      })
    }

    if (verifyBatch(batchSelected, skuBaseCount, !!base_quantity, fn)) {
      fn()
      RightSideModal.hide()
    }
  }
  const handleBatch = () => {
    const {
      sku_base_unit_id,
      // ssu_unit_id,
      sku_id,
      sku_base_unit_name,
      base_quantity,
      // ssu_quantity,
      sku_type,
      // ssu_base_unit_rate, // sku base_unit_id对应基本单位的换算比例
    } = data
    const { out_stock_time } = DetailStore.receiptDetail
    const { target_id_parent } = DetailStore

    if (!sku_id) {
      Tip.danger(t('请先填写商品、规格'))
      return
    }
    const skuBaseCount = +Big(base_quantity ?? 0)
      // .times(ssu_base_unit_rate ?? 0)
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
            ssuInfo: { ssu_unit_id: sku_base_unit_id },
          }}
          onEnsure={handleEnsure}
          onCancel={() => {
            RightSideModal.hide()
          }}
          hasSkuUnit
          hasCustomer
          defaultFilter={{
            end_time: moment(nowDate).isAfter(maxTime) ? maxTime : nowDate,
          }}
          filterInfo={{
            maxTime,
          }}
          needInputLimit
          adapterDataFunc={(data) => {
            const result = calculateSurplusByBatchSelected(
              data,
              DetailStore.productDetails,
              'sku_stock_base_quantity',
              index,
            )
            if (target_id_parent) {
              return sortByCustomerId(result, target_id_parent)
            }

            return result
          }}
        />
      ),
      title: t('选择出库批次'),
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '1200px',
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
                {t('存在批次账面库存（基本单位）小于所填出库数（基本单位）')}
              </div>
            }
          />
        </>
      )}
      {/* {!isApproved && isSsuStockError && (
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
      )} */}
    </Flex>
  )
})

export default BatchDetailCell
