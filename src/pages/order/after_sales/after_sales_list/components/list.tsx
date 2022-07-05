import React, { FC, useMemo, useState } from 'react'
import { Column, Table, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import moment from 'moment'
import { observer } from 'mobx-react'
import { BoxTable, Modal as GMModal } from '@gm-pc/react'
import { DataAddressName } from '@gm-pc/business'
import store from '../store/list_store'
import ListStatusTabs from './list_status_tabs'
import { RECEIPT_TABS } from '../enum'
import { AfterSaleList } from '../interface'
import SelectOrderList from '../select_order/index'
import { AfterSaleOrder_Status } from 'gm_api/src/aftersale'
import { map_Order_State } from 'gm_api/src/order'
import globalStore from '@/stores/global'
import { orderState4Light } from '@/pages/order/enum'
import { Divider, Space, Modal, Dropdown, Button, Menu } from 'antd'
import { gmHistory as history } from '@gm-common/router'
import { DownOutlined } from '@ant-design/icons'
import AfterSaleTag from '@/pages/order/after_sales/after_sales_list/components/after_sale_tag'
import SelectCustomer from '@/pages/order/after_sales/after_sales_list/components/select_customer'

const { OperationHeader } = TableXUtil

const { confirm } = Modal

const ListTable = observer((props: { loading: boolean }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { list } = store

  /**
   * @description 删除
   * @param id after_sale_order_id
   */
  const handleDelete = (id: string) => {
    confirm({
      title: t('删除'),
      content: t('确认删除该售后单据吗？'),
      okType: 'danger',
      okText: t('删除'),
      onOk: () => {
        store.deleteAfterSales(id).then(() => {
          store.doRequest()
          return null
        })
      },
    })
  }

  /**
   * @description 审核
   * @param id after_sale_order_id
   */
  const handleAudit = (id: string) => {
    history.push(
      `/order/after_sales/after_sales_list/create?serial_no=${id}&type=draft`,
    )
  }

  /**
   * @description 新建售后单
   */
  const handleCreate = (e: any) => {
    if (e.key === '1') {
      // 关联订单
      GMModal.render({
        size: 'lg',
        children: <SelectOrderList />,
        title: '选择订单',
        style: { minHeight: '400px' },
      })
    } else {
      setIsModalVisible(true)
    }
  }

  const createWithoutOrder = (id: string) => {
    setIsModalVisible(false)
    history.push(
      `/order/after_sales/after_sales_list/create?customer_id=${id}&type=create`,
    )
  }

  const createAfterSale = (
    <Menu onClick={handleCreate}>
      <Menu.Item key='1'>{t('关联订单')}</Menu.Item>
      <Menu.Item key='2'>{t('不关联订单')}</Menu.Item>
    </Menu>
  )

  const _columns: Column<AfterSaleList>[] = useMemo(() => {
    return [
      {
        Header: t('售后单号'),
        accessor: 'serial_no',
        minWidth: 100,
        fixed: 'left' as any,
        diyEnable: false,
        Cell: (cellProps) => {
          const {
            original: { after_sale_order_id, serial_no, status },
          } = cellProps
          let URl = '' // draft
          if (AfterSaleOrder_Status.STATUS_TO_RETURNED > Number(status)) {
            URl = `#/order/after_sales/after_sales_list/create?serial_no=${after_sale_order_id}&type=draft`
          } else {
            URl = `#/order/after_sales/after_sales_list/detail?serial_no=${after_sale_order_id}&type=detail`
          }
          return (
            <a
              href={URl}
              className='gm-text-primary gm-cursor'
              rel='noopener noreferrer'
              style={{ textDecoration: 'underline' }}
            >
              {serial_no}
            </a>
          )
        },
      },
      {
        Header: t('订单号'),
        accessor: 'order_serial_no',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => {
          const {
            original: { order_serial_no },
          } = cellProps
          return order_serial_no ? (
            <a
              href={`#/order/order_manage/list/detail?id=${order_serial_no}`}
              className='gm-text-primary gm-cursor'
              rel='noopener noreferrer'
              target='_blank'
              style={{ textDecoration: 'underline' }}
            >
              {order_serial_no}
            </a>
          ) : (
            '-'
          )
        },
      },
      {
        Header: t('售后状态'),
        accessor: 'status',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => {
          const {
            original: { status },
          } = cellProps

          return (
            <div style={{ width: 150 }}>
              <AfterSaleTag status={status} />
            </div>
          )
        },
      },
      {
        Header: t('订单状态'),
        accessor: 'order_state',
        minWidth: 100,
        diyEnable: false,
        Cell: (cellProps) => {
          const {
            original: { order_state, order_serial_no },
          } = cellProps
          const orderState = globalStore.isLite
            ? orderState4Light[order_state as keyof typeof orderState4Light]
            : map_Order_State[order_state!]
          return order_serial_no ? <span>{orderState}</span> : '-'
        },
      },
      {
        Header: t('公司'),
        accessor: 'company',
        minWidth: 100,
        hide: globalStore.isLite,
        Cell: (cellProps) => {
          const {
            original: { company },
          } = cellProps
          return <span>{company}</span>
        },
      },
      {
        Header: t('客户'),
        accessor: 'customer',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { customer },
          } = cellProps
          return <span>{customer}</span>
        },
      },
      {
        Header: t('地理标签'),
        accessor: 'geoTag',
        minWidth: 100,
        show: false,
        hide: globalStore.isLite,
        Cell: (cellProps) => {
          const {
            original: { addresses },
          } = cellProps
          const address = {
            city_id: addresses?.city_id!,
            district_id: addresses?.district_id!,
            street_id: addresses?.street_id!,
          }
          return <DataAddressName address={address} />
        },
      },
      {
        Header: t('商户标签'),
        accessor: 'customer_label',
        minWidth: 100,
        show: false,
        hide: globalStore.isLite,
        Cell: (cellProps) => {
          const {
            original: { customer_label },
          } = cellProps
          return <span>{customer_label || '-'}</span>
        },
      },
      {
        Header: t('建单时间'),
        accessor: 'create_time',
        minWidth: 100,
        Cell: (cellProps) => {
          return (
            <span>
              {moment(new Date(+cellProps.original.create_time!)).format(
                'YYYY-MM-DD HH:mm',
              )}
            </span>
          )
        },
      },

      {
        Header: t('下单时间'),
        accessor: 'order_create_time',
        minWidth: 100,
        Cell: (cellProps) => {
          const {
            original: { order_serial_no, order_create_time },
          } = cellProps
          return order_serial_no ? (
            <span>
              {moment(new Date(+order_create_time!)).format('YYYY-MM-DD HH:mm')}
            </span>
          ) : (
            '-'
          )
        },
      },
      {
        Header: t('收货时间'),
        accessor: 'receive_time',
        minWidth: 100,
        show: false,
        Cell: (cellProps) => {
          return (
            <span>
              {moment(new Date(+cellProps.original.receive_time!)).format(
                'YYYY-MM-DD HH:mm',
              )}
            </span>
          )
        },
      },
      {
        Header: t('单据备注'),
        id: 'remark',
        minWidth: 100,
        accessor: 'remark',
        hide: globalStore.isLite,
        Cell: (cellProps) => {
          const {
            original: { remark },
          } = cellProps
          return <span>{remark || '-'}</span>
        },
      },
      {
        Header: t('建单人'),
        accessor: 'creator',
        minWidth: 100,
        show: false,
        hide: globalStore.isLite,
        Cell: (cellProps) => {
          const {
            original: { creator },
          } = cellProps
          return <span>{creator || '-'}</span>
        },
      },
      {
        Header: OperationHeader,
        accessor: 'after_sales_id7',
        width: TableXUtil.TABLE_X.WIDTH_OPERATION,
        fixed: 'right' as any,
        diyItemText: t('操作'),
        diyEnable: false,
        Cell: (cellProps) => {
          const {
            original: { after_sale_order_id, status },
          } = cellProps
          return (
            <Space>
              {/* 待提交操作 */}
              {status === AfterSaleOrder_Status.STATUS_TO_SUBMIT && (
                <a onClick={() => handleDelete(after_sale_order_id)}>
                  {t('删除')}
                </a>
              )}
              {/* 待审核操作 */}
              {status === AfterSaleOrder_Status.STATUS_TO_REVIEWED && (
                <a onClick={() => handleAudit(after_sale_order_id)}>
                  {t('审核')}
                </a>
              )}
            </Space>
          )
        },
      },
    ]
  }, [])

  return (
    <BoxTable
      action={
        <>
          <Dropdown overlay={createAfterSale}>
            <Button type='primary'>
              <Space>
                {t('新建售后单')}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </>
      }
    >
      <Table<AfterSaleList>
        isDiy
        id='after_sales_list'
        keyField='after_sale_order_id'
        loading={props.loading}
        columns={_columns}
        data={list.slice()}
      />
      <SelectCustomer
        isModalVisible={isModalVisible}
        closeModal={() => setIsModalVisible(false)}
        createWithoutOrder={createWithoutOrder}
      />
    </BoxTable>
  )
})

interface ListProps {
  onFetchList: () => any
  loading: boolean
}
const List: FC<ListProps> = observer((props) => {
  const { activeType } = store
  const { onFetchList } = props

  const handleChange = (type: AfterSaleOrder_Status) => {
    store.changeFilter('status', type)
    store.changeActiveType(type)
    onFetchList()
  }

  return (
    <ListStatusTabs
      active={activeType}
      onChange={handleChange}
      TabComponent={ListTable}
      tabData={RECEIPT_TABS}
    />
  )
})

export default List
export { ListTable }
