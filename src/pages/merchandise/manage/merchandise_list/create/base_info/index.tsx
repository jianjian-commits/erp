/**
 * @description 新建商品-基本信息
 */
import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Col } from 'antd'
import { valueType } from 'antd/lib/statistic/utils'
import { NamePath } from 'antd/lib/form/interface'
import _ from 'lodash'
import { list_Sku_NotPackageSubSkuType } from 'gm_api/src/merchandise'
import { FileType } from 'gm_api/src/cloudapi'
import {
  CustomUnitItem,
  FormItemInterface,
  MulitUnitForm,
} from '@/pages/merchandise/manage/merchandise_list/create/type'
import { sortingType } from '@/pages/merchandise/manage/merchandise_list/emnu'
import { saleState } from '@/pages/merchandise/manage/emnu'
import CategoryCascader from '@/pages/merchandise/manage/merchandise_list/create/base_info/category_cascader'
import MerchandiseMultiUnit from '@/pages/merchandise/manage/merchandise_list/create/base_info/merchandise_multi_unit'
import FormItem from '@/pages/merchandise/manage/merchandise_list/components/form_item'
import UploadImage from '@/pages/merchandise/manage/components/upload_images'
import ProductUnit from '@/pages/merchandise/manage/merchandise_list/create/base_info/product_unit'
import globalStore, { UnitGlobal } from '@/stores/global'
import store from '@/pages/merchandise/manage/merchandise_list/create/store'
import { INPUT_NUMBER_CONFIG } from '@/common/constants'
import { t } from 'gm-i18n'
import { SelectBasicUnit } from '@/common/components/select_unit'

interface BaseInfoProps {
  setValues: (values: any) => void
  getFieldValue: (name: NamePath) => any
}

const BaseInfo: FC<BaseInfoProps> = observer((props) => {
  const { setValues } = props
  const {
    skuId,
    imageList,
    setImageList,
    formValue,
    basicUnitObj,
    setCustomUnitList,
  } = store

  /** 商品别名校验 */
  const aliasValidator = (event: any, value: string) => {
    if (value) {
      const aliasList = [...new Set(value.split(/[,，|；;]/g).filter((e) => e))]

      if (aliasList.length > 5) {
        return Promise.reject(new Error(t('最多可输入5个商品别名')))
      }
      if (aliasList.some((alias) => alias.length > 10)) {
        return Promise.reject(new Error(t('单个商品别名不能多于10个字符')))
      }
    }
    return Promise.resolve(new Error())
  }

  /** 获取自定义单位 */
  const getCustomUnits = (values: CustomUnitItem[]) => {
    const unitsObj: { [key: string]: string } = {}
    const unitsList: UnitGlobal[] = []
    values.forEach((valueItem, index) => {
      const { custom_unit, rate, parent_id } = valueItem
      const baseItem = globalStore.getUnit(parent_id)
      const listItem = {
        text: `${custom_unit}（${rate}${baseItem.name}）`,
        value: `${index}`,
        parent_id: parent_id,
        rate: rate.toString(),
        unit_id: `${index}`,
        name: custom_unit,
      }
      const objValue = `${custom_unit}（${rate}${baseItem.name}）`
      unitsList.push(listItem)
      unitsObj[`custom_unit_${index + 1}`] = objValue
    })
    return { unitsObj, unitsList }
  }

  /** 多单位弹窗确定事件 */
  const setUnits = (values: MulitUnitForm) => {
    const basicText = basicUnitObj.text
    let inventory = `${basicText}`
    const { auxiliary, custom_units } = values

    if (!Number(auxiliary) && !custom_units.length) {
      // 没有辅助单位、自定义单位，新建表单数据置空
      setValues({
        ...formValue,
        second_base_unit: '',
        custom_unit_1: '',
        custom_unit_2: '',
        custom_unit_3: '',
        second_base_unit_id: '',
        second_base_unit_ratio: '',
        inventory_unit: inventory,
      })
      // 清空辅助单位、自定义单位列表
      setCustomUnitList([])
      return
    }

    // 获取自定义单位展示对象及列表
    const { unitsObj, unitsList } = getCustomUnits(values.custom_units)

    let secondBasic = ''

    const { second_base_unit_id, second_base_unit_ratio } = values
    if (second_base_unit_id) {
      const auxiliaryItem = globalStore.getUnit(second_base_unit_id)
      const { text } = auxiliaryItem

      // 辅助单位展示值
      secondBasic = `${text}（${second_base_unit_ratio}${basicText}）`
      // 库存单位展示值
      inventory = `${basicText}、${text}`
    }

    setCustomUnitList(unitsList)

    setValues({
      ...formValue,
      custom_unit_1: unitsObj.custom_unit_1 || '',
      custom_unit_2: unitsObj.custom_unit_2 || '',
      custom_unit_3: unitsObj.custom_unit_3 || '',
      second_base_unit: secondBasic,
      second_base_unit_id,
      second_base_unit_ratio: second_base_unit_ratio + '',
      inventory_unit: inventory,
    })
  }

  const baseInfoForm: FormItemInterface<valueType>[] = [
    {
      label: '商品名称',
      id: 'name',
      name: 'name',
      required: true,
      rules: [{ required: true, message: '请填写商品名称' }],
      type: 'input',
      input: {
        placeholder: '请输入商品名称',
        maxLength: 40,
        minLength: 1,
      },
      visible: globalStore.isLite,
    },
    {
      label: '商品编码',
      name: 'customize_code',
      id: 'customize_code',
      required: true,
      rules: [{ required: true, message: '请填写商品编码' }],
      type: 'input',
      input: {
        placeholder: '请输入商品编码',
        disabled: !!skuId,
        maxLength: 44,
        minLength: 1,
      },
      visible: globalStore.isLite,
    },
    {
      label: '条形码',
      name: 'bar_code',
      id: 'bar_code',
      type: 'input',
      input: {
        placeholder: '请输入条形码',
        maxLength: 44,
        minLength: 1,
      },
      visible: !globalStore.isLite,
    },
    {
      label: '商品别名',
      name: 'alias',
      id: 'alias',
      required: false,
      tooltip: '别名间用逗号区分, 最多可输入5个',
      rules: [{ validator: aliasValidator }],
      type: 'input',
      input: {
        placeholder: '请输入商品别名，别名间用逗号区分',
        maxLength: 40,
        minLength: 1,
      },
      visible: globalStore.isLite,
    },
    {
      label: '商品分类',
      name: 'categories',
      id: 'categories',
      required: true,
      rules: [{ required: true, message: '请选择商品分类' }],
      type: 'customer',
      initialValue: [''],
      customer: <CategoryCascader />,
      visible: globalStore.isLite,
    },
    {
      label: '商品类型',
      name: 'not_package_sub_sku_type',
      id: 'not_package_sub_sku_type',
      type: 'select',
      select: {
        options: list_Sku_NotPackageSubSkuType,
      },
      selectLabelName: 'text',
      selectValueName: 'value',
    },
    // is_weight
    {
      label: '分拣类型',
      name: 'sorting_type',
      id: 'sorting_type',
      required: true,
      rules: [{ required: true, message: '请选择分拣类型' }],
      type: 'select',
      select: {
        options: sortingType,
      },
      selectLabelName: 'text',
      selectValueName: 'value',
    },
    {
      label: '基本单位',
      name: 'base_unit_id',
      id: 'base_unit_id',
      required: true,
      // 轻巧版下没有多单位管理
      toolTipDom: !globalStore.isLite && (
        <MerchandiseMultiUnit setUnits={setUnits} />
      ),
      toolTipDomSpan: 6,
      rules: [{ required: true, message: '请选择基本单位' }],
      type: 'customer',
      customer: (
        <SelectBasicUnit
          placeholder='请选择基本单位'
          disabled={!!skuId}
          showSearch
        />
      ),
      visible: globalStore.isLite,
    },
    {
      label: '标准售价',
      name: 'basic_price',
      id: 'basic_price',
      type: 'inputNumber',
      inputNumber: {
        placeholder: '请输入',
        min: 0.0,
        addonBefore: '¥',
        ...INPUT_NUMBER_CONFIG,
      },
      // 只有轻巧版才展示
      onlyLiteVisible: true,
    },
    {
      label: '成本价',
      name: 'cost',
      id: 'cost',
      required: false,
      type: 'inputNumber',
      inputNumber: {
        addonBefore: '¥',
        placeholder: '请输入',
        min: 0,
        ...INPUT_NUMBER_CONFIG,
      },
      // 只有轻巧版才展示
      onlyLiteVisible: true,
    },
    {
      label: '辅助单位',
      name: 'second_base_unit',
      id: 'second_base_unit',
      required: false,
      type: 'input',
      input: {
        disabled: true,
      },
    },
    {
      label: '自定义单位1',
      name: 'custom_unit_1',
      id: 'custom_unit_1',
      required: false,
      type: 'input',
      input: {
        disabled: true,
      },
    },
    {
      label: '自定义单位2',
      name: 'custom_unit_2',
      id: 'custom_unit_2',
      required: false,
      type: 'input',
      input: {
        disabled: true,
      },
    },
    {
      label: '自定义单位3',
      name: 'custom_unit_3',
      id: 'custom_unit_3',
      required: false,
      type: 'input',
      input: {
        disabled: true,
      },
    },
    // 没找到对应字段（基本单位、辅助单位）
    {
      label: '库存单位',
      name: 'inventory_unit',
      id: 'inventory_unit',
      required: false,
      type: 'input',
      input: {
        disabled: true,
      },
    },
    {
      label: '生产单位',
      required: false,
      name: 'production_unit',
      id: 'production_unit',
      dependencies: ['production_num'],
      tooltip:
        '设置生产单位用于生产指导，比如针对酱油，库存单位为瓶，实际生产采用的是毫升这里则填写500毫升=1瓶，在熟食bom设置时可选毫升',
      type: 'customer',
      customer: <ProductUnit />,
    },
    {
      label: '采购单位',
      name: 'purchase_unit_id',
      id: 'purchase_unit_id',
      required: false,
      type: 'select',
      select: {
        options: store.purchaseUnitList,
        placeholder: '请选择采购单位',
      },
      selectLabelName: 'text',
      selectValueName: 'value',
    },
    // repeated_field
    {
      label: '商品图片',
      name: 'images',
      id: 'images',
      required: false,
      type: 'customer',
      customer: (
        <UploadImage
          fileType={FileType.FILE_TYPE_MERCHANDISE_SKU_IMAGE}
          fileLength={9}
          setFileList={setImageList}
          upload={{ fileList: imageList, listType: 'picture-card' }}
        />
      ),
      visible: globalStore.isLite,
    },
    {
      label: '销售状态',
      name: 'sale_state',
      id: 'sale_state',
      required: false,
      type: 'radioGroup',
      radioGroup: {
        options: saleState,
      },
      visible: globalStore.isLite,
    },
    {
      label: '商品描述',
      name: 'desc',
      id: 'desc',
      required: false,
      wrapperCol: { span: 16 },
      type: 'inputTextarea',
      inputTextarea: {
        rows: 4,
        style: { width: '120%' },
        maxLength: 100,
        showCount: true,
      },
      visible: globalStore.isLite,
    },
    // 轻巧版下只显示 visible 为 true 的字段
  ].filter((f) =>
    globalStore.isLite ? f.visible || f.onlyLiteVisible : !f.onlyLiteVisible,
  )

  const hideItemList: string[] = [
    'second_base_unit',
    'custom_unit_1',
    'custom_unit_2',
    'custom_unit_3',
  ]
  return (
    <>
      {_.map(baseInfoForm, (formItem) => {
        const { id } = formItem
        return (
          (!hideItemList.includes(id!) || formValue[id!]) && (
            <Col key={id} xs={24} sm={24} md={16} lg={12} xl={12}>
              <FormItem {...formItem} />
            </Col>
          )
        )
      })}
    </>
  )
})

export default BaseInfo
