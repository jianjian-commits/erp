import React, { Key, FC, useEffect, useRef, useMemo } from 'react'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { Customer_Type, ListCustomer, Customer } from 'gm_api/src/enterprise'
import { ColumnType } from 'antd/lib/table'
import { t } from 'gm-i18n'
import SelectTable, {
  Pagination,
  SelectTableRef,
} from '@/common/components/select_table'
import createStore from '../store'
// import store from '../../../store'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { CustomerList, Params } from '../interface'
interface AddClientProps {
  rowType: string
}
const AddClient: FC<AddClientProps> = ({ rowType }) => {
  // @ts-ignore
  const selectTableRef = useRef<SelectTableRef>(null)
  const {
    setSelectedRowKeys,
    setSelectedRow,
    client_selectedRowKeys,
    client_selectedRow,
    getListCustomerLabel,
    labelOptions,
  } = createStore
  // const { disableClientList } = store
  useEffect(() => {
    getListCustomerLabel()
  }, [])

  const onSelect = (selectedRowKeys: Key[], rowData: Customer[]) => {
    setSelectedRowKeys(selectedRowKeys, 'client')
    setSelectedRow(rowData, 'client')
  }
  const columns: ColumnType<CustomerList>[] = [
    {
      title: t('客户编码'),
      key: 'customer_code',
      dataIndex: 'customer_code',
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
  /**
   * @description 请求客户列表哇
   */
  const fetchList = (paging: Pagination, params: Params | undefined) => {
    const req = {
      paging,
      level: 2,
      q: params?.q || '',
      type: Customer_Type.TYPE_SOCIAL,
      customer_label_ids: params?.customer_label_ids || [],
      need_customer_label: true,
      need_group_users: true,
      need_quotations: true,
      need_service_periods: true,
    }
    return ListCustomer(req).then((json) => {
      const { customers, paging, customer_label_relation, customer_labels } =
        json.response

      const list = _.map(customers, (item) => {
        const label_id =
          customer_label_relation?.[item.customer_id]?.values?.[0] || ''
        const customer_label =
          (label_id && customer_labels?.[label_id]?.name) || '-'

        return {
          ...item,
          customer_label: customer_label || '-',
          name: item.name || '-',
          customer_code: item.customized_code! || '-',
        }
      })
      return {
        list,
        count: paging.count,
      }
    })
  }

  const defaultSelectedRowKeys = useMemo(() => {
    return client_selectedRowKeys.slice()
  }, [client_selectedRowKeys.length])

  const defaultSelectedRows = useMemo(() => {
    return client_selectedRow.slice()
  }, [client_selectedRow.length])

  return (
    <SelectTable<CustomerList, Params>
      filter={[
        {
          name: 'customer_label_ids',
          type: 'select',
          placeholder: t('请选择标签'),
          options: labelOptions,
          width: '260px',
          allowClear: true,
        },
        {
          name: 'q',
          placeholder: t('请输入客户名称/编码'),
          type: 'input',
        },
      ]}
      selectedKey='name'
      onSelect={onSelect}
      defaultSelectedRowKeys={defaultSelectedRowKeys || []}
      defaultSelectedRows={defaultSelectedRows || []}
      tableRef={selectTableRef}
      rowKey='customer_id'
      limitCount={100}
      type={rowType}
      onSearch={fetchList}
      columns={columns}
    />
  )
}
export default observer(AddClient)
