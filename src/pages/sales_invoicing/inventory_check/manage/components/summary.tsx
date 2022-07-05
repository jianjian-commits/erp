import React, { useState, FC } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Select, Flex, Tip } from '@gm-pc/react'
import { pinYinFilter } from '@gm-common/tool'

import {
  POSITION_FILTER_STATUS,
  POSITION_FILTER,
} from '@/pages/sales_invoicing/enum'
import detailStore, {
  PositionFilterType,
  PositionListType,
} from '../stores/detail_store'

interface Props {
  onSearch: (v: number) => any
}

const Summary: FC<Props> = observer((props) => {
  const { onSearch } = props
  const {
    positionFilter: { productType, productName },
    productList,
    getDetailResult,
  } = detailStore
  const { all, profit, loss } = getDetailResult
  const [conformList, changeConformList] = useState<PositionListType[]>([])

  const handleChangeSummary = <T extends keyof PositionFilterType>(
    name: T,
    value: PositionFilterType[T],
  ) => {
    detailStore.changePositionFilter(name, value)
  }

  const positionFilter = () => {
    let result = pinYinFilter(productList.slice(), productName, (v) => {
      return v.data.sku_name
    })
    if (productType !== POSITION_FILTER.all) {
      const filterTypeList = _.filter(result, (v) => {
        return v.type === productType
      })
      result = filterTypeList
    }
    changeConformList(result)
    skipList(result)
  }

  const skipList = (result) => {
    if (result.length >= 1) {
      onSearch(result[0].index)
    } else {
      Tip.danger(t('没有搜索到'))
    }
  }

  return (
    <Flex>
      <Flex alignCenter>
        <span>{t('盘点商品:')}</span>
        <span className='gm-margin-right-10 gm-margin-left-10'>{all}件</span>
        <span>{t('盘盈:')}</span>
        <span className='gm-margin-right-10 gm-margin-left-10'>{profit}件</span>
        <span>{t('盘亏:')}</span>
        <span className='gm-margin-right-10 gm-margin-left-10'>{loss}件</span>
      </Flex>
      <Select
        className='gm-margin-right-10'
        // style={{ width: '100px' }}
        value={productType}
        data={POSITION_FILTER_STATUS}
        onChange={(e) => {
          handleChangeSummary('productType', e)
        }}
      />
      {/* <InputClose
        placeholder='请输入商品名称'
        value={productName}
        onChange={(e) => {
          handleChangeSummary('productName', e)
        }}
      />
      <Button type='primary' onClick={positionFilter}>
        定位
      </Button>
      {conformList.length > 0 && (
        <Flex style={{ height: '30px', lineHeight: '30px' }}>
          <span className='gm-padding-lr-10 gm-text-desc'>|</span>
          <span>{t('当前：')}</span>
          <span className='gm-padding-lr-10 gm-text-desc'>|</span>
          <span>{t('共有：')}</span>
          <span className='gm-text-primary gm-text-bold'>
            {conformList.length}
          </span>
        </Flex>
      )} */}
    </Flex>
  )
})

export default Summary
