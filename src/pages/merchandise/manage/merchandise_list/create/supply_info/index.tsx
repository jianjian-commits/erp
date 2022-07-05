/**
 * @description 新建商品-供应链信息
 */
import React, { FC, useState, useEffect } from 'react'
import { observer } from 'mobx-react'
import { Col, Button } from 'antd'
import { valueType } from 'antd/lib/statistic/utils'
import _ from 'lodash'
import { t } from 'gm-i18n'
import { list_Sku_SupplierCooperateModelType } from 'gm_api/src/merchandise'
import { ListGroupUser, ListSupplier } from 'gm_api/src/enterprise'
import { formatTreeData } from '@/common/util'
import { DataNode, DataOption } from '@/common/interface'
import store from '@/pages/merchandise/manage/merchandise_list/create/store'
import { FormItemInterface } from '@/pages/merchandise/manage/merchandise_list/create/type'
import { inventoryPurchase } from '@/pages/merchandise/manage/merchandise_list/emnu'
import SaleInventoryItem from '@/pages/merchandise/manage/merchandise_list/create/supply_info/sale_inventory'
import FormItem from '@/pages/merchandise/manage/merchandise_list/components/form_item'
import globalStore from '@/stores/global'

interface SupplyInfoProps {
  setValues: (values: any) => void
}
interface SelectOption {
  value: string
  text: string
}
const SupplyInfo: FC<SupplyInfoProps> = observer((props) => {
  const { shelfList, setCreateLoadingState, formValue } = store
  const { setValues } = props
  /** 默认供应商 */
  const [suppliers, setSuppliers] = useState<SelectOption[]>([])
  /** 默认采购员 */
  const [purchasers, setPurchasers] = useState<SelectOption[]>([])
  /** 默认货位 */
  const [shelvesOption, setShelvesOption] = useState<DataOption[]>([])

  useEffect(() => {
    const timeout = setTimeout(() => {
      getLists()
    }, 300)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const shelvesTree = formatTreeData(shelfList)
    setShelvesOption([
      {
        value: '0',
        label: '未分配',
        children: [],
      },
      ...formatCascaderData(shelvesTree),
    ])
  }, [shelfList])

  /** 货位级联选择器数据处理 */
  const formatCascaderData = (treeData: DataNode[]): DataOption[] => {
    if (treeData.length === 0) return []
    return treeData.map((item) => {
      const children = formatCascaderData(item.children || [])
      return {
        value: item.value,
        label: item.title,
        disabled: children.length ? false : item.disabled,
        children,
      }
    })
  }

  const getLists = async () => {
    let supplierId
    let purchaserId
    // 供应商
    await ListSupplier({ paging: { limit: 999 } }).then((json) => {
      const data = json.response?.suppliers?.map((supplierItem) => {
        return {
          text: supplierItem.name,
          value: supplierItem.supplier_id,
        }
      })
      const supplierIndex = _.findIndex(
        data,
        (item) => formValue.supplier_id === item.value,
      )
      if (supplierIndex >= 0) {
        supplierId = formValue.supplier_id
      }

      setSuppliers(data)
    })

    // 采购员
    await ListGroupUser({ role_types: [3], paging: { limit: 999 } }).then(
      (json) => {
        const data = json.response.group_users.map((userItem) => {
          return {
            value: userItem.group_user_id,
            text: userItem.name,
          }
        })

        const purchaserIndex = _.findIndex(
          data,
          (item) => formValue.purchaser_id === item.value,
        )
        if (purchaserIndex >= 0) {
          purchaserId = formValue.purchaser_id
        }

        setPurchasers(data)
      },
    )

    setValues({
      ...formValue,
      supplier_id: supplierId,
      purchaser_id: purchaserId,
    })

    setCreateLoadingState()
  }

  /** 损耗比例校验 */
  const lossRatioValidator = (event: any, value: number) => {
    if (value < 0 || value > 99 || value % 1 !== 0) {
      return Promise.reject(new Error(t('损耗比例应为0～99之间整数')))
    }
    return Promise.resolve(new Error(''))
  }

  /** 保质期校验 */
  const expiryDateValidator = (event: any, value: number) => {
    if (value && (value < 0 || value % 1 !== 0)) {
      return Promise.reject(new Error(t('保质期应为正整数')))
    }
    return Promise.resolve(new Error(''))
  }

  const supplyInfoForm: FormItemInterface<valueType>[] = [
    // {
    //   label: '销售库存',
    //   name: 'sale_stocks',
    //   id: 'sale_stocks',
    //   required: true,
    //   rules: [{ required: true, message: '请选择销售库存' }],
    //   type: 'customer',
    //   customer: <SaleInventoryItem />,
    // },
    // TODO：提示换行，没找到对应字段
    {
      label: '库存采购',
      name: 'merchandise_inventory_procurement',
      id: 'merchandise_inventory_procurement',
      tooltip:
        '开启后，本商品不能通过订单或生产侧自动生成采购计划。适用于干调等存放周期长，库存量充足的商品。',
      type: 'radioGroup',
      radioGroup: {
        options: inventoryPurchase,
      },
    },
    {
      label: '供应商协作',
      name: 'supplier_cooperate_model_type',
      id: 'supplier_cooperate_model_type',
      required: false,
      type: 'select',
      select: {
        options: list_Sku_SupplierCooperateModelType,
      },
      selectLabelName: 'text',
      selectValueName: 'value',
    },
    {
      label: '默认供应商',
      name: 'supplier_id',
      id: 'supplier_id',
      type: 'select',
      required: globalStore.isLite,
      rules: [{ required: globalStore.isLite, message: '请选择默认供应商' }],
      select: {
        placeholder: '请选择供应商',
        showSearch: true,
        allowClear: true,
        options: suppliers,
      },
      selectLabelName: 'text',
      selectValueName: 'value',
      visible: globalStore.isLite,
    },
    {
      label: '默认采购员',
      name: 'purchaser_id',
      id: 'purchaser_id',
      type: 'select',
      select: {
        placeholder: '请选择采购员',
        showSearch: true,
        allowClear: true,
        options: purchasers,
      },
      selectLabelName: 'text',
      selectValueName: 'value',
    },
    {
      label: '默认货位',
      name: 'shelf_ids',
      id: 'shelf_ids',
      type: 'cascader',
      cascader: {
        placeholder: '请选择货位',
        options: shelvesOption,
        allowClear: true,
        expandTrigger: 'hover',
      },
      selectLabelName: 'text',
      selectValueName: 'value',
    },
    {
      label: '损耗比例',
      name: 'loss_ratio',
      id: 'loss_ratio',
      type: 'inputNumber',
      rules: [{ validator: lossRatioValidator }],
      inputNumber: {
        type: 'number',
        placeholder: '请输入损耗比例',
        min: 0,
        max: 99,
        addonAfter: '%',
      },
    },
    {
      label: '保质期',
      name: 'expiry_date',
      id: 'expiry_date',
      rules: [{ validator: expiryDateValidator }],
      toolTipDom: (
        <Button
          type='link'
          onClick={() =>
            window.open('/#/system/setting/sales_invoicing_setting')
          }
        >
          {t('设置临期提醒')}
        </Button>
      ),
      toolTipDomSpan: 12,
      type: 'inputNumber',
      inputNumber: {
        placeholder: '请输入保质期',
        addonAfter: '天',
        min: 0,
      },
    },
    // 轻巧版下只显示 visible 为 true 的字段
  ].filter((f) => (globalStore.isLite ? f.visible : f))
  return (
    <>
      {_.map(supplyInfoForm, (formItem) => {
        return (
          <Col key={formItem.id} xs={24} sm={24} md={16} lg={12} xl={12}>
            <FormItem {...formItem} />
          </Col>
        )
      })}
    </>
  )
})

export default SupplyInfo
