import KCDisabledCell from '@/pages/order/order_manage/components/kc_disable_cell'
import { Flex, Tooltip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import React from 'react'

export interface CellSkuExceptionProps {
  /** 商品名称 */
  skuName?: string
}

const CellSkuException: React.VFC<CellSkuExceptionProps> = (props) => {
  const { skuName } = props

  return (
    <KCDisabledCell>
      <div className='gm-has-error'>
        {`(${skuName || '-'})${t('商品异常')}`}
        <Tooltip
          popup={
            <div className='gm-padding-5' style={{ minWidth: '180px' }}>
              <Flex column>
                <div>{t('可能存在如下原因，请检查后重新导入：')}</div>
                <div>{t('1.商品已被删除；')}</div>
                <div>{t('2.商品已被下架；')}</div>
                <div>{t('3.商品停售；')}</div>
                <div>{t('4.商品库存不足；')}</div>
                <div>{t('5.当前用户的报价单中不包含此商品；')}</div>
                <div>{t('6.商品所在报价单已被禁用；')}</div>
                <div>{t('7.商品所在周期报价单子报价单已过期；')}</div>
              </Flex>
            </div>
          }
        />
      </div>
    </KCDisabledCell>
  )
}

export default CellSkuException
