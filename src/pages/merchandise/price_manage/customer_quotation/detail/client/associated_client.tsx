import React, {
  useState,
  Key,
  useRef,
  useImperativeHandle,
  forwardRef,
  ReactNode,
} from 'react'
import { Modal, Button, message } from 'antd'
import SelectTable, { SelectTableRef } from '@/common/components/select_table'
import { SetCustomerQuotationRelation } from 'gm_api/src/merchandise'
import { PagingParams } from 'gm_api/src/common'
import { ListCustomer, Customer_Type } from 'gm_api/src/enterprise'
import { t } from 'gm-i18n'
import store, { CustomerItem, FilterType } from './store'
import baseStore from '../store'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { ColumnType } from 'antd/lib/table'

export interface AssociatedClientRef {
  handleOpen: () => void
  handleClose: () => void
}

interface AssociatedClientProps {
  title: ReactNode
}

/** 关联客户 */
const AssociatedClient = forwardRef<AssociatedClientRef, AssociatedClientProps>(
  (props, ref) => {
    const { title } = props
    const [visible, setVisible] = useState(false)
    const [disabledList, setDisabledList] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedRows, setSelectedRows] = useState<CustomerItem[]>([])
    const selectTableRef = useRef<SelectTableRef<CustomerItem>>(null)

    const handleOpen = () => {
      setVisible(true)
    }

    const handleClose = () => {
      setVisible(false)
      setDisabledList([])
      setLoading(false)
      setSelectedRows([])
    }

    useImperativeHandle(ref, () => ({
      handleOpen,
      handleClose,
    }))

    const columns: ColumnType<CustomerItem>[] = [
      {
        title: t('客户编码'),
        key: 'customized_code',
        dataIndex: 'customized_code',
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('客户名称'),
        key: 'name',
        dataIndex: 'name',
        render: (text) => <TableTextOverflow text={text} />,
      },
      {
        title: t('客户标签'),
        key: 'customer_label',
        dataIndex: 'customer_label',
        render: (text) => <TableTextOverflow text={text} />,
      },
    ]

    /** 查询客户列表， 不与客户列表数据耦合，故单独写在弹窗组件内 */
    const handleSearch = (
      pagination: PagingParams,
      params: FilterType | undefined,
    ) => {
      return ListCustomer({
        paging: pagination,
        ...params,
        need_customer_label: true,
        need_group_users: true,
        need_quotations: true,
        need_service_periods: true,
        type: Customer_Type.TYPE_SOCIAL,
        level: 2,
      }).then((res) => {
        const {
          customers,
          quotation_relations,
          group_users = {},
          customer_labels = {},
          paging,
          customer_label_relation,
        } = res.response
        const disabledList =
          (quotation_relations
            ?.filter((f) => f.quotation_id === store.quotationId)
            .map((m) => m.customer_id) as string[]) || []

        const list = customers.map((item) => {
          const { sales_group_user_id, create_group_user_id } = item
          const customer_label_id =
            customer_label_relation![item.customer_id]?.values || []
          return {
            ...item,
            sales_group_user:
              group_users[sales_group_user_id || '']?.name || t('无'),
            create_group_user:
              group_users[create_group_user_id || '']?.name || t('无'),
            customer_label:
              customer_labels[customer_label_id[0] || '']?.name || t('无'),
          }
        })

        setDisabledList(disabledList)
        return {
          list,
          count: paging.count || '0',
        }
      })
    }

    const onSelect = (_: Key[], rowData: CustomerItem[]) => {
      setSelectedRows(rowData)
    }

    const handleOk = async () => {
      setLoading(true)
      const relations = selectedRows.map((item) => ({
        customer_id: item.customer_id,
        quotation_id: store.quotationId,
        quotation_type: baseStore.type,
      }))
      SetCustomerQuotationRelation({
        relations,
      } as any)
        .then(() => {
          message.success(t('操作成功'))
          handleClose()
          store.fetchList(true)
          baseStore.getQuotation()
        })
        .finally(() => setLoading(false))
    }

    return (
      <Modal
        title={title}
        destroyOnClose
        style={{ top: 20 }}
        visible={visible}
        width={1000}
        onOk={handleClose}
        onCancel={handleClose}
        bodyStyle={{ padding: '0 16px 0 16px' }}
        footer={
          <>
            <Button key='back' onClick={handleClose}>
              {t('取消')}
            </Button>
            <Button
              type='primary'
              loading={loading}
              onClick={handleOk}
              disabled={selectedRows.length === 0}
            >
              {t('确认')}
            </Button>
          </>
        }
      >
        <SelectTable<CustomerItem, FilterType>
          filter={[
            {
              name: 'customer_label_ids',
              placeholder: t('请选择标签'),
              type: 'select',
              width: 350,
              maxTagCount: 3,
              options: store.customerLabelList,
              mode: 'multiple',
            },
            {
              name: 'q',
              placeholder: t('请输入客户名称/编码'),
              type: 'input',
            },
          ]}
          onSelect={onSelect}
          tableRef={selectTableRef} // 拿数据用
          disabledList={disabledList}
          rowKey='customer_id' // id 唯一项
          selectedKey='name'
          onSearch={handleSearch}
          columns={columns}
        />
      </Modal>
    )
  },
)

export default AssociatedClient
