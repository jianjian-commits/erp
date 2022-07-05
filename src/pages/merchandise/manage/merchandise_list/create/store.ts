import { makeAutoObservable } from 'mobx'
import { UploadFile } from 'antd/lib/upload/interface'
import _ from 'lodash'
import { Image, Image_Type } from 'gm_api/src/common'
import {
  GetSkuUnitStock,
  ListShelf,
  UpdateSkuUnitStockConfig,
  UpdateSkuUnitStockConfigRequest,
} from 'gm_api/src/inventory'
import {
  CreateSkuV2,
  ListBasicPriceV2,
  GetFinanceCategoryTree,
  Sku,
  Sku_DispatchType,
  Sku_NotPackageSubSkuType,
  Sku_PackageCalculateType,
  Sku_SkuType,
  Sku_SupplierCooperateModelType,
  Unit,
  UpdateSkuV2,
  GetSkuV2,
  Unit_Type,
  ListSkuRequest_RequestData,
  Quotation_Type,
} from 'gm_api/src/merchandise'
import { fetchTreeData } from '@/common/service'
import { formatDataToTree } from '@/common/util'
import { DataNode } from '@/common/interface'
import globalStore, { UnitGlobal } from '@/stores/global'
import {
  MulitUnitForm,
  SkuForm,
} from '@/pages/merchandise/manage/merchandise_list/create/type'
import {
  formatCustomUnits,
  getCascaderValue,
  getCategoryValue,
} from '@/pages/merchandise/manage/merchandise_list/create/util'
import { ListBomMaterial } from 'gm_api/src/production'

/** 单位对象初始值 */
const initBasicUnit = {
  name: '',
  unit_id: '',
  rate: '',
  value: '',
  text: '',
  parent_id: '',
  type: undefined,
}

/** 多单位管理表单初始数据 */
const initMultiFormVale: MulitUnitForm = {
  auxiliary: '0',
  second_base_num: '1',
  second_base_unit_id: '',
  second_base_unit_ratio: '',
  second_base_parent: '',
  custom_units: [],
}

const getLightBaseUnit = () => {
  const unit = _.find(globalStore.unitList, (item) => {
    return item.name === '斤'
  })
  return unit || _.cloneDeep(initBasicUnit)
}

/** 新建商品表单初始数据 */
export const initFormValue: SkuForm = {
  sku_id: '',
  sku_type: Sku_SkuType.NOT_PACKAGE,
  dispatch_type: Sku_DispatchType.ORDER,

  // 基本信息
  name: '',
  customize_code: '',
  categories: globalStore.isLite ? [globalStore.groupId] : [],
  category_id: globalStore.isLite ? globalStore.groupId : '',
  not_package_sub_sku_type: Sku_NotPackageSubSkuType.ORIGIN,
  sorting_type: '1',
  base_unit_id: globalStore.isLite ? getLightBaseUnit().unit_id : '',
  second_base_unit_id: '',
  production_num: '1',
  production_unit_id: '',
  sale_state: '1',

  // 供应链信息
  sale_stocks: '1',
  sale_stocks_num: '999',
  merchandise_inventory_procurement: '0',
  supplier_cooperate_model_type:
    Sku_SupplierCooperateModelType.SCMT_JUST_PROVIDE_GOODS,
  supplier_id: globalStore.isLite ? globalStore.groupId : undefined,
  shelf_ids: ['0'],
  loss_ratio: '0',

  // 包材信息
  package_calculate_type: Sku_PackageCalculateType.FIXED,
  package_num: 1,

  // 财务信息
  finance_category: [],
  tax: '0',
  input_tax: '0',
}
class CreateMerchandiseStore {
  /** 新建页面加载状态 */
  createLoadingState = 0
  /** 编辑状态页面加载状， */
  isEditLoading = false
  /** 商品Id */
  skuId = ''
  /** 商品表单 */
  formValue: SkuForm = _.cloneDeep(initFormValue)
  /** 商品图片 */
  imageList: UploadFile[] = []
  /** 多单位表单 */
  multiUnitFormValue: MulitUnitForm = _.cloneDeep(initMultiFormVale)
  /** 系统单位 */
  unitList = globalStore.unitList
  /** 基本单位 */
  basicUnitObj: UnitGlobal = globalStore.isLite
    ? getLightBaseUnit()
    : _.cloneDeep(initBasicUnit)

  /** 辅助单位 */
  auxiliaryUnitObj: UnitGlobal = _.cloneDeep(initBasicUnit)
  /** 是否可编辑辅助单位 */
  isAuxiliaryUnitDisabled = false
  /** 辅助单位可选单位 */
  auxiliaryUnitList: UnitGlobal[] = []
  /** 自定义单位基础单位，自定义单位不能与该列表中单位相同 */
  customBasicUnitList: UnitGlobal[] = []
  /** 自定义单位列表 */
  customUnitList: UnitGlobal[] = []
  /** 自定义单位编辑状态 */
  isCustomUnitDisabled: boolean[] = [false, false, false]
  /** 生产单位可选单位 */
  productionUnitList: UnitGlobal[] = []
  /** 采购单位可选单位 */
  purchaseUnitList: UnitGlobal[] = []
  /** 生产单位是否被BOM引用 */
  useInBom = false
  /** 商品税收分类数据 */
  financeRateList: any[] = []
  /** 货位数据 */
  shelfList: DataNode[] = []
  /** 标准售价 */
  basic_price = ''

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setSkuId = (id: string) => {
    this.skuId = id
  }

  setCreateLoadingState() {
    this.createLoadingState += 1
  }

  /** 更新商品图片 */
  setImageList(filesList?: UploadFile[]) {
    this.imageList = filesList || []
  }

  /** 设置辅助单位，不可与基本单位同类型 */
  setAuxiliaryUnitList = () => {
    const { production_unit_id } = this.formValue
    const productionUnitObj: UnitGlobal =
      globalStore.getUnit(production_unit_id)
    console.log('productionUnitObj', productionUnitObj)
    this.auxiliaryUnitList = _.filter(this.unitList, (unitItem) => {
      const { type } = unitItem
      if (type === Unit_Type.COUNT) {
        return (
          unitItem.text !== this.basicUnitObj.text &&
          unitItem.text !== productionUnitObj.text
        )
      } else {
        return (
          unitItem.type !== this.basicUnitObj.type &&
          unitItem.type !== productionUnitObj.type
        )
      }
    })
  }

  /** 更新商品表单数据 */
  setFormValue = (values?: any) => {
    this.formValue = values || _.cloneDeep(initFormValue)
  }

  /** 更新自定义单位基础单位 */
  setCustomBasicUnitList = () => {
    // 自定基础单位包含基本单位、辅助单位同类单位
    this.customBasicUnitList = _.filter(this.unitList, (unitItem) => {
      if (unitItem.type === 5) {
        return unitItem.unit_id === this.basicUnitObj.unit_id
      } else {
        return unitItem.type === this.basicUnitObj.type
      }
    })
  }

  /** 更新基本单位 */
  setBasicUnitObj = (unit: UnitGlobal) => {
    this.basicUnitObj = unit
    this.customUnitList = []
    this.setAuxiliaryUnitObj()
    this.setMultiUnitFormValue()
    this.setProductionUnitList()
  }

  /** 更新生产单位可选单位 */
  setProductionUnitList() {
    this.productionUnitList = _.filter(this.unitList, (unitItem) => {
      const baseUnitJudge =
        this.basicUnitObj.type !== 5
          ? unitItem.unit_id === this.basicUnitObj.unit_id ||
            unitItem.type !== this.basicUnitObj.type
          : true
      const auxiliaryUnitJudge =
        this.auxiliaryUnitObj.type !== 5
          ? unitItem.type !== this.auxiliaryUnitObj.type
          : unitItem.unit_id !== this.auxiliaryUnitObj.unit_id
      return baseUnitJudge && auxiliaryUnitJudge
    })
  }

  /** 更新辅助单位 */
  setAuxiliaryUnitObj = (unit?: UnitGlobal) => {
    this.auxiliaryUnitObj = unit || _.cloneDeep(initBasicUnit)
    this.setPurchaseUnitList()
    this.setCustomBasicUnitList()
    this.setProductionUnitList()
  }

  /** 更新自定义单位 */
  setCustomUnitList = (unitList: UnitGlobal[]) => {
    const newUnitList = []
    for (let i = 0; i < unitList.length; i++) {
      if (this.isCustomUnitDisabled[i] && this.customUnitList[i]) {
        // 不可编辑部分从原数组中获取
        newUnitList.push(_.cloneDeep(this.customUnitList[i]))
      } else {
        // 可编辑部分从新数组中获取
        newUnitList.push(unitList[i])
      }
    }
    this.customUnitList = newUnitList
    this.setPurchaseUnitList()
  }

  /** 删除不可编辑的自定义单位 */
  deleteCustomUnit(id: number) {
    _.remove(this.customUnitList, (unitItem, index) => {
      return id === index
    })
  }

  /** 更新采购单位可选单位 */
  setPurchaseUnitList = () => {
    const newList: UnitGlobal[] = []
    if (this.basicUnitObj.text) {
      newList.push(this.basicUnitObj)
    }
    // if (this.auxiliaryUnitObj.text) {
    //   newList.push(this.auxiliaryUnitObj)
    // }

    this.purchaseUnitList = [...newList, ...this.customUnitList]
  }

  /** 获取商品税收数据 */
  async getFinanceRateList() {
    // 商品税收
    let list: any[] = []
    await GetFinanceCategoryTree().then(async (json) => {
      const { categories } = json.response
      if (categories) {
        list = await formatDataToTree(
          categories!,
          'finance_category_id',
          'name',
        )
        this.financeRateList = list
      }
    })
    return list
  }

  /** 获取货位数据 */
  async getShelfList() {
    let list: any[] = []
    const params = globalStore.isOpenMultWarehouse
      ? {
          with_warehouse_tree: true,
        }
      : {}
    await ListShelf(params).then(async (json) => {
      const shelves: DataNode[] = _.map(json.response.shelves, (item) => {
        const { name, shelf_id, is_leaf, parent_id } = item
        return {
          value: shelf_id,
          key: shelf_id,
          title: name,
          disabled: !is_leaf,
          parentId: parent_id || '0',
          children: [],
        }
      })
      this.shelfList = shelves
      list = await formatDataToTree(json.response.shelves, 'shelf_id', 'name')
    })
    return list
  }

  /** 更新多单位表单 */
  setMultiUnitFormValue = (values?: MulitUnitForm) => {
    this.multiUnitFormValue =
      values ||
      _.cloneDeep({
        ...initMultiFormVale,
        second_base_parent: this.basicUnitObj.text,
      })
  }

  /** 销售库存数据提交 */
  submitStockConfig(sku: Sku) {
    const { sku_id, base_unit_id } = sku
    const { sale_stocks, sale_stocks_num } = this.formValue
    const req: UpdateSkuUnitStockConfigRequest = {
      sku_unit: {
        sku_id,
        unit_id: base_unit_id,
      },
      config: this.formValue.sale_stocks,
    }
    // 销售库存为自定义库存，传数值
    if (sale_stocks === '3') {
      req.virtual_stock = {
        base_unit: {
          unit_id: base_unit_id,
          quantity: sale_stocks_num.toString(),
        },
      }
    }
    return UpdateSkuUnitStockConfig(req)
  }

  /** 更新自定义单位可编辑状态 */
  setIsCustomUnitDisabled() {
    this.isCustomUnitDisabled.shift()
    this.isCustomUnitDisabled.push(false)
  }

  /** 保存 */
  submit(values: any) {
    const submitValue = { ..._.cloneDeep(this.formValue), ...values }
    const {
      // 基本信息
      base_unit_id,
      cost, // 成本价
      basic_price, // 标准价
      second_base_unit_id,
      second_base_unit_ratio,
      production_unit_id,
      purchase_unit_id,
      sorting_type,
      sale_state,
      // 供应链信息
      merchandise_inventory_procurement,
      supplier_id,
      purchaser_id,
      shelf_ids,
      loss_ratio,
      expiry_date,
      // 包材信息
      package_sku_id,
      // 财务信息
      finance_category,
      tax,
      input_tax,
    } = submitValue
    // 商品图片
    const images: Image[] = []
    if (this.imageList.length) {
      _.forEach(this.imageList, (imageItem) => {
        images.push({
          type: Image_Type.TYPE_QINIU,
          path: imageItem.response.key.toString(),
        })
      })
    }

    const alias = submitValue.alias
      ? [
          ...new Set(
            submitValue.alias
              .split(/[,，|；;]/g)
              .filter((aliasItem: string) => aliasItem),
          ),
        ]
      : []

    const repeated_field = {
      // 商品别名
      alias,
      images,
      extras: [],
    }

    // 自定义单位
    const customUnits: Unit[] = _.map(this.customUnitList, (unitItem) => {
      const { parent_id, name, rate, unit_id } = unitItem
      return {
        parent_id,
        name: name.trim(),
        rate,
        unit_id: Number(unit_id) >= 100 ? unit_id : '0',
      }
    })

    // 生产单位
    const productionUnitItem = globalStore.getUnit(production_unit_id!)

    const sku = {
      ...submitValue,
      repeated_field,
      dispatch_type: Sku_DispatchType.ORDER,
      // 非包材商品传固定值
      sku_type: Sku_SkuType.NOT_PACKAGE,
      /** --------基本信息-------- */
      category_id: submitValue.categories[submitValue.categories.length - 1],
      is_weight: sorting_type === '1',
      second_base_unit_id: second_base_unit_id || '0',
      second_base_unit_ratio:
        !second_base_unit_ratio || second_base_unit_ratio === 'undefined'
          ? ''
          : second_base_unit_ratio,
      // 自定义单位
      units: { units: customUnits },
      // TODO: Get接口未返回，暂时这么写
      production_unit_id: production_unit_id || submitValue.base_unit_id,
      // 生产单位
      production_unit: {
        rate: submitValue.production_num + '',
        parent_id: submitValue.base_unit_id,
        // TODO: Get接口未返回，暂时这么写
        unit_id: production_unit_id || submitValue.base_unit_id,
        name: productionUnitItem?.name || this.basicUnitObj.text,
      },
      // 采购单位
      purchase_unit_id: purchase_unit_id || base_unit_id,
      // 销售状态
      on_sale: sale_state === '1',
      /** --------供应链信息-------- */
      // 库存采购
      manual_purchase: merchandise_inventory_procurement === '1',
      supplier_id: supplier_id || '0',
      purchaser_id: purchaser_id || '0',
      shelf_id: shelf_ids?.length ? shelf_ids[shelf_ids.length - 1] : '0',
      loss_ratio: Number(loss_ratio) + '',
      expiry_date: expiry_date || 0,
      /** --------包材信息-------- */
      package_sku_id: package_sku_id || '0',
      /** --------财务信息-------- */
      finance_category_id:
        finance_category && finance_category.length
          ? finance_category[finance_category.length - 1]
          : '0',
      tax: Number(tax) + '',
      input_tax: Number(input_tax) + '',
      cost: cost === undefined || cost === null ? '0' : Number(cost) + '',
    }
    const params = sku.sku_id ? { sku } : { sku: { ...sku, sku_id: '0' } }
    if (globalStore.isLite) {
      // 轻巧版下，标准价格的传参数逻辑
      params.basic_prices = [
        {
          items: {
            basic_price_items: [
              {
                on_shelf: true,
                order_unit_id: base_unit_id,
                fee_unit_price: {
                  unit_id: base_unit_id,
                  val: Number(basic_price || 0) + '',
                },
              },
            ],
          },
          sku_id: sku.sku_id || '0',
          quotation_id: globalStore.stationInfo.default_quotation_id,
        },
      ]
    }

    if (!sku.sku_id) {
      return CreateSkuV2(params)
    } else {
      return UpdateSkuV2(params)
    }
  }

  getStock(sku_id: string, unit_id: string) {
    return GetSkuUnitStock({ sku_id, unit_id }).then((json) => {
      return json.response.sku_unit_stock
    })
  }

  /** 获取标准售价 */
  getBasicPrice(sku_id: string) {
    const params = {
      paging: { limit: 999 },
      request_data: ListSkuRequest_RequestData.CATEGORY,
      filter_params: {
        sku_id,
        quotation_type: Quotation_Type.WITHOUT_TIME,
      },
    }
    return ListBasicPriceV2(params).then((res) => {
      const { basic_prices = [] } = res.response
      const basic_price =
        basic_prices[0]?.items?.basic_price_items![0]?.fee_unit_price?.val
      this.basic_price = basic_price || ''
      return res
    })
  }

  getUseInBom(skuId: string) {
    ListBomMaterial({ sku_id: skuId, paging: { limit: 2 } }).then((json) => {
      this.useInBom = !!json.response.bom_materials.length
    })
  }

  /** 获取商品信息 */
  async getSkuDetail(sku_id: string) {
    this.isEditLoading = true
    this.getUseInBom(sku_id)
    const financeList = await this.getFinanceRateList()
    const shelfList = await this.getShelfList()
    const { categoryMap } = await fetchTreeData()
    if (globalStore.isLite) await this.getBasicPrice(sku_id)

    return GetSkuV2({ sku_id }).then(async (json) => {
      const { sku } = json.response
      if (sku) {
        const {
          // 基本信息
          repeated_field,
          category_id,
          is_weight,
          base_unit_id,
          second_base_unit_id,
          second_base_unit_ratio,
          units,
          production_unit_id,
          production_unit,
          on_sale,
          // 供应链信息
          manual_purchase,
          supplier_id,
          purchaser_id,
          shelf_id,
          expiry_date,
          // 包材信息
          package_sku_id,
          // 财务信息
          finance_category_id,
        } = sku

        let newFormValue: SkuForm = {
          ...initFormValue,
          ...sku,
        }

        // 轻巧版下需要从ListBasicPriceV2中获取标准价
        if (globalStore.isLite) newFormValue.basic_price = this.basic_price

        // 初始辅助单位可以修改
        this.isAuxiliaryUnitDisabled = false

        // 销售库存
        // const { config, virtual_stock } = await this.getStock(
        //   sku_id,
        //   base_unit_id,
        // )

        if (repeated_field) {
          const { alias, images } = repeated_field

          // 商品图片
          if (images?.length) {
            const imagesFileList: UploadFile[] = []
            _.forEach(images, (imageItem, index) => {
              const { path } = imageItem
              imagesFileList.push({
                uid: `-${index + 1}`,
                name: `image_${index}`,
                status: 'done',
                url: `https://qncdn.guanmai.cn/${path}?imageView2/3/w/70`,
                response: {
                  key: path,
                },
              })
            })
            this.setImageList(imagesFileList)
          } else {
            this.setImageList([])
          }

          // 商品别名
          if (alias?.length) {
            newFormValue = {
              ...newFormValue,
              alias: alias.join('，'),
            }
          }
        }

        // 商品分类
        const { ids } = getCategoryValue([], [category_id], categoryMap)
        const categories = ids

        // 基本单位
        const basicUnit = globalStore.getUnit(base_unit_id)
        // 辅助单位
        const auxiliaryUnit = globalStore.getUnit(second_base_unit_id || '')

        this.setBasicUnitObj(basicUnit)

        let newMultiFormValue: MulitUnitForm = {
          auxiliary: '0',
          custom_units: [],
          second_base_parent: basicUnit.text,
          second_base_num: '1',
        }

        // 库存单位
        let inventory_unit = basicUnit.text
        let second_base_unit = ''

        // 辅助单位
        if (auxiliaryUnit) {
          newMultiFormValue = {
            ...newMultiFormValue,
            auxiliary: '1',
            second_base_unit_id,
            second_base_unit_ratio: second_base_unit_ratio,
          }
          inventory_unit = `${basicUnit.text}、${auxiliaryUnit.text}`
          second_base_unit = `${auxiliaryUnit.text}（${second_base_unit_ratio}${basicUnit.text}）`
          this.setAuxiliaryUnitObj(auxiliaryUnit)
          this.isAuxiliaryUnitDisabled = true
        }

        // 自定义单位
        if (units?.units) {
          const { newMultiFormList, newUnitList, newCustomFormValue } =
            formatCustomUnits(units.units)
          const customDisabled = []
          for (let i = 0; i < 3; i++) {
            if (newMultiFormList[i] && newMultiFormList[i].custom_unit) {
              customDisabled.push(true)
            } else {
              customDisabled.push(false)
            }
          }
          this.isCustomUnitDisabled = customDisabled
          newMultiFormValue = {
            ...newMultiFormValue,
            custom_units: newMultiFormList,
          }

          newFormValue = {
            ...newFormValue,
            ...newCustomFormValue,
          }
          this.setCustomUnitList(newUnitList)
        }

        this.setMultiUnitFormValue(newMultiFormValue)

        // 商品税收分类
        let finance_category = []
        if (finance_category_id) {
          const { values } = getCascaderValue(
            { texts: [], values: [] },
            finance_category_id,
            financeList,
          )
          finance_category = values
        }

        // 货位
        let shelf_ids: string[] = []
        if (!shelf_id || shelf_id === '0') {
          shelf_ids = ['0']
        } else {
          const { values } = getCascaderValue(
            { texts: [], values: [] },
            shelf_id,
            shelfList,
          )
          shelf_ids = values || ['0']
        }

        newFormValue = {
          ...newFormValue,
          categories,
          second_base_unit,
          inventory_unit,
          finance_category,
          shelf_ids,
          sorting_type: is_weight ? '1' : '0',
          production_unit_id:
            production_unit_id && production_unit_id !== '0'
              ? production_unit_id
              : basicUnit.value,
          production_num: production_unit?.rate || '1',
          product_basic_unit: `1${basicUnit.name}`,
          sale_state: on_sale ? '1' : '0',
          supplier_id: supplier_id === '0' ? undefined : supplier_id,
          purchaser_id: purchaser_id === '0' ? undefined : purchaser_id,
          shelf_id: shelf_id === '0' ? undefined : shelf_id,
          package_sku_id: package_sku_id === '0' ? undefined : package_sku_id,
          merchandise_inventory_procurement: manual_purchase ? '1' : '0',
          expiry_date: expiry_date === 0 ? undefined : expiry_date,
          //   sale_stocks: config + '',
          //   sale_stocks_num:
          //     config === 3 && virtual_stock?.base_unit
          //       ? virtual_stock?.base_unit.quantity
          //       : undefined,
        }

        this.setFormValue(newFormValue)
        this.isEditLoading = false
        return newFormValue
      }
    })
  }

  /** 清空数据 */
  clearStore() {
    this.createLoadingState = 0
    this.isEditLoading = false
    this.skuId = ''
    this.formValue = _.cloneDeep(initFormValue)
    this.imageList = []
    this.multiUnitFormValue = _.cloneDeep(initMultiFormVale)
    this.basicUnitObj = globalStore.isLite
      ? getLightBaseUnit()
      : _.cloneDeep(initBasicUnit)
    this.auxiliaryUnitObj = _.cloneDeep(initBasicUnit)
    this.isAuxiliaryUnitDisabled = false
    this.auxiliaryUnitList = []
    this.customBasicUnitList = []
    this.isCustomUnitDisabled = [false, false, false]
    this.productionUnitList = []
    this.purchaseUnitList = []
    this.basic_price = ''
    this.useInBom = false
  }
}

export default new CreateMerchandiseStore()
