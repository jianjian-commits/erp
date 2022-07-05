import React, { useState, FC, useCallback, useRef } from 'react'
import { Empty } from 'antd'
import { t } from 'gm-i18n'
import SkuSelector, { SkuSelectorRef } from './sku_selector'
import type { CellPropsWidthOriginal } from '../../interface'
import CreateMerchandiseModal from './create_merchandise_modal'
import _ from 'lodash'
import globalStore from '@/stores/global'
import store from '../../../store'
import { Quotation_Type } from 'gm_api/src/merchandise'

/**
 * 搜索并选择商品。列表为空则显示快速创建商品按钮。
 */
const CellSkuSelector: FC<CellPropsWidthOriginal> = ({ sku, index }) => {
  const selectorRef = useRef<SkuSelectorRef | null>(null)
  const searchKeyword = useRef<string>()

  const [createModelVisible, setCreateModelVisible] = useState(false)
  const renderEmpty = useCallback((searchValue: string) => {
    if (searchValue === '') {
      return undefined
    }
    const isMenuOrder = store.order.quotation_type === Quotation_Type.WITH_TIME
    // 禁用快速创建功能
    const disabledCreateFeature = globalStore.isLite || isMenuOrder
    return (
      <div className='tw-h-full tw-px-20 tw-flex tw-justify-center tw-items-center'>
        <Empty
          description={
            <span
              className='tw-mx-10'
              style={{ color: '#A4A5A6', fontSize: 14 }}
            >
              {disabledCreateFeature
                ? t('没有找到该商品')
                : t('没有找到该商品，是否')}
              {!disabledCreateFeature && (
                <span
                  className='tw-text-primary tw-cursor-pointer'
                  role='button'
                  aria-label={t('创建商品')}
                  onClick={() => {
                    searchKeyword.current = searchValue
                    setCreateModelVisible(true)
                  }}
                >
                  {t('快速创建')}
                </span>
              )}
            </span>
          }
        />
      </div>
    )
  }, [])

  const searchAgain = useCallback(() => {
    const keyword = _.trim(searchKeyword.current)
    searchKeyword.current = ''
    if (keyword.length > 0 && selectorRef.current) {
      selectorRef.current.search(keyword)
    }
  }, [])

  return (
    <div style={{ width: '168px' }}>
      <SkuSelector
        ref={selectorRef}
        sku={sku}
        index={index}
        renderEmpty={renderEmpty}
      />
      <CreateMerchandiseModal
        visible={createModelVisible}
        defaultSkuName={searchKeyword.current}
        onClose={setCreateModelVisible}
        onFinish={searchAgain}
      />
    </div>
  )
}

export default CellSkuSelector
