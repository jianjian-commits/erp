import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store, { PDetail } from '../../stores/receipt_store'
// import { ListProductionTaskCost } from 'gm_api/src/inventory'
import { GetTask } from 'gm_api/src/production'
import Big from 'big.js'
import _ from 'lodash'

import { Flex, Popover, Price, Tip } from '@gm-pc/react'
import { isInShareV2, getLinkCalculateV2, backEndDp } from '../../../../util'
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
    sku_base_unit_name,
    base_price,
    sku_id,
    is_by_product,
    input_stock: { input, input2 },
  } = data
  const base_price_show = toFixedByType(
    (base_price && +base_price) || 0,
    'dpInventoryAmount',
  )

  const handleStdUnitPriceChange = (value: number) => {
    const { amount, base_quantity_show } = getLinkCalculateV2({
      data,
      currentField: 'base_price',
      currentValue: value,
    })
    _.set(data, 'input_stock', {
      input: {
        ...input,
        quantity: base_quantity_show,
      },
      input2: {
        ...input2,
        quantity: base_quantity_show,
      },
    })
    store.changeProductDetailsItem(index, {
      ...data,
      base_price: value,
      amount,
    })
  }

  const handleRefreshPrice = async () => {
    const {
      input_stock: { input },
    } = data
    if (!isStringValid(data.production_task_id)) {
      Tip.danger(t('请先选择生产需求'))
    } else if (!isValid(input?.quantity)) {
      Tip.danger(t('请先输入入库数（基本单位）'))
    } else {
      store.changeReceiptLoading(true)
      try {
        const json = await GetTask({
          task_id: data.production_task_id!,
          need_cost: true,
        })
        const { task } = json.response
        const base_price = +Big(task?.cost || 0).toFixed(backEndDp)
        // const amount_show = toFixedByType(+amount, 'dpInventoryAmount')
        const amount =
          !_.isNil(input?.quantity) && _.toNumber(input?.quantity) // 0直接为0吧
            ? +Big(base_price ?? 0)
                .times(input?.quantity ?? 1)
                .toFixed(backEndDp)
            : 0
        store.changeProductDetailsItem(index, {
          amount,
          base_price,
        })
        store.changeReceiptLoading(false)
        return null
      } catch (err) {
        console.log('err', err)
        store.changeReceiptLoading(false)
        throw new Error(err)
      }
    }
    return null
  }

  return (
    <>
      {isInShareV2(apportionList, sku_id) ? (
        base_price_show + Price.getUnit() + '/' + (sku_base_unit_name || '-')
      ) : (
        <Flex alignCenter>
          <KCPrecisionInputNumber
            precisionType='dpInventoryAmount'
            value={base_price}
            onChange={handleStdUnitPriceChange}
            min={0}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>
            {Price.getUnit() + '/'}
            {sku_base_unit_name || '-'}
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
