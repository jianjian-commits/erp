import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store'
import { ListProductionTaskCost } from 'gm_api/src/inventory'
import Big from 'big.js'
import _ from 'lodash'

import { Flex, Popover, Price, Tip } from '@gm-pc/react'
import { isInShare, getLinkCalculate, backEndDp } from '../../../../util'
import { TableXUtil } from '@gm-pc/table-x'
import KCPrecisionInputNumber from '@/common/components/input_number/kc_precision_input_number'
import SVGRefresh from '@/svg/refresh.svg'
import { t } from 'gm-i18n'
import { isStringValid, isValid, toFixedByType } from '@/common/util'

const { TABLE_X } = TableXUtil

interface Props {
  index: number
  data: PDetail
}

const SsuBasePriceCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { apportionList } = store

  const {
    ssu_base_unit_name,
    ssu_base_price,
    ssu_base_price_show,
    sku_id,
    ssu_unit_id,
    is_by_product,
  } = data

  const handleStdUnitPriceChange = (value: number) => {
    const {
      ssu_quantity,
      ssu_quantity_show,
      ssu_base_quantity,
      ssu_base_quantity_show,

      different_price_show,
      different_price,
      amount_show,
      amount,
    } = getLinkCalculate({
      data,
      currentField: 'ssu_base_price',
      currentValue: value,
    })
    store.changeProductDetailsItem(index, {
      ssu_quantity,
      ssu_quantity_show,
      ssu_base_quantity,
      ssu_base_quantity_show,
      ssu_base_price_show: value,
      ssu_base_price: value,
      different_price_show,
      different_price,
      amount_show,
      amount,
    })
  }

  const handleRefreshPrice = () => {
    if (!isStringValid(data.production_task_id)) {
      Tip.danger(t('请先选择生产计划'))
    } else if (!isValid(data.ssu_base_quantity)) {
      Tip.danger(t('请先输入入库数（基本单位）'))
    } else {
      store.changeReceiptLoading(true)
      ListProductionTaskCost({
        production_task_ids: [data.production_task_id!],
      })
        .then((json) => {
          const amount = +Big(
            json.response.costs![data.production_task_id!] ?? 0,
          ).toFixed(backEndDp)
          const amount_show = toFixedByType(+amount, 'dpInventoryAmount')

          const ssu_base_price =
            !_.isNil(data.ssu_base_quantity) &&
            _.toNumber(data.ssu_base_quantity) // 0直接为0吧
              ? +Big(amount ?? 0)
                  .div(data.ssu_base_quantity ?? 1)
                  .toFixed(backEndDp)
              : 0
          const ssu_base_price_show = toFixedByType(
            +ssu_base_price,
            'dpInventoryAmount',
          )

          store.changeProductDetailsItem(index, {
            amount,
            amount_show,
            ssu_base_price_show,
            ssu_base_price,
          })
          store.changeReceiptLoading(false)
          return null
        })
        .catch((err) => {
          store.changeReceiptLoading(false)
        })
    }
  }

  return (
    <>
      {isInShare(apportionList, sku_id, ssu_unit_id) ? (
        ssu_base_price_show +
        Price.getUnit() +
        '/' +
        (ssu_base_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            precisionType='dpInventoryAmount'
            value={ssu_base_price}
            onChange={handleStdUnitPriceChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>
            {Price.getUnit() + '/'}
            {ssu_base_unit_name || '-'}
          </span>
          {!is_by_product && (
            <Popover
              popup={
                <div className='gm-padding-10'>
                  {t('点击获取最新推荐入库单价')}
                </div>
              }
              type='hover'
              showArrow
            >
              <span onClick={handleRefreshPrice}>
                <SVGRefresh className='gm-text-primary gm-text-16 gm-cursor' />
              </span>
            </Popover>
          )}
        </Flex>
      )}
    </>
  )
})

export default SsuBasePriceCell
