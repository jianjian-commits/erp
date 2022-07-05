import { history } from '@/common/service'
import { BoxTable, Button, Modal } from '@gm-pc/react'
import { Table } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React from 'react'
import store from '../stores/list_store'
import BatchImportSupplierModal from './batch_import'

/**
 * 设置供应商列表的表头
 * 供应商编号: customized_code
 * 供应商名称: name
 * 联系电话: phone
 */
const columns = [
  {
    Header: t('供应商编号'),
    accessor: 'customized_code',
    Cell: (cellProps) => {
      const { supplier_id, customized_code } = cellProps.original
      return (
        <a
          // eslint-disable-next-line react/jsx-handler-names
          onClick={() =>
            history.push(
              `/data_manage/warehousing_data/supplier_manage/detail?supplier_id=${supplier_id}`,
            )
          }
          className='gm-cursor'
        >
          {customized_code}
        </a>
      )
    },
  },
  { Header: t('供应商名称'), accessor: 'name' },
  { Header: t('联系电话'), accessor: 'phone' },
]

/**
 * 供应商列表的组件函数，用于显示供应商列表
 */
const List = observer((props: any) => {
  const { run, pagination } = props

  /**
   * 处理创建供应商事件，点击创建按钮时触发
   * 跳转到创建供应商页面（吐槽：为什么创建页面是detail）
   */
  const handleCreate = () => {
    history.push('/data_manage/warehousing_data/supplier_manage/detail')
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
