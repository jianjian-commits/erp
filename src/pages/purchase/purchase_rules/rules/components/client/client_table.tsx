import React, { useState } from 'react'
import { Table, TableColumnProps, Space, message, Modal } from 'antd'
import { Flex } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  PlusCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import BatchClientAdd from '../create/client/batch_client_add'
import createStore from '../create/store'
import EditComponents from '../edit/edit_components'
import store from '../../store'
import { observer } from 'mobx-react'
import { getCategoryName } from '@/common/util'
import { Customer, Permission } from 'gm_api/src/enterprise'
import { PurchaseRule } from 'gm_api/src/purchase'
import PermissionJudge from '@/common/components/permission_judge'
import _ from 'lodash'
import globalStore from '@/stores/global'

const { confirm } = Modal

const ClientTable = () => {
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [editData, setEditData] = useState<PurchaseRule[]>([])
  const { setSelectedRow, setType, setSelectedRowKeys } = createStore
  const {
    clientTableList,
    clientTableMap,
    category_map,
    loading,
    chooseClient,
    setChoose,
    setEditSkuMap,
    deletePurchaseRule,
    getClientList,
    getMerchandiseList,
    refreshPaging,
  } = store

  // 列表下面的新建商品
  const handleAdd = () => {
    setType('add')
    setSelectedRow([chooseClient] as Customer[], 'client')
    const keys = [chooseClient.customer_id!]
    setSelectedRowKeys(keys as React.Key[], 'client')
    setVisible(true)
  }

  // 列表销毁下面的新建商品
  const handleVisible = () => {
    setVisible(false)
  }

  // 列表销毁编辑
  const handleEditVisible = () => {
    setChoose({ type: 'client', item: chooseClient })
    setEditVisible(false)
  }

  // 列表打开编辑
  const handleEdit = (record: PurchaseRule, sku_id: string) => {
    // 需要的sku_info信息
    const { sku_map } = clientTableMap
    setEditSkuMap(sku_map?.[sku_id!]!)
    const data = _.map([record], (item) => {
      return {
        ...item,
        purchaser_id: item.purchaser_id === '0' ? undefined : item.purchaser_id,
        supplier_id: item.supplier_id === '0' ? undefined : item.supplier_id,
        level_field_id:
          item.level_field_id === '0' ? undefined : item.level_field_id,
      }
    })
    setEditData(data)
    setEditVisible(true)
  }

  // 删除
  const handleDelete = (sku_id: string, purchase_rule_id: string) => {
    const { sku_map } = clientTableMap
    const name = sku_map?.[sku_id]?.name || '-'
    confirm({
      title: t('删除规则'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确定删除商品名为${name}的规则吗`),
      cancelText: t('取消'),
      okText: t('确定'),
      onOk() {
        deletePurchaseRule([purchase_rule_id]).finally(() => {
          message.success(t('删除成功!'))
          refreshPaging('client')
          refreshPaging('merchandise')
          getClientList()
          getMerchandiseList()
        })
      },
    })
  }

  const columns: TableColumnProps<PurchaseRule>[] = [
    {
      title: '',
      dataIndex: 'index',
      align: 'center',
      width: 50,
      render: (text: string, record, index) => <>{index + 1}</>,
    },
    {
      title: t('商品编码'),
      dataIndex: 'customize_code',
      align: 'center',
      render: (text: string, record) => {
        const { sku_map } = clientTableMap
        const customize_code =
          sku_map?.[record?.sku_id!]?.customize_code! || '-'
        return <>{customize_code}</>
      },
    },
    {
      title: t('商品'),
      dataIndex: 'name',
      align: 'center',
      render: (text: string, record) => {
        const { sku_map } = clientTableMap
        const sku_id = record?.sku_id!
        return <>{sku_map?.[sku_id]?.name || '-'}</>
      },
    },

    {
      title: t('商品分类'),
      dataIndex: 'category',
      align: 'center',
      render: (text: string, record) => {
        const { sku_map } = clientTableMap
        const category_id = sku_map?.[record?.sku_id!]?.category_id!
        const category_name = getCategoryName(category_map, category_id) || '-'
        return <>{category_name}</>
      },
    },
    {
      title: t('指定供应商'),
      dataIndex: 'supplier',
      align: 'center',
      render: (text: string, record) => {
        const { supplier_map } = clientTableMap
        const supplier_name = supplier_map?.[record?.supplier_id!]?.name! || '-'
        return <>{supplier_name}</>
      },
    },
    {
      title: t('指定采购员'),
      dataIndex: 'purchase',
      align: 'center',
      render: (text: string, record) => {
        const { purchaser_map } = clientTableMap
        const purchase_name =
          purchaser_map?.[record?.purchaser_id!]?.name! || '-'
        return <>{purchase_name}</>
      },
    },
    {
      title: t('指定商品等级'),
      dataIndex: 'grade',
      align: 'center',
      render: (text: string, record) => {
        const { sku_map } = clientTableMap
        const level_field_id = record?.level_field_id!
        const sku_level =
          sku_map?.[record?.sku_id!]?.sku_level?.sku_level! || []
        const grade_name =
          _.find(
            sku_level.filter((i) => !i.is_delete),
            (item) => item.level_id === level_field_id,
          )?.name! || '-'
        return <>{grade_name}</>
      },
    },
    {
      title: t('操作'),
      dataIndex: 'action',
      align: 'center',
      render: (text: string, record) => (
        <Space size='middle'>
          <PermissionJudge
            permission={
              Permission.PERMISSION_PURCHASE_UPDATE_PURCHASE_TASK_RULE
            }
          >
            <a onClick={() => handleEdit(record, record?.sku_id!)}>
              {t('编辑')}
            </a>
          </PermissionJudge>
          <PermissionJudge
            permission={
              Permission.PERMISSION_PURCHASE_DELETE_PURCHASE_TASK_RULE
            }
          >
            <a
              onClick={() =>
                handleDelete(record?.sku_id!, record?.purchase_rule_id!)
              }
            >
              {t('删除')}
            </a>
          </PermissionJudge>
        </Space>
      ),
    },
  ]

  return (
    <>
      <div className='rules-list-right-bottom'>
        <Table
          columns={columns}
          loading={loading}
          dataSource={clientTableList.slice()}
          pagination={false}
        />
        {chooseClient.customer_id &&
          globalStore.hasPermission(
            Permission.PERMISSION_PURCHASE_CREATE_PURCHASE_TASK_RULE,
          ) && (
            <Flex
              className='tw-w-full tw-mt-1 tw-cursor-pointer'
              style={{
                color: '#176CFE',
                position: 'sticky',
                bottom: 0,
                background: '#fff',
              }}
              alignCenter
              onClick={handleAdd}
            >
              <PlusCircleOutlined className='tw-mr-1' />
              {t('增加其他商品规则')}
            </Flex>
          )}
      </div>

      {/* 添加 */}
      {visible && (
        <BatchClientAdd visible={visible} handleVisible={handleVisible} />
      )}

      {/* 修改 */}
      {editVisible && (
        <EditComponents
          editType='client'
          purchaseRuleData={editData}
          visible={editVisible}
          handleEditVisible={handleEditVisible}
        />
      )}
    </>
  )
}
export default observer(ClientTable)
