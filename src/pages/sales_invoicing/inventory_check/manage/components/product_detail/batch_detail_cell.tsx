import React, { FC, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { Flex, RightSideModal, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import Big from 'big.js'
import { BatchDetail } from '@/pages/sales_invoicing/sales_invoicing_type'
import { BatchSelect } from '@/pages/sales_invoicing/components'
import { isValid } from '@/common/util'
import globalStore from '@/stores/global'
import store, { PDetail } from '../../stores/detail_store'
import { Filters_Bool } from 'gm_api/src/common'
import WarningPopover from '@/common/components/icon/warning_popover'
import { RECEIPT_STATUS } from '@/pages/sales_invoicing/enum'

interface Props {
  index: number
  data: PDetail
}

const BatchDetailCell: FC<Props> = observer(({ index, data, warehouseId }) => {
  const { batch_selected } = data
  const { sheet_status } = store.receiptDetail
  const isApproved = sheet_status === RECEIPT_STATUS.approved

  const is_has_selected = !!batch_selected.length

  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!isApproved) {
      _.each(batch_selected, (batch) => {
        if (batch.batch_delete_time !== '0') {
          setIsError(true)
        }
      })
    }
  }, [batch_selected, isApproved])

  const verifyBatch = (data: BatchDetail[]): boolean => {
    let isBatchValid = true

    if (data.length === 0) {
      Tip.danger(t('请选择需要盘点的批次！'))
      isBatchValid = false
    }

    let totalBaseQuantity = 0

    _.each(data, (item) => {
      if (!isValid(item.sku_base_quantity) || !isValid(item.ssu_quantity)) {
        isBatchValid = false
        Tip.danger(t('盘点数（基本单位）为必填'))
      } else {
        totalBaseQuantity = +Big(item.sku_base_quantity!)
          .plus(totalBaseQuantity)
          .toFixed(globalStore.dpSalesInvoicing)
      }
    })

    return isBatchValid
  }

  const handleEnsure = (batchSelected: BatchDetail[]) => {
    if (verifyBatch(batchSelected)) {
      let amount = 0
      _.each(batchSelected, (selected) => {
        amount = +Big(amount).plus(
          Big(selected.batch_average_price || 0).times(
            selected.sku_base_quantity || 0,
          ),
        )
      })

      store.changeProductDetailsItem(index, {
        batch_selected: batchSelected,
        amount,
        base_price: +Big(amount).div(data.ssu_base_quantity || 1),
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
    } = data
    // if (!(sku_id && ssu_unit_id)) {
    if (!sku_id) {
      // Tip.danger(t('请先填写商品、规格'))
      Tip.danger(t('请先填写商品'))
      return
    }
    RightSideModal.render({
      children: (
        <BatchSelect
          selectKey='batch_id'
          selected={batch_selected.slice()}
          productInfo={{
            skuInfo: {
              skuBaseUnitName: sku_base_unit_name,
              sku_id,
              sku_base_unit_id,
              sku_type,
            },
            // ssuInfo: { ssu_unit_id },
            ssuInfo: { ssu_unit_id: sku_base_unit_id },
          }}
          onEnsure={handleEnsure}
          onCancel={() => {
            RightSideModal.hide()
          }}
          warehouseId={warehouseId}
          defaultFilter={{ remaining: Filters_Bool.ALL }}
          type='inventory'
          hasTarget
        />
      ),
      title: t('选择盘点批次'),
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
    </Flex>
  )
})

export default BatchDetailCell
