import React, { FC, useState } from 'react'
import { i18next } from 'gm-i18n'

import { Table } from '@gm-pc/table-x'

import { Flex, Price, Button } from '@gm-pc/react'

import { observer } from 'mobx-react'
import store from '../store'
import { getFormatTimeForTable, toFixedByType } from '@/common/util'
import globalStore from '@/stores/global'

interface Props {
  ensureFunc: (selected: string) => void
  cancelFunc: () => void
}

const PaymentSlipTable: FC<Props> = observer((props) => {
  const { ensureFunc, cancelFunc } = props

  const [selected, setSelected] = useState<any[]>([])

  const { paymentSlipList } = store

  const handleEnsure = () => {
    ensureFunc(selected![0])
  }

  return (
    <div className='gm-padding-left-10 gm-padding-right-10'>
      <p className='gm-padding-top-5'>
        {i18next.t('当前供应商已有')}
        <span className='gm-color-primary'>{`${paymentSlipList.length}个`}</span>
        {i18next.t('待提交的结款单，请选择要加入的结款单')}
      </p>
      <Table
        isSelect
        style={{ maxHeight: '500px' }}
        data={paymentSlipList.slice()}
        keyField='settle_sheet_id'
        selected={selected}
        onSelect={setSelected}
        selectType='radio'
        columns={[
          {
            id: 'create_time',
            Header: i18next.t('建单日期'),
            minWidth: 120,
            accessor: (d: any) => {
              return getFormatTimeForTable('YYYY-MM-DD', d.create_time)
            },
          },
          {
            Header: i18next.t('结款单号'),
            minWidth: 120,
            accessor: 'settle_sheet_serial_no',
          },
          {
            id: 'total_price',
            Header: i18next.t('单据总金额'),
            minWidth: 80,
            accessor: (d: any) => {
              return (
                <Price
                  value={+toFixedByType(d.total_price, 'dpSupplierSettle')}
                  precision={globalStore.dpSupplierSettle}
                />
              )
            },
          },
          {
            id: 'include_receipt',
            Header: i18next.t('包含入库/退货单数'),
            minWidth: 120,
            accessor: (d: any) => {
              return d.item_ids.item_ids.length
            },
          },
        ]}
      />
      <Flex className='gm-margin-top-10' justifyEnd>
        <Button className='gm-margin-right-5' onClick={cancelFunc}>
          {i18next.t('取消')}
        </Button>
        <Button
          type='primary'
          onClick={handleEnsure}
          disabled={selected.length === 0}
        >
          {i18next.t('确认')}
        </Button>
      </Flex>
    </div>
  )
})

export default PaymentSlipTable
