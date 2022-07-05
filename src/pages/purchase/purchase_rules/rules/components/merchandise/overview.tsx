import React, { useState } from 'react'
import { Table, TableColumnProps, Space, message, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { t } from 'gm-i18n'
import EditComponents from '../edit/edit_components'

import { PurchaseRule } from 'gm_api/src/purchase'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from '../../store'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
const { confirm } = Modal
const OverView = () => {
  const [visible, setVisible] = useState<boolean>(false)
  const [editData, setEditData] = useState<PurchaseRule[]>([])
  const {
    loading,
    merchandiseTableListOverview,
    merchandiseTableMap,
    chooseSku,
    setChoose,
    setEditSkuMap,
    deletePurchaseRule,
    getMerchandiseList,
    refreshPaging,
  } = store

  // 列表打开编辑
  const handleEdit = (record: PurchaseRule, sku_id: string) => {
    // 需要的sku_info信息
    const { sku_map } = merchandiseTableMap
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
    setVisible(true)
  }

  // 列表销毁编辑
  const handleEditVisible = () => {
    setChoose({ type: 'merchandise', item: chooseSku })
    setVisible(false)
  }

  // 删除
  const handleDelete = (customer_id: string, purchase_rule_id: string) => {
    const { customer_map } = merchandiseTableMap
    const name = customer_map?.[customer_id]?.name || '-'
    confirm({
      title: t('删除规则'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确定删除客户名为${name}的规则吗`),
      cancelText: t('取消'),
      okText: t('确定'),
      onOk() {
        deletePurchaseRule([purchase_rule_id]).finally(() => {
          message.success(t('删除成功!'))
          refreshPaging('merchandise')
          // eslint-disable-next-line promise/no-nesting
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
      title: t('供应商'),
      dataIndex: 'supplier',
      align: 'center',
      render: (text: string, record) => {
        const { supplier_map } = merchandiseTableMap
        const supplier_name = supplier_map?.[record?.supplier_id!]?.name! || '-'

        return <>{supplier_name}</>
      },
    },
    {
      title: t('商品等级'),
      dataIndex: 'grade',
      align: 'center',
      render: (text: string, record) => {
        const { sku_map } = merchandiseTableMap
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
      title: t('采购员'),
      dataIndex: 'purchase',
      align: 'center',
      render: (text: string, record) => {
        const { purchaser_map } = merchandiseTableMap
        const purchase_name =
          purchaser_map?.[record?.purchaser_id!]?.name! || '-'
        return <>{purchase_name}</>
      },
    },

    {
      title: t('客户名称'),
      dataIndex: 'client_name',
      align: 'center',
      render: (text: string, record) => {
        const { customer_map } = merchandiseTableMap
        const customer_name = customer_map?.[record?.customer_id!]?.name || '-'
        return <>{customer_name}</>
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
            <a
              onClick={() => {
                handleEdit(record, record?.sku_id!)
              }}
            >
              {t('编辑')}
            </a>
          </PermissionJudge>
          <PermissionJudge
            permission={
              Permission.PERMISSION_PURCHASE_DELETE_PURCHASE_TASK_RULE
            }
          >
            <a
              onClick={() => {
                handleDelete(record?.customer_id!, record?.purchase_rule_id!)
              }}
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
      <Table
        columns={columns}
        dataSource={merchandiseTableListOverview.slice()}
        loading={loading}
        pagination={false}
      />
      {visible && (
        <EditComponents
          editType='merchandise'
          purchaseRuleData={editData}
          visible={visible}
          handleEditVisible={handleEditVisible}
        />
      )}
    </>
  )
}

export default observer(OverView)
