/**
 * @description 周期报价单tab右侧，子报价单商品价格详情展示
 */
import React, { FC } from 'react'
import store from '../store'
import Product from '../../product'
import Combine from '../../combine'
import { observer } from 'mobx-react'
import CycleStatusTag from '@/pages/merchandise/price_manage/customer_quotation/detail/cycle/components/cycle_tag'
import { Empty, Space } from 'antd'
import { t } from 'gm-i18n'
import moment from 'moment'
import { Quotation_Type } from 'gm_api/src/merchandise'
import _ from 'lodash'

const CycleRight: FC = () => {
  const {
    skuType,
    activeQuotationId,
    listLoading,
    activeQuotation: { inner_name, start_time, end_time, status },
    listIsEmpty,
  } = store
  const isVaildId = !_.isEmpty(activeQuotationId)

  const getDate = (time?: string) => {
    if (time) {
      return moment(Number(time)).format('yyyy-MM-DD')
    } else {
      return ''
    }
  }

  return (
    <div className='cycle_right'>
      {(!isVaildId || listIsEmpty) && (
        <div className='tw-h-full tw-w-full tw-flex tw-items-center tw-justify-center'>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
      {isVaildId && !listLoading && !listIsEmpty && (
        <>
          <Space className='cycle_title'>
            <CycleStatusTag status={Number(status)} />
            {t(`${inner_name}（${getDate(start_time)}～${getDate(end_time)}）`)}
          </Space>
          {skuType === 2 ? (
            <Product
              quotation_id={activeQuotationId}
              type={Quotation_Type.PERIODIC}
            />
          ) : (
            <Combine
              quotation_id={activeQuotationId}
              type={Quotation_Type.PERIODIC}
            />
          )}
        </>
      )}
    </div>
  )
}

export default observer(CycleRight)
