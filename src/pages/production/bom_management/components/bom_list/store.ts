import {
  BomExpand,
  ListBomRequestExpand,
} from '@/pages/production/bom_management/components/bom_list/interface'
import { withStatus } from '@/pages/production/bom_management/components/create_bom/utils'
import { Sku, Sku_SkuType } from 'gm_api/src/merchandise'
import {
  BomType,
  Bom_Process_Material_Property,
  Bom_Status,
  DeleteBom,
  ListBom,
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable, toJS } from 'mobx'

/**
 * BOM完整列表的Store
 */
class Store {
  /** BOM列表 */
  bomList: BomExpand[] = []

  /** BOM的筛选条件 */
  filter: ListBomRequestExpand = {}

  /**
   * 构造函数
   * @class
   */
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /**
   * 初始化筛选条件
   */
  initFilter() {
    const { isAll, type } = this.filter
    this.filter = { isAll, type }
  }

  /**
   * 初始化所有数据
   */
  initData() {
    this.initFilter()
    this.bomList = []
  }

  /**
   * 完全更改筛选条件
   * @param {ListBomRequestExpand} value 新的筛选条件
   */
  updateFilterObject(value: ListBomRequestExpand) {
    this.filter = value
  }

  /**
   * 更改一项筛选条件
   * @param {T extends keyof ListBomRequestExpand}  name  筛选条件的名
   * @param {ListBomRequestExpand[T]}               value 筛选条件的值
   */
  updateFilter<T extends keyof ListBomRequestExpand>(
    name: T,
    value: ListBomRequestExpand[T],
  ) {
    this.filter[name] = value
  }

  /**
   * 获取数据中某一个属性的集合
   * @param  {{ value: any }[]}  [data] 原始数据
   * @return {any[] | undefined}        某一个属性的集合
   */
  getSomeArray = (data?: { value: any }[]) =>
    data?.length ? _.map(data, ({ value }) => value) : undefined

  /**
   * 获取筛选条件
   * @return {any} 筛选条件
   */
  getFilter() {
    const {
      skuArray,
      materialSkuArray,
      customerArray,
      processTemplateArray,
      isAll,
      type,
      category_ids,
      ...other
    } = this.filter

    return {
      ...other,
      sku_ids: this.getSomeArray(skuArray!),
      material_sku_ids: this.getSomeArray(materialSkuArray!),
      process_template_ids: this.getSomeArray(processTemplateArray!),
      customer_ids: this.getSomeArray(customerArray!),
      category_ids: category_ids?.slice(-1),
      // 兼容关联bom页
      bom_types: isAll
        ? [BomType.BOM_TYPE_CLEANFOOD, BomType.BOM_TYPE_PRODUCE]
        : type!
        ? [type]
        : undefined,
    }
  }

  /**
   * 获取BOM列表
   * @param  {any}                      params 列表的筛选条件
   * @return {Promise<ListBomResponse>}        包含BOM列表的请求
   */
  fetchBomList(params: any) {
    return ListBom({
      ...params,
      ..._.omitBy(this.getFilter(), _.isUndefined),
      need_sku_infos: true,
      need_process_templates: true,
      request_data: 1024,
      need_production_lines: true,
    }).then((json) => {
      const {
        sku_infos,
        boms,
        process_templates,
        production_lines = {},
      } = json.response

      this.bomList = _.map(boms, (bom) => {
        let haveDeleteMaterial = false
        const processTemplate: string[] = []
        const materialInfo: { [key: string]: Sku } = {}
        _.forEach(bom.processes?.processes, (processesItem) => {
          processTemplate.push(
            process_templates?.[processesItem?.process_template_id].name!,
          )
          _.forEach(processesItem.inputs, (inputItem) => {
            const { sku_id: skuId, property } = inputItem.material!
            // 组合下多工序会有本身作为投料要做判断
            if (
              property !== Bom_Process_Material_Property.PROPERTY_PRODUCT &&
              !materialInfo[skuId] &&
              !(bom.type === BomType.BOM_TYPE_PRODUCE && bom.sku_id === skuId)
            ) {
              materialInfo[skuId] = sku_infos?.[skuId]?.sku!
              // 是否有被删除的物料
              !haveDeleteMaterial &&
                (haveDeleteMaterial = !!+sku_infos?.[skuId]?.sku?.delete_time!)
            }
          })
        })
        return {
          ...bom,
          haveDeleteMaterial,
          skuInfo: sku_infos?.[bom.sku_id],
          processTemplateName: processTemplate.join(','),
          materials: materialInfo,
          packMaterials: _.filter(
            materialInfo,
            (v) => v.sku_type === Sku_SkuType.PACKAGE,
          ),
          isDefault: withStatus(bom.status!, Bom_Status.STATUS_DEFAULT), // 多出用到统一处理
          production_line:
            production_lines[bom?.production_line_id || '']?.name || '', // 产线名称
        }
      })
      return json.response
    })
  }

  /**
   * 删除BOM
   * @param  {string}                               bomId BOM的ID
   * @return {Promise<Response<DeleteBomResponse>>}       包含删除BOM响应结果的请求
   */
  deleteBom(bomId: string) {
    return DeleteBom({ bom_id: bomId }).then((json) => {
      return json
    })
  }
}

export default new Store()
