import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import merchandiseSotre from '../store'
import {
  Bom,
  BomType,
  Bom_Process_Material_Property,
  Bom_Status,
  ListBom,
  ListBomRequest,
} from 'gm_api/src/production'
import { Sku } from 'gm_api/src/merchandise'
import { withStatus } from '@/pages/production/bom_management/components/create_bom/utils'

/** 初始化分页数据 */
const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}

/** 初始化筛选数据 */
const initFilter = {
  q: '',
}

class BomStore {
  /** 筛选数据 */
  filter = _.cloneDeep(initFilter)
  /** Bom列表 */
  list: Bom[] = []
  /** Bom总数 */
  count = 0
  /** 分页数据 */
  paging = _.cloneDeep(initPaging)

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 更新筛选数据 */
  setFilter(value?: any) {
    if (!value.bom_types) {
      delete value.bom_types
    }
    this.filter = value || _.cloneDeep(initFilter)
  }

  /** 获取组合商品列表 */
  getBomList(params?: any) {
    if (params?.paging) {
      this.paging = params.paging
    }
    const req: ListBomRequest = {
      ...this.filter,
      sku_ids: [merchandiseSotre.skuId],
      paging: this.paging,
      need_process_templates: true,
      need_sku_infos: true,
    }
    return ListBom(req).then((json) => {
      if (this.paging.offset === 0) {
        // 接口仅在列表数据第一页返回当前筛选条件下数据数量
        this.count = Number(json.response.paging.count) || 0
      }

      const { sku_infos, boms, process_templates } = json.response

      this.list = _.map(boms, (bom) => {
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
          processTemplateName: processTemplate.join(','),
          materials: materialInfo,
          isDefault: withStatus(bom.status!, Bom_Status.STATUS_DEFAULT), // 多出用到统一处理
        }
      })
      return json.response
    })
  }

  /** 清空数据 */
  clearStore() {
    this.filter = _.cloneDeep(initFilter)
    this.list = []
    this.count = 0
    this.paging = _.cloneDeep(initPaging)
  }
}
export default new BomStore()
