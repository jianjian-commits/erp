import React, { FC } from 'react'
import { Drawer, Table } from 'antd'
import { MaterialOrder_State } from 'gm_api/src/production'
import { t } from 'gm-i18n'
import store from '../store'

const stateMap: any = {
  [MaterialOrder_State.STATE_UNSPECIFIED]: t('未定义状态'),
  [MaterialOrder_State.STATE_NOT_SUBMITTED]: t('未提交'),
  [MaterialOrder_State.STATE_SUBMITTED]: t('已提交'),
  [MaterialOrder_State.STATE_DOUBLE_SUBMITTED]: t('已提交'),
}

const OrderDetailModal: FC<{
  visible: boolean
  setVisible(visible: boolean): void
}> = ({ visible, setVisible }) => {
  const title = `${store.materialOrder.title}-${
    stateMap[store.materialOrder.state]
  }-${store.materialOrder.serialNo}`

  const columns = [
    {
      title: t('物料名称'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('物料分类'),
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: t('需求数量（基本单位）'),
      dataIndex: 'planUsageAmount',
      key: 'planUsageAmount',
      render: (amount: string, record: any) => {
        return `${amount}${record.baseUnit}`
      },
    },
    {
      title: t('领料出库数量（基本单位）'),
      dataIndex: 'receiveAmount',
      key: 'receiveAmount',
      render: (amount: string, record: any) => {
        return `${amount}${record.baseUnit}`
      },
    },
    {
      title: t('实际用料数量（基本单位）'),
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      render: (amount: string, record: any) => {
        return `${amount}${record.baseUnit}`
      },
    },
    {
      title: t('退料数量（基本单位）'),
      dataIndex: 'returnAmount',
      key: 'returnAmount',
      render: (amount: string, record: any) => {
        return `${amount}${record.baseUnit}`
      },
    },
  ]

  return (
    <>
      <Drawer
        title={title}
        placement='right'
        onClose={() => setVisible(false)}
        visible={visible}
        size='large'
      >
        <div className='tw-mb-2'>
          {`${t('领料出库单-')}`}
          <a
            onClick={() =>
              window.open(
                `#/sales_invoicing/produce/picking_stock_out/detail?sheet_id=${store.materialOrder.sheet_id}`,
              )
            }
          >
            {store.materialOrder.stockSheetSerialNo}
          </a>
        </div>
        <Table
          columns={columns}
          dataSource={store.materialOrder.children}
          pagination={false}
        />
      </Drawer>
    </>
  )
}

export default OrderDetailModal
