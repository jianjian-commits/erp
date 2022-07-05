import React, { useMemo, FC } from 'react'
import { Table, BatchActionDefault, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import {
  BoxTable,
  BoxTableInfo,
  Price,
  Tip,
  Modal,
  Flex,
  Button,
  Dialog,
  BoxTableProps,
} from '@gm-pc/react'
import Big from 'big.js'
import moment from 'moment'
import TableTotalText from '@/common/components/table_total_text'
import { map_Order_PayState } from 'gm_api/src/order'
import store from '../store'
import { OrderInfo, ScanSearchType } from '../interface'
import SelectTable from './select_table'
import BatchChangeReceiptStatus from './batch_change_receipt_status'
import ScanDrawer from './scan_drawer'
import { getReceiptStatusText } from '@/common/util'

const List: FC<Pick<BoxTableProps, 'pagination'>> = observer(
  ({ pagination }) => {
    const { list, paging } = store

    const _columns: Column<OrderInfo>[] = useMemo(() => {
      return [
        {
          Header: t('建单时间'),
          accessor: 'order_time',
          minWidth: 100,
          fixed: 'left',
          Cell: (cellProps) =>
            moment(new Date(+cellProps?.original?.create_time!)).format(
              'YYYY-MM-DD HH:mm:ss',
            ),
        },
        {
          Header: t('出库时间'),
          accessor: 'outstock_time',
          minWidth: 100,
          fixed: 'left',
          Cell: (cellProps) => {
            const { outstock_time } = cellProps?.original
            if (!outstock_time || outstock_time === '0') return '-'

            return moment(new Date(+outstock_time!)).format('YYYY-MM-DD HH:mm')
          },
        },
        {
          Header: t('订单号'),
          id: 'serial_no',
          minWidth: 100,
          fixed: 'left',
          accessor: (d) => (
            <a
              href={`#/order/order_manage/list/detail?id=${d.serial_no}`}
              className='gm-text-primary'
              style={{ textDecoration: 'underline' }}
              rel='noopener noreferrer'
            >
              {d.serial_no}
            </a>
          ),
        },
        {
          Header: t('公司名称'),
          accessor: 'company',
          minWidth: 100,
          Cell: (cellProps) => {
            const {
              original: { company },
            } = cellProps
            return <span>{company || '-'}</span>
          },
        },
        {
          Header: t('客户名称'),
          accessor: 'customer',
          minWidth: 100,
          Cell: (cellProps) => {
            const {
              original: { customer },
            } = cellProps
            return <span>{customer || '-'}</span>
          },
        },
        {
          Header: t('商户标签'),
          accessor: 'customer_label',
          minWidth: 100,
          Cell: (cellProps) => {
            const {
              original: { customer_label },
            } = cellProps
            return <span>{customer_label || '-'}</span>
          },
        },
        {
          Header: t('结款周期'),
          accessor: 'credit_type',
          minWidth: 100,
          Cell: (cellProps) => {
            const {
              original: { credit_type },
            } = cellProps
            return <span>{credit_type || '-'}</span>
          },
        },
        {
          Header: t('销售额'),
          accessor: 'sale_price',
          minWidth: 100,
          Cell: (cellProps) => {
            const { sale_price } = cellProps.original
            return (
              Big(Number(sale_price) || 0).toFixed(2) + Price.getUnit() || '-'
            )
          },
        },
        {
          Header: t('不含税销售额'),
          accessor: 'sale_price_no_tax',
          minWidth: 100,
          Cell: (cellProps) => {
            const { sale_price_no_tax } = cellProps.original
            return (
              Big(Number(sale_price_no_tax) || 0).toFixed(2) +
                Price.getUnit() || '-'
            )
          },
        },
        {
          Header: t('税额'),
          accessor: 'detail_sum_tax_price',
          minWidth: 100,
          Cell: (cellProps) => {
            const { detail_sum_tax_price } = cellProps.original
            return (
              Big(Number(detail_sum_tax_price) || 0).toFixed(2) +
                Price.getUnit() || '-'
            )
          },
        },
        {
          Header: t('回单状态'),
          id: 'status',
          minWidth: 80,
          Cell: (cellProps) => {
            const { status } = cellProps.original
            return getReceiptStatusText(status!)
          },
        },
        {
          Header: t('结款状态'),
          accessor: 'pay_state',
          minWidth: 100,
          Cell: (cellProps) => {
            const {
              original: { pay_state },
            } = cellProps
            return <span>{map_Order_PayState[pay_state!] || '-'}</span>
          },
        },
        {
          Header: t('锁定状态'),
          accessor: 'status',
          minWidth: 100,
          Cell: (cellProps) => {
            const { status } = cellProps.original
            return (
              <div>
                {(Number(status)! & (1 << 8)) === 1 << 8
                  ? t('锁定')
                  : t('未锁定') || '-'}
              </div>
            )
          },
        },
      ] as Column<OrderInfo>[]
    }, [])

    // 新建对账单
    const handleEnsureAdd = (isSelectAll: boolean, selectedIds: string[]) => {
      store.createSettleSheet(isSelectAll, selectedIds).then(() => {
        store.doRequest()
        Modal.hide()
        return null
      })
    }

    const renderAddToSettlementModal = (
      isSelectAll: boolean,
      selected: string[],
    ) => {
      Modal.hide()

      Modal.render({
        title: t('加入对账单'),
        onHide: Modal.hide,
        children: (
          <SelectTable
            selectIds={selected}
            cancelFunc={Modal.hide}
            ensureFunc={(settleSelectedId) => {
              store
                .addInExistSettlement(isSelectAll, settleSelectedId, selected)
                .then(() => {
                  Modal.hide()
                  store.doRequest()
                  return null
                })
            }}
          />
        ),
      })
    }

    const handleBatchAddToSettlement = (
      selected: string[], // 订单ID
      isSelectAll: boolean,
    ) => {
      // 选中的订单数据
      const selectedData = _.filter(store.list, (item) =>
        selected.includes(item.order_id),
      )

      const group = _.groupBy(selectedData, (value) => {
        return value.customer_id_l1
      })

      if (_.keys(group).length > 1) {
        Tip.danger(t('只有相同公司的订单才能加入对账单'))
        return false
      }

      return store
        .fetchAlreadyExistSettlement(
          isSelectAll,
          isSelectAll ? undefined : selectedData![0]?.customer_id_l1!,
        )
        .then(() => {
          const { settlement_list } = store
          if (settlement_list.length) {
            Modal.render({
              children: (
                <div>
                  <span>
                    {t('当前公司已有待提交的对账单，是否加入已有对账单?')}
                  </span>
                  <Flex
                    className='gm-margin-top-10'
                    style={{ flexDirection: 'row-reverse' }}
                  >
                    <Button
                      className='gm-margin-left-5'
                      onClick={() => handleEnsureAdd(isSelectAll, selected)}
                    >
                      {t('新建结款单')}
                    </Button>
                    <Button
                      type='primary'
                      onClick={() =>
                        renderAddToSettlementModal(isSelectAll, selected)
                      }
                    >
                      {t('加入已有结款单')}
                    </Button>
                  </Flex>
                </div>
              ),
              title: t('加入对账单'),
              onHide: Modal.hide,
              size: 'sm',
            })
          } else {
            Dialog.render({
              children: <span>{t('是否将所选订单加入对账单?')}</span>,
              title: t('加入对账单'),
              size: 'sm',
              buttons: [
                { text: t('取消'), onClick: Dialog.hide, btnType: 'default' },
                {
                  text: t('确定'),
                  onClick: () => handleEnsureAdd(isSelectAll, selected),
                  btnType: 'primary',
                },
              ],
            })
          }
          return null
        })
    }
    const handleBatchChangeReceiptStatus = (
      selected: string[],
      isSelectAll: boolean,
    ) => {
      const onOk = (status: number) => {
        store.batchChangeRecieptStatus(isSelectAll, selected, status)
      }
      Modal.render({
        children: <BatchChangeReceiptStatus onOk={onOk} />,
        size: 'md',
        title: t('批量修改回单状态'),
        onHide: Modal.hide,
      })
    }

    const onScan: ScanSearchType = (order_id, afterFunc) => {
      store.changeReceiptStatus(order_id, afterFunc)
    }
    return (
      <BoxTable
        pagination={pagination}
        info={
          <BoxTableInfo>
            <TableTotalText
              data={[
                {
                  label: t('订单总数'),
                  content: paging.count,
                },
              ]}
            />
          </BoxTableInfo>
        }
      >
        <Table
          isBatchSelect
          id='supplier_settlement_id'
          keyField='order_id'
          fixedSelect
          columns={_columns}
          data={list}
          batchActions={[
            {
              children: (
                <BatchActionDefault>{t('批量加入对账单')}</BatchActionDefault>
              ),
              onAction: (selected: string[], isSelectAll: boolean) =>
                handleBatchAddToSettlement(selected, isSelectAll),
            },
            {
              children: (
                <BatchActionDefault>{t('批量修改回单状态')}</BatchActionDefault>
              ),
              onAction: (selected: string[], isSelectAll: boolean) =>
                handleBatchChangeReceiptStatus(selected, isSelectAll),
            },
          ]}
        />
        <ScanDrawer onSearch={onScan} />
      </BoxTable>
    )
  },
)

export default List
