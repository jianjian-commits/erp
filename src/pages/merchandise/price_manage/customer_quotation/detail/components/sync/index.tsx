import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
  useMemo,
} from 'react'
import { observer } from 'mobx-react'
import { Modal, Button, message } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import SelectTable, {
  Pagination,
  SelectTableRef,
} from '@/common/components/select_table'
import { Order_State, Order_Status } from 'gm_api/src/order'
import _ from 'lodash'
import TableTextOverflow from '@/common/components/table_text_overflow'
import moment from 'moment'
import getOrderList, { OrderShape } from './service/get_order_list'
import useCustomerOptionList from './service/use_customer_list'
import '../../../style.less'
import { Link } from 'react-router-dom'
import { Quotation_Type } from 'gm_api/src/merchandise'
import { devWarn } from '@gm-common/tool'
import { BatchSyncPriceToOrder } from 'gm_api/src/orderlogic'
import globalStore from '@/stores/global'
import {
  FILTER_ORDER_STATE_OPTIONS,
  FILTER_ORDER_STATE_VALUE,
} from './constant'

interface QueryShape {
  time: {
    begin: Date
    end: Date
  }
  customer: string[]
  status?: Order_State[]
}

interface SyncModalProps {
  /**
   * 父报价单 id (用于筛选客户)
   */
  parentQuotationId?: string
  /**
   * 报价单 id
   */
  quotationId?: string
}

export interface SyncModalRef {
  openModal: () => void
}

const SyncModal = observer(
  forwardRef<SyncModalRef, SyncModalProps>((props, modalRef) => {
    const { parentQuotationId, quotationId } = props

    const selectTableRef = useRef<SelectTableRef<any>>(null)
    const [isShow, setIsShow] = useState(false)
    const [dateRange] = useState(() => ({
      min: moment().add(-1, 'y').toDate(),
      max: moment().toDate(),
    }))
    const [initialTime] = useState(() => ({
      begin: moment().startOf('day').add(-29, 'days').toDate(),
      end: moment().endOf('day').toDate(),
    }))
    const [submitLoading] = useState(false)

    useImperativeHandle(
      modalRef,
      () => ({
        openModal: () => setIsShow(true),
      }),
      [],
    )

    // Select - 商户列表
    const [customerOptions, searchCustomer] = useCustomerOptionList()

    /** 查询客户 */
    const handleSearchCustomer = useMemo(() => {
      const id = parentQuotationId || quotationId
      const load = (value: string) => {
        if (value) {
          searchCustomer({ quotationId: id!, keyword: value })
        }
      }
      return _.debounce(load, 500)
    }, [quotationId, parentQuotationId, searchCustomer])

    /** 获取订单列表 */
    const fetchList = (paging: Pagination, query?: QueryShape) => {
      const { customer = [], time = initialTime, status } = query || {}
      const notQuotationId = _.isEmpty(_.trim(quotationId))
      if (notQuotationId) {
        devWarn(() => {
          console.error('[SyncModal]: 缺少报价单 id')
        })
      }

      if (notQuotationId) {
        return Promise.resolve({
          list: [],
          count: '0',
        })
      }

      return getOrderList({
        customerIdList: customer,
        quotationId: quotationId!,
        beginTime: `${time.begin.getTime()}`,
        endTime: `${time.end.getTime()}`,
        paging,
        status: _.isEmpty(status) ? FILTER_ORDER_STATE_VALUE : status,
      })
    }

    const handleClose = () => {
      setIsShow(false)
    }

    /** 确定 */
    const handleOk = () => {
      const orderIdList = (selectTableRef.current?.selectedRowKeys ||
        []) as string[]
      if (_.isEmpty(orderIdList)) {
        message.error(t('请选择订单'))
        return
      }
      BatchSyncPriceToOrder({
        filter: {
          common_list_order: {
            order_ids: orderIdList,
          },
          paging: {
            limit: 999,
          },
        },
        all: false,
      }).then(() => {
        handleClose()
        globalStore.showTaskPanel('1')
        return null
      })
    }

    const columns: ColumnType<OrderShape>[] = [
      {
        title: t('订单号'),
        key: 'serialNo',
        dataIndex: 'serialNo',
        render: (value, order) => {
          const isMenuOrder =
            order.quotationType === Quotation_Type.WITH_TIME ||
            order.status & Order_Status.STATUS_HAS_COMBINE_SSU

          return (
            <Link
              className='gm-text-primary'
              style={{ textDecoration: 'underline' }}
              rel='noopener noreferrer'
              target='_blank'
              to={`/order/order_manage/list/${
                isMenuOrder ? 'menu_detail' : 'detail'
              }?id=${value}&type=${order.appType}`}
            >
              {value}
            </Link>
          )
        },
      },
      {
        title: t('下单时间'),
        key: 'orderTime',
        dataIndex: 'orderTime',
      },
      {
        title: t('商户'),
        key: 'customerName',
        dataIndex: 'customerName',
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('下单金额'),
        key: 'price',
        dataIndex: 'price',
        width: 150,
      },
    ]

    return (
      <Modal
        destroyOnClose
        maskClosable={false}
        title={t('价格同步至订单')}
        visible={isShow}
        style={{ top: 20 }}
        bodyStyle={{ margin: '0px 16px', padding: '16px 16px 0 16px' }}
        width={1250}
        onCancel={handleClose}
        footer={[
          <Button key='cancel' disabled={submitLoading} onClick={handleClose}>
            {t('取消')}
          </Button>,
          <Button
            key='confirm'
            type='primary'
            loading={submitLoading}
            onClick={handleOk}
          >
            {t('确认')}
          </Button>,
        ]}
      >
        <div>
          <SelectTable
            tableRef={selectTableRef} // 拿数据用
            selectedKey='serialNo'
            key='orderId'
            rowKey='orderId' // id 唯一项
            onSearch={fetchList}
            columns={columns}
            limitCount={50}
            filter={[
              {
                name: 'time',
                type: 'gmDateRangePicker',
                initialValue: initialTime,
                max: dateRange.max,
                min: dateRange.min,
              },
              {
                name: 'status',
                type: 'select',
                mode: 'multiple',
                placeholder: t('全部状态'),
                options: FILTER_ORDER_STATE_OPTIONS,
                width: 200,
                maxTagCount: 'responsive',
              },
              {
                name: 'customer',
                type: 'select',
                mode: 'multiple',
                showSearch: true,
                showArrow: false,
                filterOption: false,
                allowClear: true,
                onSearch: handleSearchCustomer,
                width: 258,
                maxTagCount: 'responsive',
                notFoundContent: null,
                options: customerOptions,
                placeholder: t('全部商户'),
              },
            ]}
          />
        </div>
      </Modal>
    )
  }),
)

SyncModal.displayName = 'SyncModal'

export default SyncModal
