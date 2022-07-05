import { costUnitConversion } from '@/pages/merchandise/manage/util'
import { getProcesses } from '@/pages/production/processing_data/utils'
import { getMaterialRateCostV2, handleUnits } from '@/pages/production/util'
import globalStore from '@/stores/global'
import { MoreSelectDataItem, Tip, TreeListItem } from '@gm-pc/react'
import Big from 'big.js'
import { t } from 'gm-i18n'
import { Filters_Bool } from 'gm_api/src/common'
import { Customer, ListCustomer } from 'gm_api/src/enterprise'
import {
  ListSkuV2,
  ListSkuV2Request_RequestData,
  Sku,
} from 'gm_api/src/merchandise'
import {
  BomType,
  Bom_Process,
  Bom_Process_Type,
  CreateBom,
  GetBom,
  GetProcessTemplate,
  ListBom,
  ListProcessType,
  OutputType,
  ProcessTemplate,
  ProcessType,
  ProcessType_Status,
  Status_Code,
  SyncCookYieldRateToCookedFoodBoms,
  UpdateBom,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable, toJS } from 'mobx'
import {
  BomDetail,
  ByProducts,
  MaterialItem,
  ProcessOfBom,
  SelectedSku,
  SortNum,
} from './interface'
import {
  convertCustomerListToTree,
  getAllProcesses,
  getCombineProcess,
  getMaterialList,
  percentageChange,
} from './utils'

/** 初始BOM详情 */
export const initDetail: BomDetail = {
  bom_id: '',
  type: BomType.BOM_TYPE_PRODUCE,
  sku_id: '',
  name: '',
  desc: '',
  quantity: '0',
  base_unit_id: '',
  customer_ids: { customer_ids: [] },
  // 净菜下默认1024 组合默认512
  status: '0',
  by_products: [],
  combine_processes: [],
  unit_ids: [],
  customized_code: '',
  original_status: 0,
  default_cook_yield_rate: '100',
  product_cost: '0',
  showYield: false,
  selectedSku: undefined,
}

/** 初始BOM工序详情 */
const initBomProcessList: ProcessOfBom = {
  process_template_id: '',
  attrs: [],
  type: Bom_Process_Type.TYPE_NORMAL,
  rank: 0,
  selectProcess: undefined,
  process_yield: undefined,
  sortNum: '0',
}

/** 初始原料详情 */
const initMaterial: MaterialItem = {
  sku_id: '',
  unit_id: '',
  unit_ids: [],
  quantity: '',
  property: 0, // 1 成品 2 中间产物
  sku_name: '',
  base_unit_id: '',
  process_yield: 100,
  cook_yield_rate: '',
  cooked_quantity: '',
  materialRateCost: 0,
  isFinishedProduct: false,
  sortNum: '0',
}

/**
 * 商品条目
 * @extends Partial<Sku>
 */
interface SkuItem extends Partial<Sku> {
  /** 值 */
  value: string
  /** 文本 */
  text: string
  /** 商品条目 */
  children?: SkuItem[]
}

/**
 * BOM详情页（创建页）的Store
 */
class Store {
  /** 全部商品列表 */
  skuList: SkuItem[] = []
  /** BOM的商品列表 */
  bomSkuList: SkuItem[] = []

  /** bom详情 */
  bomDetail: BomDetail = { ...initDetail }

  /** 商户列表 */
  customerList: (Customer & TreeListItem)[] = []

  /** 当前bom选择商户 */
  selectedCustomers: { selectKey: string[]; info: Customer[] } = {
    selectKey: [],
    info: [],
  }

  /** bom 物料列表 */
  materialList: MaterialItem[] = [
    { ...initMaterial },
    { ...initMaterial, isFinishedProduct: true, sortNum: '1' },
  ]

  /** 工序列表 多个地方用到 */
  processList: (ProcessTemplate & MoreSelectDataItem<string>)[] = []

  /** 工序种类的列表 */
  processTypeList: (ProcessType & {
    value: string
    text: string
  })[] = []

  /** BOM工序列表 */
  bomProcessList: ProcessOfBom[] = [{ ...initBomProcessList }]

  /** 更新默认出成率 */
  update_default_yield = false

  /** 相同单位的集合 */
  unitSomeArray = globalStore.getSameUnitArray()

  /** 
   排序num 
   materialNum 目前成品物料放在一起 2为起点
  */
  sortNum: SortNum = {
    materialNum: 2,
    processNum: 1,
  }

  /** 成品的成本 */
  get productCost() {
    return +_.reduce(
      this.materialList,
      (all, { materialRateCost }) => all.add(materialRateCost!),
      Big(0),
    ).toFixed(4)
  }

  get customersNumber() {
    return _.reduce(
      this.selectedCustomers.info,
      (all, next) => {
        return all.add(next.child_number!)
      },
      Big(0),
    )
  }

  /**
   * @class
   */
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /**
   * 初始化BOM
   */
  initBom() {
    this.bomSkuList = []
    this.bomDetail = { ...initDetail }
    this.materialList = [
      { ...initMaterial },
      { ...initMaterial, isFinishedProduct: true, sortNum: '1' },
    ]
    this.selectedCustomers = { selectKey: [], info: [] }
    this.bomProcessList = [{ ...initBomProcessList }]
    this.skuList = []
    this.processList = []
  }

  /**
   * 改变默认出成率
   * @param {boolean} bool 是否使用默认出成率
   */
  changeDefaultYield = (bool: boolean) => {
    this.update_default_yield = bool
  }

  /**
   * 更新BOM选择的商品，方便处理unit_ids
   * @param {SelectedSku} [data]      选择的商品
   * @param {BomDetail}   [bomDetail] BOM详情
   */
  updateBomSelectedSku = (data?: SelectedSku, bomDetail?: BomDetail) => {
    const isDetail = !!bomDetail
    const { value, original } = data ?? {}
    const baseUniId = original?.base_unit_id
    const unit_ids = handleUnits(original!, this.unitSomeArray)
    // 新建和编辑各自需要的一些数据
    const needData = !isDetail
      ? {
          ...this.bomDetail,
          category_id: original?.category_infos?.[1]?.category_id,
          spu_id: original?.category_infos?.[2]?.category_id,
          base_unit_id: baseUniId,
          name: original?.name,
          customized_code: original?.customize_code,
        }
      : { ...bomDetail! }

    this.bomDetail = {
      ...needData,
      ...bomDetail!,
      unit_ids,
      selectedSku: data ? { ...data } : undefined,
    }

    this.materialList.splice(-1, 1, {
      ...initMaterial,
      ...original,
      sku_id: value!,
      unit_id: bomDetail?.base_unit_id || baseUniId!,
      quantity: bomDetail?.quantity || '',
      materialRateCost: 0,
      isFinishedProduct: true,
      unit_ids,
      customize_code: data?.original.customize_code,
    })
  }

  getUnitsWithSameGroup(unitId?: string) {
    const targetUnit = globalStore.getUnit(unitId || '')
    if (!targetUnit) {
      return []
    }

    return globalStore.unitList.filter((unit) => {
      if (targetUnit.parent_id === '0') {
        return unit.unit_id === unitId || unit.parent_id === unitId
      } else {
        return (
          unit.unit_id === unitId || unit.parent_id === targetUnit.parent_id
        )
      }
    })
  }

  /**
   * 更新BOM详情
   * @param {T extends keyof BomDetail} key  BOM的属性
   * @param {BomDetail[T]}              data BOM属性的值
   */
  updateBomDetail<T extends keyof BomDetail>(key: T, data: BomDetail[T]) {
    this.bomDetail[key] = data
  }

  /**
   * 更新整个BOM详情
   * @param {BomDetail} value BOM详情
   */
  updateBomDetails = (value: BomDetail) => {
    this.bomDetail = value
  }

  /**
   * 新增BOM工序列表
   */
  addBomProcessList() {
    const sortNum = this.sortNum.processNum
    this.bomProcessList.push({
      ...initBomProcessList,
      sortNum: sortNum + '',
    })
    this.changeSortNum('processNum', sortNum + 1)
  }

  /**
   * 从工序列表中删除工序
   * @param {number} index 工序的编号
   */
  delBomProcessList(index: number) {
    this.bomProcessList.splice(index, 1)
    this.updateBomProcessYield()
  }

  /**
   * 更新整个工序列表
   * @param {ProcessOfBom[]} item BOM工序的集合
   */
  updateAllBomProcessList(item: ProcessOfBom[]) {
    this.bomProcessList = item
  }

  /**
   * 更新BOM工序名
   * @param {number}                                       index 工序的编号
   * @param {ProcessTemplate & MoreSelectDataItem<string>} value 选择的工序
   */
  updateBomProcessName(
    index: number,
    value?: ProcessTemplate & MoreSelectDataItem<string>,
  ) {
    if (value) {
      const { attrs, ...other } = value
      this.bomProcessList[index] = {
        ...this.bomProcessList[index],
        ...other,
        attrs: [],
        process_yield: 100,
        selectProcess: {
          value: value?.process_template_id,
          text: value?.text,
        },
      }
      return
    }
    this.bomProcessList[index] = { ...initBomProcessList }
    this.updateBomProcessYield()
  }

  /**
   * 更新BOM工序
   * @param {number}                       index 工序的编号
   * @param {T extends keyof ProcessOfBom} name  工序名
   * @param {ProcessOfBom[T]}              value 工序信息
   */
  updateBomProcess<T extends keyof ProcessOfBom>(
    index: number,
    name: T,
    value: ProcessOfBom[T],
  ) {
    this.bomProcessList[index][name] = value
    if (name === 'process_yield') this.updateBomProcessYield()
  }

  /**
   * 更新工序的出成率
   */
  updateBomProcessYield() {
    this.materialList[0].process_yield = +percentageChange(this.bomProcessList)
  }

  /**
   * 新增原料
   */
  addNewMaterial() {
    const sortNum = this.sortNum.materialNum
    this.materialList.splice(-1, 0, { ...initMaterial, sortNum: sortNum + '' })
    this.changeSortNum('materialNum', sortNum + 1)
  }

  /**
   * 删除原料
   * @param {number} index 原料的编号
   */
  delMaterial(index: number) {
    this.materialList.splice(index, 1)
  }

  /**
   * 更新原料列表
   * @param {number}                       index 原料的编号
   * @param {T extends keyof MaterialItem} key   原料的属性
   * @param {MaterialItem[T]}              value 原料属性的值
   */
  updateMaterialList<T extends keyof MaterialItem>(
    index: number,
    key: T,
    value: MaterialItem[T],
  ) {
    if (_.toString(key) === 'sku_id') {
      this.materialList.splice(index, 1, { ...initMaterial })
    }
    this.materialList[index] = { ...this.materialList[index], [key]: value }
  }

  /**
   * 更新原料列表的一个条目
   * @param {number}                 index 原料的编号
   * @param {T extends MaterialItem} item 原料的条目
   */
  updateListItem<T extends MaterialItem>(index: number, item: T) {
    const sortNum = this.sortNum.materialNum
    this.materialList[index] = {
      ...item,
      sortNum: sortNum + '',
    }
    this.changeSortNum('materialNum', sortNum + 1)
  }

  updateSortMaterialList(data: MaterialItem[]) {
    this.materialList = data
  }

  /**
   * 更新选择的客户
   * @param {string[]}   selectKey 选择的key
   * @param {Customer[]} info      客户信息
   */
  updateCustomersSelected(selectKey: string[], info: Customer[]) {
    this.selectedCustomers = { selectKey, info }
  }

  /**
   * 获取包装工序模板
   */
  fetchProcessTemplate() {
    return GetProcessTemplate({ process_pack: true }).then((json) => {
      const { process_template_id, name, customized_code } =
        json.response.process_template
      this.processList = [
        {
          ...json.response.process_template,
          value: process_template_id,
          text: `${name || ''} ${customized_code || ''}`,
        },
      ]
    })
  }

  /**
   * 获取客户列表
   */
  getCustomerList() {
    ListCustomer({ paging: { limit: 999 } }).then((json) => {
      const { customers } = json.response
      // 处理以kid维度展示
      const list = convertCustomerListToTree(customers)
      this.customerList = list
      return json
    })
  }

  /**
   * 获取商品列表
   * @return {Promise<Response<ListSkuV2Response>>} 包含商品列表响应的请求
   */
  fetchSkuList() {
    return ListSkuV2({
      request_data: ListSkuV2Request_RequestData.CATEGORY,
      paging: { limit: 999 },
    }).then((json) => {
      const { skus } = json.response
      this.skuList = _.filter(
        _.map(skus, (item) => ({
          ...item,
          value: item!.sku_id,
          text: item!.name,
        })),
        (sku) => sku.sku_id !== this.bomDetail?.selectedSku?.value,
      )
      return json
    })
  }

  /**
   * 查询物料是否有默认出成率,并且查询bom信息
   * @param  {string}                   skuId 商品的ID
   *  @param  {string}                   isUpdateDefaultYield 批量更新出成率下的查询否有组合bom
   * @return {Promise<ListBomResponse>}       包含BOM列表的请求
   */
  fetchSkuCookYieldRate(skuId: string, isUpdateDefaultYield?: boolean) {
    return ListBom({
      sku_ids: isUpdateDefaultYield ? undefined : [skuId],
      material_sku_ids: isUpdateDefaultYield ? [skuId] : undefined,
      is_default: isUpdateDefaultYield ? undefined : Filters_Bool.TRUE,
      paging: { limit: 999 },
    }).then((res) => res.response)
  }

  /**
   * 获取工序列表
   * @return {Promise<ProcessTemplate[]>} 包含工序模板的请求
   */
  fetchProcessList(isPack: boolean) {
    if (isPack) {
      return this.fetchProcessTemplate()
    }
    // 拉取所有的工序列表, 排除包装工序 -- exclude_process_pack
    return getProcesses({
      filter_deleted: true,
      exclude_process_pack: true,
      // filter_deleted: true,
      paging: { limit: 999 },
    }).then((data) => {
      const list = _.map(data, (item) => ({
        ...item,
        value: item.process_template_id,
        text: `${item.name || ''} ${item.customized_code || ''}`,
      }))
      this.processList = list
      return data
    })
  }

  /**
   * 获取工序种类
   */
  fetchProcessType() {
    ListProcessType({ paging: { limit: 999 } }).then((json) => {
      // status 为 1<<8 表示为默认类型，展示为‘未分类’
      this.processTypeList = json.response.process_types!.map((v) => {
        const isDefault = +(v.status || 0) & ProcessType_Status.STATUS_DEFAULT
        return {
          ...v,
          process_type_id: v.process_type_id,
          name: v.name,
          value: v.process_type_id!,
          text: isDefault ? t('未分类') : v.name!,
        }
      })
      return json
    })
  }

  /**
   * 获取客户列表
   * @param  {any}                           [paging] 分页信息
   * @param  {any}                           [params] 请求的参数
   * @return {Promise<ListCustomerResponse>}          包含客户列表的请求
   */
  fetchCustomerList(paging?: any, params?: any) {
    return ListCustomer({
      q: params?.q,
      level: 1,
      paging,
    }).then((json) => {
      const {
        customers,
        paging: { count },
      } = json.response

      return {
        list: _.map(customers, (v) => ({
          ...v,
          title: 1,
          customerShowName: 1,
        })),
        count,
      }
    })
  }

  /**
   * 获取BOM信息
   * @return {any} BOM信息
   */
  getBomInfo() {
    const { type, bom_id, selectedSku, quantity } = this.bomDetail
    const skuId = selectedSku?.value!
    const allProcesses = getAllProcesses(
      this.bomDetail,
      this.materialList.slice(),
      this.bomProcessList,
    )
    const isPack = type === BomType.BOM_TYPE_PACK
    // 去除接口不需要的字段
    const detail = _.omit(this.bomDetail!, [
      'method',
      'repeat_bom',
      'by_products',
      'combine_processes',
      'unit_ids',
      'original_status',
      'selectedSku',
      'showYield',
    ])
    return {
      ...detail,
      quantity,
      default_cook_yield_rate:
        this.bomDetail.default_cook_yield_rate || undefined,
      type,
      sku_id: skuId,
      processes: {
        processes: allProcesses,
      },
      customer_ids: {
        customer_ids: this.selectedCustomers?.selectKey.slice(),
      },
      unit_id: isPack
        ? this.materialList[this.materialList.length - 1].unit_id
        : '0',
      bom_id: bom_id || '0',
      category_id: this.bomDetail.selectedSku?.original.category_id,
    } as BomDetail
  }

  /**
   * 创建BOM
   * @return {Promise<Response<CreateBomResponse> | null>} 包含创建BOM响应的请求
   */
  createBom() {
    const info = this.getBomInfo()
    return CreateBom({ bom: { ...info } }, [
      Status_Code.DUPLICATE_NAME,
      Status_Code.DUPLICATE_CODE,
    ]).then((json) => {
      if (json.code === Status_Code.DUPLICATE_NAME) {
        Tip.danger(t('bom名称与已有的bom名称重复，请修改！'))
        return null
      }
      if (json.code === Status_Code.DUPLICATE_CODE) {
        Tip.danger(t('bom编码与已有的bom编码重复，请修改！'))
        return null
      }
      return json
    })
  }

  /**
   * 更新BOM
   * @return {Promise<Response<UpdateBomResponse> | null>} 包含更新BOM响应的请求
   */
  updateBom() {
    const info = this.getBomInfo()
    return UpdateBom({ bom: { ...info } }, [
      Status_Code.DUPLICATE_NAME,
      Status_Code.DUPLICATE_CODE,
    ]).then(async (json) => {
      if (json.code === Status_Code.DUPLICATE_NAME) {
        Tip.danger(t('bom名称与已有的bom名称重复，请修改！'))
        return null
      }
      if (json.code === Status_Code.DUPLICATE_CODE) {
        Tip.danger(t('bom编码与已有的bom编码重复，请修改！'))
        return null
      }
      return json
    })
  }

  /**
   * 更新熟出成率
   * @param {any} data BOM数据
   */
  updateCookYield(data: {
    clean_food_bom_ids?: string[]
    cooked_food_bom_ids?: string[]
  }) {
    const { clean_food_bom_ids, cooked_food_bom_ids } = data
    const value = {
      clean_food_bom_ids,
      cooked_food_bom_ids,
    }
    return SyncCookYieldRateToCookedFoodBoms({ ...value })
  }

  /**
   * 获取BOM详情
   * @param {string} bom_id BOM的ID
   */
  getBomDetail(bom_id: string) {
    GetBom({
      bom_id,
      need_cost: true,
      need_process_templates: true,
      request_data: 256,
      need_material_boms: true,
      need_relation_customers: true,
      need_production_line: true,
    }).then((json) => {
      const {
        bom,
        process_templates,
        material_boms,
        relation_customers,
        skus,
        production_line,
      } = json.response
      // 后续数据处理都需要使用到type 先赋值
      this.bomDetail.type = bom.type
      const isClean = bom.type === BomType.BOM_TYPE_CLEANFOOD
      const isPack = bom.type === BomType.BOM_TYPE_PACK

      const { material_list: list, processes: processesList } = getMaterialList(
        bom?.processes?.processes || [],
      )
      const { materialNum, processNum } = this.sortNum
      let [_materialNum, _processNum] = [materialNum, processNum]

      const material_list = _.map(list, (item) => {
        const sku_info = skus?.[item.sku_id]!
        const process_yield = isClean
          ? +percentageChange(item.processes!)
          : undefined
        // 单品BOM需要单位组来判断物料是否为同一单位组 一次性取单位组 在getBom下使用较为方便
        const unit_ids = handleUnits(sku_info!, this.unitSomeArray)

        const material_cost = costUnitConversion(item?.material_cost, [])
        return {
          ...item,
          skuInfo: sku_info,
          unit_ids,
          sku_name: sku_info?.name,
          customize_code: sku_info?.customize_code,
          base_unit_id: sku_info?.base_unit_id || '',
          not_package_sub_sku_type: sku_info?.not_package_sub_sku_type,
          process_yield,
          material_cost,
          materialBom: material_boms?.[item.sku_id],
          materialRateCost: getMaterialRateCostV2({
            material_cost,
            yieldNumber: isClean ? process_yield : item.quantity,
            isClean,
          }), // 单品、组合不同处理
          sortNum: _materialNum++ + '',
        }
      })

      // 物料数据 => 最后一项通过updateBomSelectedSku方法赋值
      this.materialList = [...material_list, { ...initMaterial }]
      // 工序数据
      this.bomProcessList = _.map(
        isClean
          ? processesList
          : getCombineProcess(bom?.processes?.processes || [], isPack),
        (item) => {
          const processTemplates = process_templates?.[item.process_template_id]
          return {
            ...processTemplates,
            ...item,
            attrs: _.map(item.attrs, (value) => {
              const attrData = _.find(processTemplates?.attrs?.attrs, {
                attr_id: value.attr_id,
              })
              return {
                ...value,
                name: attrData?.name,
                values: [value.val!],
              }
            }),
            selectProcess: {
              value: item.process_template_id,
              text: `${processTemplates?.name} ${processTemplates?.customized_code}`,
              isDelete: !!+processTemplates?.delete_time!,
            },
            sortNum: _processNum++ + '',
          }
        },
      )
      // 副产品
      let by_products: ByProducts[] = []
      const last_process: Bom_Process = _.find(
        bom?.processes?.processes || [],
        (p) => p.outputs && p.outputs[0]?.next_process_id === '0',
      ) as Bom_Process
      by_products = _.map(
        _.filter(
          last_process.outputs,
          (p) => p.type === OutputType.OUTPUT_TYPE_EXTRA,
        ),
        (sku) => {
          const sku_info = skus?.[sku?.material?.sku_id!]

          return {
            sku_id: sku_info?.sku_id || '',
            value: sku_info?.sku_id || '',
            base_unit_id: sku_info?.base_unit_id || '',
            name: sku_info?.name!,
            text: sku_info?.name || '',
          }
        },
      )
      // 已经删除的产线，显示产线名称
      if (production_line?.delete_time && production_line.delete_time !== '0') {
        bom.production_line_id = production_line.name
      }
      // this.bomDetail数据
      this.updateBomSelectedSku(this.getSelectSkuInfo(skus?.[bom.sku_id]!), {
        ...this.bomDetail,
        ..._.omit(bom, ['customer_user_ids', 'processes']),
        by_products,
        original_status: +bom.status!,
      })
      this.bomSkuList = [...by_products]
      // 关联客户数据
      this.selectedCustomers = {
        selectKey: bom.customer_ids?.customer_ids?.slice() || [],
        info: _.filter(relation_customers!, (v) => v.level === 1),
      }
      // 修改sortNum
      this.changeAllSortNum({
        materialNum: _materialNum,
        processNum: _processNum,
      })
      return json
    })
  }

  /**
   * 获取选择商品的信息
   * @param  {Sku} finishSkuInfo 最终商品的信息
   * @param  {string}                     [unitId]      单位的ID
   * @return {any}                                      选择商品的信息
   */
  getSelectSkuInfo(finishSkuInfo: Sku): SelectedSku {
    const { sku_id, name, customize_code } = finishSkuInfo
    return {
      value: sku_id!,
      text: `${name} ${customize_code}`,
      original: finishSkuInfo!,
    }
  }

  /**
   * 更改原料列表
   */
  changeMaterialList() {
    let input_quantity = 100
    let output_quantity = 0
    // 用于校验 生产基线 实际使用的不是这个quantity 不需要做修改
    const quantity = '100'

    const processes = _.map(
      _.filter(this.bomProcessList, (v) => !!v.process_template_id),
      (v, i) => {
        input_quantity = i === 0 ? input_quantity : output_quantity
        output_quantity = +Big(+input_quantity).times(
          Big(v.process_yield! || 0).div(100),
        )
        return {
          ...v,
          input_quantity,
          output_quantity,
          quantity,
        }
      },
    )
    this.bomProcessList = processes
    this.bomDetail = Object.assign({}, this.bomDetail, {
      quantity: '' + output_quantity,
      base_unit_id: this.materialList[0].base_unit_id,
    })
  }

  changeSortNum<T extends keyof SortNum>(key: T, value: SortNum[T]) {
    this.sortNum[key] = value
  }

  changeAllSortNum(value: SortNum) {
    this.sortNum = value
  }
}

export default new Store()
export { initMaterial }
