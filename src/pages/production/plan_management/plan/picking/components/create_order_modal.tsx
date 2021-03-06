import React, { FC, useEffect, useState } from 'react'
import { Modal, Radio, Select, message } from 'antd'
import { t } from 'gm-i18n'
import { Flex, Tip } from '@gm-pc/react'
import {
  ListTaskRequest_MaterialListType,
  CreateMaterialOrder,
  ListMaterialOrder,
  GetMaterialOrder,
  Task_Type,
  MaterialOrder_State,
} from 'gm_api/src/production'
import { fetchTreeData } from '@/common/service'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import _ from 'lodash'
import CategoryCascader from '@/pages/merchandise/components/category_cascader'
import store from '../store'
import planStore from '@/pages/production/plan_management/plan/store'

const { Option } = Select

const typesList = list_Sku_NotPackageSubSkuType

const Label: FC<{ value: string }> = ({ value }) => {
  return (
    <Flex justifyEnd style={{ width: '120px' }}>
      {value}
    </Flex>
  )
}

const CreateOrderModal: FC<{
  refresh(): void
  data: any[]
  visible: boolean
  setVisible(visible: boolean): void
}> = ({ data, visible, setVisible, refresh }) => {
  const [joinExist, setJoinExist] = useState<0 | 1>(0)
  const [type, setType] = useState<ListTaskRequest_MaterialListType>(
    ListTaskRequest_MaterialListType.MATERIALLISTTYPE_SKU,
  )
  const [orderList, setOrderList] = useState<any[]>([])
  const [orderId, setOrderId] = useState('')
  const [category, setCategory] = useState<any[]>([])
  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [categoryOptions, setCategoryOptions] = useState<
    { label: string; value: any }[]
  >([])
  const [types, setTypes] = useState<any[]>([])
  const all = store.selectAll

  const fetchOrderList = () => {
    const task_types = planStore.producePlanCondition.isProduce
      ? [Task_Type.TYPE_PRODUCE, Task_Type.TYPE_PRODUCE_CLEANFOOD]
      : [Task_Type.TYPE_PACK]
    const req = {
      production_order_ids: [planStore.producePlanCondition.productionOrderId],
      task_types,
      paging: {
        offset: 0,
        limit: 999,
      },
      states: [
        MaterialOrder_State.STATE_NOT_SUBMITTED,
        MaterialOrder_State.STATE_UNSPECIFIED,
      ],
    }
    return ListMaterialOrder(req).then((res) => {
      const material_orders = res.response.material_orders
      const list = material_orders.map((order) => {
        return {
          label: order.title,
          value: order.material_order_id,
        }
      })
      setOrderList(list)
      return res.response
    })
  }

  const handleOrderSelect = async (value: string) => {
    setOrderId(value)
    GetMaterialOrder({ material_order_id: value, need_sku: true }).then(
      (res) => {
        const materialOrder = res.response.material_order
        const not_package_sub_sku_types =
          materialOrder.material_sheet_setting?.not_package_sub_sku_types || []
        const ids = materialOrder.material_sheet_setting?.category_ids || []
        setTypes(not_package_sub_sku_types)
        setCategoryIds(ids)
      },
    )
  }

  useEffect(() => {
    if (visible) {
      fetchOrderList()
      fetchTreeData().then((res) => {
        const categoryMap = res.categoryMap
        const options: any[] = []
        for (const key in categoryMap) {
          const option = { value: key, label: categoryMap[key].title }
          options.push(option)
        }
        setCategoryOptions(options)
      })
    }
  }, [visible])

  const handleSubmit = () => {
    const req: any = {}
    if (joinExist === 0) {
      req.type = type
      req.material_sheet_setting = {
        category_ids: category.map((id: any) => id[id.length - 1]),
        not_package_sub_sku_types: types,
      }
    } else if (joinExist === 1) {
      if (!orderId) {
        message.error(t('????????????????????????'))
        return
      }
      req.material_order_id = orderId
    }

    const list_task_input_request: any = {
      paging: { all: true },
    }
    if (all) {
      _.assign(list_task_input_request, { ...store.filter })
    } else {
      list_task_input_request.task_input_ids = data.map((e) => e.taskInputId)
    }
    req.list_task_input_request = list_task_input_request

    CreateMaterialOrder(req).then(() => {
      Tip.success(t('????????????'))
      store.initSelectedData()
      refresh()
      return setVisible(false)
    })
  }
  return (
    <Modal
      title={t('???????????????')}
      visible={visible}
      onOk={handleSubmit}
      onCancel={() => setVisible(false)}
    >
      <div>{t('?????????')}</div>
      <div>{t('1???????????????????????????????????????????????????????????????????????????')}</div>
      <div>{t('2??????????????????????????????????????????????????????????????????')}</div>
      <Flex alignCenter className='tw-mt-3'>
        <Label value={t('????????????????????????')} />
        <Radio.Group
          onChange={(e) => {
            const value = e.target.value
            setJoinExist(value)
            setCategory([])
            setTypes([])
          }}
          value={joinExist}
        >
          <Radio value={1}>{t('???')}</Radio>
          <Radio value={0}>{t('???')}</Radio>
        </Radio.Group>
      </Flex>
      {joinExist === 0 && (
        <Flex alignCenter className='tw-mt-3'>
          <Label value={t('????????????????????????')} />
          <Select
            value={type}
            style={{ width: '300px' }}
            onChange={(value) => setType(value)}
          >
            <Option
              value={ListTaskRequest_MaterialListType.MATERIALLISTTYPE_SKU}
            >
              {t('???????????????')}
            </Option>
            <Option
              value={ListTaskRequest_MaterialListType.MATERIALLISTTYPE_CATEGORY}
            >
              {t('??????????????????????????????????????????????????????')}
            </Option>
            <Option
              value={
                ListTaskRequest_MaterialListType.MATERIALLISTTYPE_PROCESSOR
              }
            >
              {t('??????????????????????????????????????????????????????')}
            </Option>
            <Option
              value={ListTaskRequest_MaterialListType.MATERIALLISTTYPE_GROUP}
            >
              {t('??????????????????????????????????????????????????????')}
            </Option>
          </Select>
        </Flex>
      )}
      {joinExist === 1 && (
        <Flex alignCenter className='tw-mt-3'>
          <Label value={t('????????????????????????')} />
          <Select
            value={orderId}
            style={{ width: '300px' }}
            onChange={(value) => handleOrderSelect(value)}
            options={orderList}
          />
        </Flex>
      )}
      <>
        <Flex alignCenter className='tw-mt-3'>
          <Label value={t('??????????????????')} />
          {joinExist === 1 ? (
            <Select
              value={categoryIds}
              style={{ width: '300px' }}
              disabled
              mode='multiple'
              options={categoryOptions}
            />
          ) : (
            <CategoryCascader
              multiple
              placeholder={t('????????????')}
              style={{ width: '300px' }}
              value={category}
              onChange={(value) => {
                setCategory(value)
              }}
              showAdd={false}
            />
          )}
        </Flex>
        <Flex alignCenter className='tw-mt-3'>
          <Label value='' />
          <Select
            disabled={joinExist === 1}
            mode='multiple'
            allowClear
            placeholder={t('????????????')}
            style={{ width: '300px' }}
            options={typesList}
            value={types}
            onChange={(value) => setTypes(value)}
          />
        </Flex>
      </>
    </Modal>
  )
}

export default CreateOrderModal
