import React, { FC, useCallback } from 'react'
import { Empty } from 'antd'
import { t } from 'gm-i18n'
import SkuSelector from './sku_selector'
import { CellPropsWidthOriginal } from './types'

/**
 * 搜索并选择商品。列表为空则显示快速创建商品按钮。
 */
const CellSkuSelector: FC<CellPropsWidthOriginal> = ({
  sku,
  index,
  orderIndex,
}) => {
  const renderEmpty = useCallback((searchValue: string) => {
    if (searchValue === '') {
      return undefined
    }
    return (
      <div className='tw-h-full tw-px-20 tw-flex tw-justify-center tw-items-center'>
        <Empty
          description={
            <span
              className='tw-mx-10'
              style={{ color: '#A4A5A6', fontSize: 14 }}
            >
              {t('没有找到该商品')}
            </span>
          }
        />
      </div>
    )
  }, [])

  return (
    <div className='tw-w-full'>
      <SkuSelector
        sku={sku}
        index={index}
        orderIndex={orderIndex}
        renderEmpty={renderEmpty}
      />
    </div>
  )
}

export default CellSkuSelector
