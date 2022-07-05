import { t } from 'gm-i18n'
import React, { useRef } from 'react'
import { observer } from 'mobx-react'
import store from '../store'
import { TableList, TableListColumn } from '@gm-pc/business'
import TaxCell from './cell_tax'
import TaxCategoryCell from './cell_tax_category'
import TableTextOverflow from '@/common/components/table_text_overflow'
import { getCategoryName } from '@/common/util'
import EditTaxModal, { EditTaxModalRef } from './edit_tax_modal'
import { Sku } from 'gm_api/src/merchandise'

const tableId = 'merchandise_setting_tax'

/** 税率Table */
const List = observer(() => {
  const modalRef = useRef<EditTaxModalRef>(null)
  /** 编辑税率 */
  const handleEdit = (record: Sku) => {
    modalRef.current && modalRef.current.handleOpen(record)
    //
  }

  const columns: TableListColumn<Sku>[] = [
    {
      Header: t('商品名称'),
      id: 'name',
      accessor: 'name',
      Cell: (cellProps) => <TableTextOverflow text={cellProps.value} />,
    },
    {
      Header: t('商品编码'),
      id: 'customize_code',
      accessor: 'customize_code',
      Cell: (cellProps) => <TableTextOverflow text={cellProps.value} />,
    },
    {
      Header: t('商品分类'),
      id: 'category_id',
      accessor: 'category_id',
      Cell: (cellProps) => (
        <TableTextOverflow
          text={getCategoryName(store.catagoryMap, cellProps.value)}
        />
      ),
    },

    {
      Header: t('税收分类'),
      id: 'tax_category_name',
      Cell: (cellProps) => {
        const { index } = cellProps
        return <TaxCategoryCell index={index} />
      },
    },
    {
      Header: t('销项税率'),
      id: 'tax',
      Cell: (cellProps) => {
        const { index } = cellProps
        return <TaxCell index={index} type='output' />
      },
    },
    {
      Header: t('进项税率'),
      id: 'input_tax',
      Cell: (cellProps) => {
        const { index } = cellProps
        return <TaxCell index={index} type='input' />
      },
    },
    {
      Header: t('操作'),
      id: 'action',
      fixed: 'right',
      Cell: (d) => (
        <a type='link' onClick={() => handleEdit(d.original)}>
          {t('编辑')}
        </a>
      ),
    },
  ]

  return (
    <div
      className='gm-site-card-border-less-wrapper-114'
      style={{ padding: '0 16px' }}
    >
      <TableList<Sku>
        isUpdateEffect={false}
        headerProps={{ hidden: true }}
        keyField='sku_id'
        columns={columns}
        id={tableId}
        filter={store.filter}
        service={store.getSkuList}
        paginationOptions={{
          paginationKey: tableId,
          defaultPaging: { need_count: true },
        }}
      />
      <EditTaxModal ref={modalRef} />
    </div>
  )
})

export default List
