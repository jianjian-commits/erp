import { history } from '@/common/service'
import {
  BoxTable,
  Button,
  Modal,
  BoxTableInfo,
  BoxTableProps,
} from '@gm-pc/react'
import { Table, Column } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import React from 'react'
import store from '../store'
import BatchImportSupplierModal from './batch_import'
import TableTotalText from '@/common/components/table_total_text'
import globalStore from '@/stores/global'
import { getUnNillText } from '@/common/util'

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  paging: any
  run: any
}

/**
 * 设置供应商列表的表头
 * 供应商编号: customized_code
 * 供应商名称: name
 * 联系电话: phone
 */
const columns: Column[] = [
  {
    Header: t('供应商编号'),
    accessor: 'customized_code',
    minWidth: 80,
    Cell: (cellProps) => {
      const { supplier_id, customized_code, supplier_type } = cellProps.original
      return (
        <>
          {supplier_type === 2 ? (
            <span style={{ color: '#ccc' }}>{customized_code}</span>
          ) : (
            <a
              // eslint-disable-next-line react/jsx-handler-names
              onClick={() => {
                history.push(
                  `/purchase/supplier_manage/supplier_message/detail?supplier_id=${supplier_id}`,
                )
              }}
              className='gm-cursor'
            >
              {customized_code}
            </a>
          )}
        </>
      )
    },
  },
  { Header: t('供应商名称'), accessor: 'name', minWidth: 80 },
  {
    Header: t('可供应商品'),
    accessor: 'category1_name',
    hide: globalStore.isLite,
    minWidth: 80,
    maxWidth: 400,
    Cell: (cellProps) => {
      return (
        <Observer>
          {() => {
            const { category1_name } = cellProps.original
            if (!category1_name) return <div>-</div>
            return (
              <div
                style={{
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {category1_name}
              </div>
            )
          }}
        </Observer>
      )
    },
  },
  {
    Header: t('供货仓'),
    accessor: 'warehouse_id',
    minWidth: 80,
    maxWidth: 400,
    show: globalStore.isOpenMultWarehouse,
    Cell: (cellProps: any) => {
      const { warehouse_id } = cellProps.original
      return getUnNillText(store.getWarehouseById(warehouse_id)?.name)
    },
  },
  { Header: t('联系电话'), accessor: 'phone', minWidth: 80 },
]

/**
 * 供应商列表的组件函数，用于显示供应商列表
 */
const List = observer((props: ListProps) => {
  const { run, paging, pagination } = props

  /**
   * 处理创建供应商事件，点击创建按钮时触发
   * 跳转到创建供应商页面（吐槽：为什么创建页面是detail）
   */
  const handleCreate = () => {
    history.push('/purchase/supplier_manage/supplier_message/detail')
  }

  /**
   * 处理弹窗隐藏事件，弹窗隐藏时触发
   * 隐藏弹窗并根据需求刷新页面
   * @param {boolean} refresh 是否刷新页面；true为刷新，否则不刷新
   */
  const handleHide = (refresh: boolean) => {
    Modal.hide()
    if (refresh) {
      run()
    }
  }

  /**
   * 处理导入事件，点击批量导入按钮时触发
   * 弹出导入文件窗口
   */
  const handleImport = () => {
    Modal.render({
      title: t('批量导入供应商'),
      children: <BatchImportSupplierModal onHide={handleHide} />,
      onHide: Modal.hide,
      style: {
        width: '600px',
      },
    })
  }

  return (
    <BoxTable
      pagination={pagination}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: '供应商总数',
                content: paging.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <>
          <Button type='primary' onClick={handleCreate}>
            {t('新建供应商')}
          </Button>
          <Button className='gm-margin-left-10' onClick={handleImport}>
            {t('批量导入')}
          </Button>
        </>
      }
    >
      <Table data={store.supplierList.slice()} columns={columns} />
    </BoxTable>
  )
})

export default List
