/**
 * @description 编辑商品报价标题
 */
import TableTextOverflow from '@/common/components/table_text_overflow'
import { LeftOutlined } from '@ant-design/icons'
import SvgPriceReference from '@/svg/price-reference.svg'
import { Button, Divider, Space } from 'antd'
import { t } from 'gm-i18n'
import { Quotation_Type } from 'gm_api/src/merchandise'
import React, { FC } from 'react'
import './style.less'
import modalStore, { SubView } from '../edit_product_modal/store'

interface EditProductTitleProps {
  name: string
  quotationType: Quotation_Type
}

const EditProductTitle: FC<EditProductTitleProps> = (props) => {
  const { name, quotationType } = props
  return (
    <div className='edit_product_title'>
      {(() => {
        switch (modalStore.view) {
          case undefined:
            return <TableTextOverflow text={name} />
          case SubView.Reference:
          case SubView.Reference2:
            return (
              <div className='reference_price_title'>
                <Button
                  className='reference_price_return'
                  icon={<LeftOutlined />}
                  onClick={() => (modalStore.view = undefined)}
                >
                  {t('返回')}
                </Button>
                <span>
                  <TableTextOverflow text={name} />
                  {t('-历史报价')}
                </span>
              </div>
            )
          case SubView.Purchase:
            return (
              <div className='reference_price_title'>
                <Button
                  className='reference_price_return'
                  icon={<LeftOutlined />}
                  onClick={() => (modalStore.view = undefined)}
                >
                  {t('返回')}
                </Button>
                <span>
                  <TableTextOverflow text={name} />
                  {t('-历史采购价')}
                </span>
              </div>
            )
          case SubView.StockIn:
            return (
              <div className='reference_price_title'>
                <Button
                  className='reference_price_return'
                  icon={<LeftOutlined />}
                  onClick={() => (modalStore.view = undefined)}
                >
                  {t('返回')}
                </Button>
                <span>
                  <TableTextOverflow text={name} />
                  {t('-历史入库价')}
                </span>
              </div>
            )
        }
      })()}
    </div>
  )
}

export default EditProductTitle
