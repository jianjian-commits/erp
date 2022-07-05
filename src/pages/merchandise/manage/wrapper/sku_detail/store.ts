import { makeAutoObservable } from 'mobx'
import {
  CreateSkuV2,
  GetSkuV2,
  Sku,
  Sku_DispatchType,
  Sku_PackageSubSkuType,
  Sku_SkuType,
  UpdateSkuV2,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import { UploadFile } from 'antd/lib/upload/interface'
import globalStore, { UnitGlobal } from '@/stores/global'
import { fetchTreeData } from '@/common/service'
import { getCategoryValue } from '@/pages/merchandise/manage/merchandise_list/create/util'
import { Image, Image_Type } from 'gm_api/src/common'

export interface WrapperSkuForm extends Sku {
  alias?: string
  categories: any[]
  product_basic_unit?: string
  merchandise_pic?: string[]
  [key: string]: any
}

// 初始包材商品
export const initFormValue = {
  sku_id: '',
  sku_type: Sku_SkuType.PACKAGE,
  dispatch_type: Sku_DispatchType.ORDER,
  loss_ratio: '0',

  // 表单里的
  name: '',
  customize_code: '',
  categories: [],
  category_id: '',
  base_unit_id: '',
  desc: '',
  package_price: '',
  package_sub_sku_type: Sku_PackageSubSkuType.TURNOVER,
  repeated_field: {
    images: [],
    alias: [],
  },
}

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

class WrapperDetailStore {
  /** 编辑状态页面加载 */
  isEditLoading = false
  /** 商品Id */
  skuId = ''
  /** 包材商品表单 */
  formValue: WrapperSkuForm = _.cloneDeep(initFormValue)
  /** 系统单位 */
  unitList = globalStore.unitList
  /** 基本单位 */
  basicUnitObj: UnitGlobal = _.cloneDeep(initBasicUnit)

  /** 商品图片 */
  imageList: UploadFile[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setSkuId = (id: string) => {
    this.skuId = id
  }

  /** 更新商品图片 */
  setImageList(filesList?: UploadFile[]) {
    this.imageList = filesList || []
  }

  /** 更新商品表单数据 */
  setFormValue = (values?: any) => {
    this.formValue = values || _.cloneDeep(initFormValue)
  }

  /** 保存 */
  submit(values: any) {
    const submitValue = { ..._.cloneDeep(this.formValue), ...values }
    const {
      // 基本信息
      loss_ratio,
      package_price,
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

    const repeated_field = {
      // 商品别名
      alias: [submitValue.alias || ''],
      images,
      extras: [],
    }

    // 生产单位

    const sku = {
      ...submitValue,
      // package_price 为string类型
      package_price: package_price.toString(),
      repeated_field,
      dispatch_type: Sku_DispatchType.ORDER,
      // 包材商品传固定值
      sku_type: Sku_SkuType.PACKAGE,
      /** --------基本信息-------- */
      category_id: submitValue.categories[submitValue.categories.length - 1],
      loss_ratio: Number(loss_ratio) + '',
    }
    const params = sku.sku_id ? { sku } : { sku: { ...sku, sku_id: '0' } }

    if (!sku.sku_id) {
      return CreateSkuV2(params)
    } else {
      return UpdateSkuV2(params)
    }
  }

  /** 更新基本单位 */
  setBasicUnitObj = (unit: UnitGlobal) => {
    this.basicUnitObj = unit
  }

  /** 获取商品信息 */
  async getSkuDetail(sku_id: string) {
    this.isEditLoading = true
    const { categoryMap } = await fetchTreeData()

    return GetSkuV2({ sku_id }).then(async (json) => {
      const { sku } = json.response
      if (sku) {
        const {
          // 基本信息
          repeated_field,
          category_id,
          base_unit_id,
          production_unit_id,
        } = sku

        let newFormValue: WrapperSkuForm = {
          ...initFormValue,
          ...sku,
        }

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
          if (alias?.length && alias[0]) {
            newFormValue = {
              ...newFormValue,
              alias: alias[0],
            }
          }
        }

        // 商品分类
        const { ids } = getCategoryValue([], [category_id || ''], categoryMap)
        const categories = ids

        // 基本单位
        const basicUnit = globalStore.getUnit(base_unit_id)

        this.setBasicUnitObj(basicUnit)

        newFormValue = {
          ...newFormValue,
          categories,
          production_unit: { ...basicUnit },
          production_unit_id:
            production_unit_id && production_unit_id !== '0'
              ? production_unit_id
              : basicUnit.value,
          product_basic_unit: `1${basicUnit.name}`,
        }

        this.setFormValue(newFormValue)
        this.isEditLoading = false
        return newFormValue
      }
    })
  }

  /** 清空数据 */
  clearStore() {
    this.isEditLoading = false
    this.skuId = ''
    this.formValue = _.cloneDeep(initFormValue)
    this.imageList = []
    this.basicUnitObj = _.cloneDeep(initBasicUnit)
  }
}

export default new WrapperDetailStore()
