import React, { FC } from 'react'
import store from '../store/store'
import { TableList, TableListColumn } from '@gm-pc/business'
import { Button, Tip, Modal } from '@gm-pc/react'
import { Column, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import TableTotalText from '@/common/components/table_total_text'
import { BaseTableListType, ListType } from '../interface'
import { observer, Observer } from 'mobx-react'
import ConfirmChildren from './confirm_children'

import { useGMLocation } from '@gm-common/router'
import CellSpecialTax from './cell_special_tax'
const tableId = 'supplier_marchanise_list'

const List: FC<BaseTableListType> = observer(({ ...res }) => {
  const { name, supplier_id } = useGMLocation<{
    name: string
    supplier_id: string
  }>().query
  const columns: Column[] = [
    {
      Header: t('商品名称'),
      id: 'name',
      accessor: 'name',
    },
    {
      Header: t('商品编号'),
      id: 'customize_code',
      accessor: 'customize_code',
    },
    {
      Header: t('一级分类'),
      id: 'category1_name',
      accessor: 'category1_name',
    },
    {
      Header: t('二级分类'),
      id: 'category2_name',
      accessor: 'category2_name',
    },
    {
      Header: t('默认进项税率'),
      id: 'input_tax',
      Cell: (cellProps) => {
        const {
          original: { input_tax },
        } = cellProps
        return input_tax + '%'
      },
    },
    {
      Header: t('供应商特殊进项税率'),
      id: 'supplier_input_tax',
      Cell: (d) => {
        return (
          <Observer>
            {() => {
              const { is_editing, supplier_input_taxs } = d.original
              return is_editing ? (
                <CellSpecialTax supplier_id={supplier_id} index={d.index} />
              ) : (
                <span>
                  {supplier_input_taxs?.supplier_input_tax?.[supplier_id]
                    ? supplier_input_taxs?.supplier_input_tax?.[supplier_id] +
                      '%'
                    : '未设置'}
                </span>
              )
            }}
          </Observer>
        )
      },
    },
  ] as TableListColumn<ListType>[]

  const handleEdit = (index: number) => {
    store.setSupplierTax(
      store.list[index].supplier_input_taxs?.supplier_input_tax || {},
    )
    store.changeList(index, 'is_editing', true)
  }
  const handleCancel = (index: number) => {
    store.setSupplierTax({})
    store.changeList(index, 'is_editing', false)
  }
  const handleSave = (index: number) => {
    store.updateSku(index)
    store.changeList(index, 'is_editing', false)
  }
  const handleHide = (hide: boolean) => {
    Modal.hide()
    if (hide) {
      store.updateFilter()
    }
  }
  const DialogWith = () => {
    Modal.render({
      title: t('批量设置特殊进项税'),
      children: <ConfirmChildren onHide={handleHide} />,
      onHide: Modal.hide,
      style: {
        width: '600px',
      },
    })
  }
  return (
    <TableList<ListType>
      {...res}
      isUpdateEffect={false}
      info={
        <TableTotalText data={[{ label: t('当前供应商'), content: name }]} />
      }
      action={
        <Button type='primary' onClick={DialogWith}>
          {t('设置特殊进项税率')}
        </Button>
      }
      id={tableId}
      keyField='id'
      service={store.getList}
      filter={store.filter}
      data={store.list}
      paginationOptions={{
        paginationKey: 'merchandise_sales_ituation',
        defaultPaging: { need_count: true },
      }}
      columns={[
        ...columns,
        {
          Header: t('操作'),
          fixed: 'right',
          Cell: (d) => {
            return (
              <Observer>
                {() => {
                  return (
                    <TableXUtil.OperationCellRowEdit
                      isEditing={d.original.is_editing}
                      onClick={() => handleEdit(d.index)}
                      onCancel={() => handleCancel(d.index)}
                      onSave={() => handleSave(d.index)}
                    />
                  )
                }}
              </Observer>
            )
          },
        },
      ]}
    />
  )
})
export default List
