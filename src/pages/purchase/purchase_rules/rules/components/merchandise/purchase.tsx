import React, { useState } from 'react'
import { Table, TableColumnProps, Space, message, Modal } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import { t } from 'gm-i18n'
import EditComponents from '../edit/edit_components'
import { observer } from 'mobx-react'
import store from '../../store'
import { PurchaseRule } from 'gm_api/src/purchase'
import _ from 'lodash'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
const { confirm } = Modal
const Purchase = () => {
  const [visible, setVisible] = useState<boolean>(false)
  const [editData, setEditData] = useState<PurchaseRule[]>([])
  const {
    loading,
    setChoose,
    chooseSku,
    merchandiseTableListPurchase,
    setEditSkuMap,
    merchandiseTableMap,
    deletePurchaseRule,
    refreshPaging,
    getMerchandiseList,
    updatePurchaseRule,
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
  const handleDelete = (record: PurchaseRule) => {
    const { purchaser_map } = merchandiseTableMap
    const { supplier_id, purchaser_id, level_field_id, purchase_rule_id } =
      record
    const name = purchaser_map?.[purchaser_id!]?.name || '-'
    confirm({
      title: t('删除采购员'),
      icon: <ExclamationCircleOutlined />,
      content: t(`确定删除改规则中的${name}的采购员吗`),
      cancelText: t('取消'),
      okText: t('确定'),
      onOk() {
        if (supplier_id === '0' && level_field_id === '0') {
          deletePurchaseRule([purchase_rule_id]).finally(() => {
            message.success(t('删除成功!'))
            refreshPaging('merchandise')
            getMerchandiseList()
          })
        } else {
          const update_purchase_rule = {
            ...record,
            purchaser_id: '0',
          }
          updatePurchaseRule(update_purchase_rule).then(() => {
            message.success(t('删除成功!'))
            refreshPaging('merchandise')
            getMerchandiseList()
          })
        }
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
                handleDelete(record)
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
        style={{ height: '100%' }}
        columns={columns}
        dataSource={merchandiseTableListPurchase.slice()}
        pagination={false}
        loading={loading}
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

export default observer(Purchase)
