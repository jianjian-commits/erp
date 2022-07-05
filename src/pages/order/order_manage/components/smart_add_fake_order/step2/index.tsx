import React, { useMemo } from 'react'
import { observer } from 'mobx-react'
import { Divider, message, Table } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import Footer, { FooterProps } from './footer'
import SelectFakeOrderField from '../select-fake-order-field'
import {
  ADD_ORDER_AMOUNT_FIELD_MEAN,
  ADD_ORDER_VALUE_FIELD_MEAN,
} from '../select-fake-order-field/constants'
import { Price } from '@gm-pc/react'
import { t } from 'gm-i18n'
import InputNumber from '../input_number'
import { useStoreContext } from '../store/context'
import { MerchandiseShape } from '../store/types'
import _ from 'lodash'

const Step2: React.VFC<FooterProps> = observer((props) => {
  const { onCancel, onOk, onPrev } = props

  const ctx = useStoreContext()

  const columns = useMemo<ColumnsType<MerchandiseShape>>(() => {
    return [
      {
        key: 'index',
        width: 54,
        render(_val, _row, index) {
          return index + 1
        },
      },
      {
        title: t('商品编码'),
        dataIndex: 'commodityCode',
      },
      {
        title: t('商品名'),
        dataIndex: 'name',
      },
      {
        title: t('单价'),
        dataIndex: 'price',
        render(val) {
          return `${val}${Price.getUnit()}`
        },
      },
      {
        title: () => {
          return _.get(ADD_ORDER_VALUE_FIELD_MEAN, ctx.field || '', t('加单数'))
        },
        dataIndex: 'count',
        render(val, row, index) {
          return (
            <InputNumber
              value={val}
              suffix={row.unitName}
              onChange={(e) => {
                ctx.setCount(index, e)
              }}
            />
          )
        },
      },
      {
        title: () => {
          return _.get(
            ADD_ORDER_AMOUNT_FIELD_MEAN,
            ctx.field || '',
            t('加单金额'),
          )
        },
        dataIndex: 'amount',
        render(val, _row, index) {
          return (
            <InputNumber
              value={val}
              suffix={Price.getUnit()}
              onChange={(e) => {
                ctx.setAmount(index, e)
              }}
            />
          )
        },
      },
    ]
  }, [ctx])

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    ctx.submit()
    message.success(t('提交成功'))
    onOk && onOk(e)
  }

  return (
    <>
      <div className='tw-px-6'>
        <section className='tw-mb-4'>
          <SelectFakeOrderField value={ctx.field} onChange={ctx.setField} />
        </section>
        <Table<MerchandiseShape>
          size='small'
          rowKey='key'
          dataSource={ctx.list.slice()}
          columns={columns}
          scroll={{ y: 380 }}
          pagination={false}
        />
        <strong
          className='tw-block tw-w-full tw-text-right'
          style={{ margin: '22px 0', padding: '0 16px' }}
        >
          {t('加单总金额：')}
          {ctx.totalAmount}
          {Price.getUnit()}
        </strong>
        <Divider className='tw-m-0' />
      </div>
      <Divider className='tw-m-0' />
      <div className='tw-py-4 tw-px-5 tw-text-right'>
        <Footer onCancel={onCancel} onOk={handleSubmit} onPrev={onPrev} />
      </div>
    </>
  )
})

Step2.displayName = 'Step2'

export default Step2
