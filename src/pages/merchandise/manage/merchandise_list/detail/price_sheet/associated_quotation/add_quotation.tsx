import React, { useState, Key } from 'react'
import { Button } from 'antd'
import SelectTable, { Pagination } from '@/common/components/select_table'
import {
  ListQuotationForBindingSku,
  map_Quotation_Type,
  Quotation,
  QuotationSortField,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import baseStore from '../../store'
import { t } from 'gm-i18n'
import store from './store'
import { ColumnType } from 'antd/lib/table'
import TableTextOverflow from '@/common/components/table_text_overflow'
import _ from 'lodash'
import { getChildEffectiveTime } from '@/pages/merchandise/manage/util'
import { QUOTATION_TYPE_OPTIONS } from '@/pages/merchandise/price_manage/customer_quotation/constants'

type Params = {
  q: string
  quotation_type: Quotation_Type
}
interface AddMerchandiseProps {
  next: () => void
  handleClose: () => void
}
/**
 * 添加报价单List
 */
const AddMerchandise = (props: AddMerchandiseProps) => {
  const { next, handleClose } = props
  const [selectedRows, setSelectedRows] = useState<Quotation[]>(
    store.selectedRows,
  )
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(
    store.selectedRowKeys,
  )
  const [disabledList, setDisabledList] = useState<string[]>([])

  const columns: ColumnType<Quotation>[] = [
    {
      title: t('报价单名称'),
      key: 'inner_name',
      dataIndex: 'inner_name',
      width: 180,
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('报价单编码'),
      key: 'serial_no',
      dataIndex: 'serial_no',
    },
    {
      title: t('对外简称'),
      key: 'outer_name',
      dataIndex: 'outer_name',
      width: 180,
      render: (text) => <TableTextOverflow text={text} />,
    },
    {
      title: t('类型'),
      key: 'type',
      dataIndex: 'type',
      width: 110,
      render: (text) => t(map_Quotation_Type[text]),
    },
    {
      title: t('生效日期'),
      key: 'start_time',
      dataIndex: 'start_time',
      width: 220,
      align: 'center',
      render: (_, record) => t(getChildEffectiveTime(record)),
    },
  ]

  const handleNext = () => {
    store.setSelectedInfo(selectedRowKeys, selectedRows)
    if (typeof next === 'function') next()
  }

  const handleCancel = () => {
    if (typeof handleClose === 'function') handleClose()
    setSelectedRowKeys([])
    setSelectedRows([])
  }

  const onSelect = (selectedRowKeys: Key[], rowData: Quotation[]) => {
    setSelectedRowKeys(selectedRowKeys)
    setSelectedRows(rowData)
  }

  const fetchList = (paging: Pagination, values: Params | undefined) => {
    return ListQuotationForBindingSku({
      filter_params: {
        ...values,
        quotation_type:
          values?.quotation_type === Quotation_Type.UNSPECIFIED
            ? undefined
            : values?.quotation_type,
        quotation_types:
          !values || values?.quotation_type === Quotation_Type.UNSPECIFIED
            ? [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC]
            : undefined,
        sku_id: baseStore.skuId,
        parent_quotation_filter: true,
        periodic_time: `${Date.now()}`,
      },
      sort_by: [{ field: Number(QuotationSortField.QUOTATION_ID), desc: true }],
      paging,
    }).then((json) => {
      const {
        bound_quotation_ids = [],
        paging,
        quotations = [],
      } = json.response
      setDisabledList(bound_quotation_ids)

      const newQuotation = _.map(quotations, (quotationItem) => {
        if (quotationItem.type === Quotation_Type.PERIODIC) {
          const { parent_child_inner_name = '', parent_serial_no = '' } =
            quotationItem
          return {
            ...quotationItem,
            inner_name: parent_child_inner_name,
            serial_no: parent_serial_no,
          }
        } else {
          return quotationItem
        }
      })

      return {
        list: newQuotation,
        count: paging.count,
      }
    })
  }

  return (
    <>
      <SelectTable<Quotation, Params>
        filter={[
          {
            name: 'quotation_type',
            type: 'select',
            options: QUOTATION_TYPE_OPTIONS,
            initialValue: Quotation_Type.UNSPECIFIED,
          },
          {
            name: 'quotation_q',
            placeholder: t('请输入报价单名称/编码'),
            type: 'input',
          },
        ]}
        selectedKey='inner_name'
        onSelect={onSelect}
        disabledList={disabledList}
        defaultSelectedRowKeys={store.selectedRowKeys}
        defaultSelectedRows={store.selectedRows}
        rowKey='quotation_id'
        onSearch={fetchList}
        limitCount={50}
        columns={columns}
      />
      <div className='gm-modal-footer'>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button
          type='primary'
          onClick={handleNext}
          disabled={selectedRowKeys.length === 0}
        >
          {t('下一步')}
        </Button>
      </div>
    </>
  )
}

export default AddMerchandise
