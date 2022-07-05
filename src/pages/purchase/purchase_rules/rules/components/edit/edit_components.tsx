import React, { FC, useState, useEffect } from 'react'
import { Modal, Table, TableColumnProps, message } from 'antd'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import _ from 'lodash'
import TableTextOverflow from '@/common/components/table_text_overflow'
import ProductImage from '@/common/components/product_image'
import { getCategoryName } from '@/common/util'
import SupplierSelect from '../supplier_select'
import PurchaseSelect from '../purchase_select'
import GradeSelect from '../grade_select'
import { observer } from 'mobx-react'
import store from '../../store'
import { Sku } from 'gm_api/src/merchandise'
import { LabelFilter } from '../../interface'
import { PurchaseRule } from 'gm_api/src/purchase'
interface EditProps {
  visible: boolean
  editType: string
  handleEditVisible: (visible?: boolean) => void
  purchaseRuleData: PurchaseRule[]
}
const EditComponents: FC<EditProps> = ({
  visible,
  editType,
  handleEditVisible,
  purchaseRuleData,
}) => {
  const { supplierList, purchaseList, updatePurchaseRule } = store
  const [tableData, setTableData] = useState<PurchaseRule[]>([])
  const [options, setOptions] = useState<LabelFilter[]>([])
  const [levelId, setLevelId] = useState('0')
  const { category_map, editSkuMap } = store

  const handleOk = () => {
    const res = _.every(
      tableData,
      (i) =>
        (!i.purchaser_id || i.purchaser_id === '0') &&
        (!i.supplier_id || i.supplier_id === '0') &&
        (!i.level_field_id || i.level_field_id === '0'),
    )
    if (res) {
      message.error(t('供应商、采购员、商品等级最少选择一个!'))
      return
    }
    const update_purchase_rule = tableData[0]

    updatePurchaseRule(update_purchase_rule)
      .then(() => {
        message.destroy()
        message.success(t('编辑成功!'))
      })
      .finally(() => {
        handleEditVisible()
      })
  }

  // 将编辑成功之后的edit修改options
  useEffect(() => {
    const sku_level = editSkuMap.sku_level?.sku_level!
    const option = _.map(sku_level, (item) => {
      return {
        ...item,
        label: item.name!,
        value: item.level_id!,
      }
    })
    setOptions(option)

    const data = _.map(purchaseRuleData, (item, dataIndex) => {
      const index = _.findIndex(
        option,
        (j) => j.level_id === item.level_field_id,
      )

      // 去到第一次进来的商品等级id 不让他删除 除非他更新了
      setLevelId(item.level_field_id!)
      return {
        ...item,
        level_field_id: index === -1 ? '0' : item.level_field_id,
        supplier_id:
          tableData?.[dataIndex]?.supplier_id || item.supplier_id || '0',
        purchaser_id:
          tableData?.[dataIndex]?.purchaser_id || item.purchaser_id || '0',
      }
    })
    setTableData(data)
  }, [editSkuMap, visible])

  const handleChange = (value: string, index: number, changeType: string) => {
    const list = _.cloneDeep(tableData)
    if (changeType === 'supplier_id') {
      list[index].supplier_id = value
    }
    if (changeType === 'purchaser_id') {
      list[index].purchaser_id = value
    }
    if (changeType === 'level_field_id') {
      list[index].level_field_id = value
    }
    setTableData(list.slice())
  }

  const columns: TableColumnProps<PurchaseRule>[] = [
    {
      title: t('商品图'),
      key: 'image',
      width: 80,
      dataIndex: 'image',
      render: () => {
        const { repeated_field } = editSkuMap
        const image = repeated_field?.images![0]
        return <ProductImage url={image?.path || ''} />
      },
    },
    {
      title: t('商品名'),
      key: 'name',
      width: 150,
      dataIndex: 'name',
      render: () => <TableTextOverflow text={editSkuMap?.name! || '-'} />,
    },

    {
      title: t('分类'),
      key: 'category_id',
      width: 150,
      dataIndex: 'category_id',
      render: (text) => (
        <TableTextOverflow
          text={getCategoryName(category_map, editSkuMap?.category_id!)}
        />
      ),
    },
    {
      title: t('供应商'),
      key: 'supplier_id',
      dataIndex: 'supplier_id',
      width: 200,
      render: (text, record, index) => {
        const supplier_id =
          record?.supplier_id === '0' ? undefined : record?.supplier_id
        if (record.supplier_id) {
          const res = _.some(
            supplierList,
            (item) => item.value === record.supplier_id,
          )
          if (!res) {
            const data = tableData.slice()
            data[index].supplier_id = undefined
            setTableData(data.slice())
          }
        }
        return (
          <SupplierSelect
            value={supplier_id}
            options={supplierList}
            onChange={(value) => handleChange(value, index, 'supplier_id')}
            style={{ width: '100%' }}
          />
        )
      },
    },
    {
      title: t('采购员'),
      key: 'purchaser_id',
      dataIndex: 'purchaser_id',
      width: 200,
      render: (__, record, index) => {
        const purchaser_id =
          record?.purchaser_id === '0' ? undefined : record.purchaser_id
        if (record.purchaser_id) {
          const res = _.some(
            purchaseList,
            (item) => item.value === record.purchaser_id,
          )
          if (!res) {
            const data = tableData.slice()
            data[index].purchaser_id = undefined
            setTableData(data.slice())
          }
        }
        return (
          <PurchaseSelect
            value={purchaser_id}
            options={purchaseList}
            onChange={(value) => handleChange(value, index, 'purchaser_id')}
            style={{ width: '100%' }}
          />
        )
      },
    },
    {
      title: t('商品等级'),
      key: 'level_field_id',
      dataIndex: 'level_field_id',
      width: 200,
      render: (__, record, index) => {
        const level_field_id =
          record?.level_field_id === '0' ? undefined : record.level_field_id
        if (record.level_field_id) {
          const res = _.some(
            options.filter((i) => !i.is_delete),
            (item) => item.value === record.level_field_id,
          )
          if (!res) {
            const data = tableData.slice()
            data[index].level_field_id = undefined
            setTableData(data.slice())
          }
        }
        return (
          <GradeSelect
            value={level_field_id}
            levelId={levelId}
            type='edit'
            options={options}
            skuInfo={editSkuMap as Sku}
            onChange={(value) => handleChange(value, index, 'level_field_id')}
            style={{ width: '100%' }}
          />
        )
      },
    },
  ]

  return (
    <>
      <Modal
        width={1068}
        visible={visible}
        onCancel={() => handleEditVisible()}
        title={<>{t(`${editSkuMap?.name! || '-'}`)}</>}
        onOk={handleOk}
      >
        <>
          <Flex className='tw-text-sm tw-mb-2' style={{ color: '#999' }}>
            {t('提示：供应商、采购员、商品等级至少填写一项')}
          </Flex>
          <Table
            pagination={false}
            dataSource={tableData.slice()}
            columns={columns}
          />
        </>
      </Modal>
    </>
  )
}
export default observer(EditComponents)
