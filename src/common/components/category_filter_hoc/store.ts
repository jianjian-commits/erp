import { t } from 'gm-i18n'
import { makeAutoObservable } from 'mobx'
import { Tip } from '@gm-pc/react'
import _ from 'lodash'
import {
  Category1Options,
  Category2Options,
  Category1MapOptions,
  Category2MapOptions,
  SpuOptions,
  SpuMapOptions,
} from './types'

export class Store {
  categoriesList = []
  spuList = []
  categories: Category1Options[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  clear() {
    this.categories = []
    this.categoriesList = []
    this.spuList = []
  }

  init(api: any) {
    api().then((json) => {
      this.categoriesList = json.response.categories
      this.spuList = json.response.spus
      const categories: Category1Options[] = []
      const cate1Map: Category1MapOptions = {}
      const cate2Map: Category2MapOptions = {}
      const pinleiMap: SpuMapOptions = {}

      const category1: Category1Options[] = []
      const category2: Category2Options[] = []
      const pinlei: SpuOptions[] = json.response.spus

      _.forEach(json.response.categories, (v) => {
        if (v.parent_id === '0') {
          category1.push(v)
        } else {
          category2.push(v)
        }
      })

      _.forEach(category1, (cate1) => {
        cate1Map[cate1.category_id] = cate1
        cate1.children = []
        cate1.value = cate1.category_id
        cate1.text = cate1.name
        categories.push(cate1)
      })

      _.every(category2, (cate2) => {
        cate2Map[cate2.category_id] = cate2
        cate2.value = cate2.category_id
        cate2.text = cate2.name
        cate2.children = []
        if (cate1Map[cate2.parent_id] && cate1Map[cate2.parent_id].children) {
          cate1Map[cate2.parent_id].children?.push(cate2)
        } else {
          Tip.tip(
            t(
              `无法找到二级分类${cate2.category_id}的一级分类${cate2.parent_id},请联系售后服务团队`,
            ),
          )
          // Tip.tip(
          //     t('KEY53', {
          //       VAR1: cate2.category_id,
          //       VAR2: cate2.parent_id,
          //     }) /* src:'无法找到二级分类' + cate2.category_id + '的一级分类' + cate2.parent_id，请联系售后服务团队 => tpl:无法找到二级分类${VAR1}的一级分类${VAR2}，请联系售后服务团队 */,
          // )
          // return false
        }
        return true
      })

      _.every(pinlei, (pl) => {
        pinleiMap[pl.spu_id] = pl
        pl.value = pl.spu_id
        pl.text = pl.name
        if (cate2Map[pl.parent_id] && cate2Map[pl.parent_id].children) {
          cate2Map[pl.parent_id].children?.push(pl)
        } else {
          Tip.tip(
            t(
              `无法找到品类${pl.spu_id}的二级分类${pl.parent_id},请联系售后服务团队`,
            ),
          )
          // Tip.tip(
          //     t('KEY54', {
          //       VAR1: pl.spu_id,
          //       VAR2: pl.parent_id,
          //     }) /* src:'无法找到品类' + pl.spu_id + '的二级分类' + pl.parent_id，请联系售后服务团队 => tpl:无法找到品类${VAR1}的二级分类${VAR2}，请联系售后服务团队 */,
          // )
          // return false
        }
        return true
      })

      this.categories = categories
    })
  }
}

export default new Store()
