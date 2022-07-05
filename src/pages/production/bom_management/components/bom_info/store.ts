import { GetSku, Sku } from 'gm_api/src/merchandise'
import {
  Bom,
  GetBom,
  GetBomTree,
  GetBomTreeResponse,
} from 'gm_api/src/production'
import _ from 'lodash'
import { computed } from 'mobx'
/**
 * BOM信息页的Store
 */
class BomInfoStore {
  bomInfo: GetBomTreeResponse = {}

  /**
   * 商品投料与产出的单位比率
   */
  @computed
  get skuRateMap() {
    const map: {
      [key: string]: { unit_id_1: string; unit_id_2: string; rate: string }
    } = {}
    // 计算单位转换比率，key为“sku_id-unit1-unit2”，value为对应的比率
    _.each(this.bomInfo.rates, (v, index) => {
      const indexArr = index.split('-')
      map[indexArr[0]] = {
        unit_id_1: indexArr[1],
        unit_id_2: indexArr[2],
        rate: v,
      }
    })
    return map
  }

  /**
   * 获取BOM信息
   * @param  {string}       bomId BOM的ID
   * @return {Promise<Bom>}       包含BOM的请求
   */
  getBomData(bomId: string): Promise<Bom> {
    const response = GetBom({
      bom_id: bomId,
    }).then((response) => {
      return response.response.bom
    })

    return response
  }

  /**
   * 获取商品信息
   * @param  {string}       skuId 商品的ID
   * @return {Promise<Sku>}       包含商品的请求
   */
  getSkuData(skuId: string): Promise<Sku> {
    const response = GetSku({ sku_id: skuId }).then((response) => {
      return response.response.sku
    })

    return response
  }

  /**
   * 获取BOM数据
   * @param  {string}                      bomId    BOM的ID
   * @param  {string}                      revision BOM的版本
   * @return {Promise<GetBomTreeResponse>}          包含BOM数据的请求
   */
  getBomTreeData(bomId: string, revision: string): Promise<GetBomTreeResponse> {
    const response = GetBomTree({
      bom_snapshot_id: {
        bom_id: bomId,
        revision,
      },
      request_data: 512,
    }).then((response) => {
      if (response.response.boms) {
        this.bomInfo = response.response
      }
      return response.response
    })

    return response
  }
}

export default new BomInfoStore()
