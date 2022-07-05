import ReceiptHeaderDetail from '@/common/components/receipt_header_detail'
import { history } from '@/common/service'
import globalStore from '@/stores/global'
import {
  Button,
  DatePicker,
  Input,
  InputNumber,
  Price,
  Select,
  Tip,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Observer, observer } from 'mobx-react'
import moment from 'moment'
import React, { ReactNode, useMemo } from 'react'
import store from '../../store'

interface Block {
  text: string | ReactNode
  value: ReactNode
  hide?: boolean
}
const Header = observer(() => {
  const {
    total_after_sale_price = 0,
    total_outstock_price = 0,
    total_paid_price = 0,
  } = store.total

  const handleBack = () => {
    history.goBack()
  }

  const handleOK = () => {
    if (_.isNil(store.detailHeader.total_price)) {
      Tip.danger(t('请填写结款金额'))
      return
    }
    if (_.trim(store.detailHeader.customize_settle_voucher).length === 0) {
      Tip.danger(t('请填写自定义凭证号'))
      return
    }
    store.createCustomerSheet().then((res) => {
      Tip.success(t('提交成功'))
      history.push(
        `/financial_manage/settlement_manage/settlement_voucher/detail?settle_sheet_id=${res.response.settle_sheet?.settle_sheet_id}`,
      )
    })
  }

  const priceBlock = useMemo<Block[]>(
    () => [
      // 待结金额 = 未付 - 售后
      {
        text: t('待结金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+store.total_waiting_sale_price}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      {
        text: t('应付金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+total_outstock_price!}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      {
        text: t('已付金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+total_paid_price!}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      // 未付金额 = 应付 - 已付
      {
        text: t('未付金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+store.total_unPay_price}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
      {
        text: t('售后金额'),
        value: (
          <Observer>
            {() => (
              <Price
                value={+total_after_sale_price!}
                precision={globalStore.dpOrder}
              />
            )}
          </Observer>
        ),
      },
    ],
    [store.total],
  )

  const {
    company_name,
    pay_type,
    settle_time,
    total_price,
    customize_settle_voucher,
  } = store.detailHeader
  return (
    <ReceiptHeaderDetail
      contentLabelWidth={80}
      customerContentColWidth={[300, 300, 300, 300, 300]}
      totalData={priceBlock}
      HeaderInfo={[]}
      HeaderAction={
        <>
          <Button className='gm-margin-right-10' onClick={handleBack}>
            取消
          </Button>
          <Button
            className='gm-margin-right-10'
            type='primary'
            onClick={handleOK}
          >
            提交
          </Button>
        </>
      }
      ContentInfo={[
        {
          label: t('结款公司名'),
          item: t(company_name),
        },
        {
          label: t('结款方式'),
          item: (
            <Select
              style={{ minWidth: 100 }}
              value={pay_type!}
              data={[{ value: 1, text: t('线下转账') }]}
              onChange={_.noop}
            />
          ),
        },
        {
          label: t('到账日期'),
          item: (
            <DatePicker
              date={settle_time.toDate()}
              placeholder='请选择日期'
              onChange={(e) => {
                store.updateDetailHeader('settle_time', moment(e))
              }}
            />
          ),
        },
        {
          label: t('结款金额'),
          item: (
            <Observer>
              {() => (
                <>
                  <InputNumber
                    value={total_price}
                    disabled={store.total_waiting_sale_price < 0}
                    onChange={(val) => {
                      store.updateDetailHeader(
                        'total_price',
                        val > store.total_waiting_sale_price
                          ? store.total_waiting_sale_price
                          : (val as number),
                      )
                      store.distributeSettlePrice()
                    }}
                    min={0}
                  />
                  {Price.getUnit()}
                </>
              )}
            </Observer>
          ),
        },
        {
          label: t('自定义凭证号'),
          item: (
            <>
              <Input
                value={customize_settle_voucher}
                onChange={(e) =>
                  store.updateDetailHeader(
                    'customize_settle_voucher',
                    e.target.value,
                  )
                }
              />
            </>
          ),
        },
      ]}
    />
  )
})

export default Header
