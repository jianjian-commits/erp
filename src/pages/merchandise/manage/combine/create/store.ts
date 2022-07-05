import { makeAutoObservable } from 'mobx'
import { UploadFile } from 'antd/lib/upload/interface'
import { getRandomId } from '@/pages/merchandise/util'
import _ from 'lodash'
import {
  BasicPrice,
  CreateSkuV2,
  GetSkuV2,
  Ingredient,
  ListBasicPriceV2,
  ListBasicPriceV2Response,
  Quotation_Type,
  Sku,
  Sku_DispatchType,
  Sku_SkuType,
  UpdateSkuV2,
} from 'gm_api/src/merchandise'
import { Image, Image_Type } from 'gm_api/src/common'
import {
  getCombineUnitRate,
  getPriceUnitList,
  getSkuUnitList,
} from '@/pages/merchandise/manage/combine/util'
import { UnitGlobal } from '@/stores/global'
import {
  BoundCombineChildrenType,
  BoundCombineDataType,
  BoundTableFormFieldsItem,
} from '@/pages/merchandise/price_manage/customer_quotation/detail/combine/interface'
import { catchUnitsFromBasicPriceV2 } from '@/common/util'

export interface TableConfigInterface {
  key: string
  unitList: UnitGlobal[]
  skuOptions: Sku[]
  unitName: string | undefined
  on_sale: boolean
}
export interface CombineFormInterface extends Sku {
  sale_state: string
}

export const initTableConfigItem: TableConfigInterface = {
  key: getRandomId(),
  unitList: [],
  skuOptions: [],
  unitName: undefined,
  on_sale: false,
}

export const initTableFormItem: Ingredient = {
  ratio: '',
  order_unit_id: undefined,
  sku_id: undefined,
}

export const initFormFileds: CombineFormInterface = {
  sku_id: '0',
  // 基本信息
  name: '',
  customize_code: '',
  base_unit_id: '600041',
  sale_state: '1',
  repeated_field: {
    images: [],
  },
  desc: '',
  // 组成商品
  ingredients: {},
  // 固定字段
  sku_type: Sku_SkuType.COMBINE,
  dispatch_type: Sku_DispatchType.ORDER,
  category_id: '0',
  loss_ratio: '0',
}
class Store {
  skuId: string | undefined = undefined
  /** 基本信息表单 */
  infoFormFileds = _.cloneDeep(initFormFileds)
  /** 商品图片 */
  imageList: UploadFile[] = []
  /** 组成商品表单配置项 */
  tableFormConfig: TableConfigInterface[] = [_.cloneDeep(initTableConfigItem)]
  /** 组成商品sku列表 */
  tableSkuList: (Sku | undefined)[] = []
  /** 组成商品报错 */
  tableErrorTip = ''
  /** 页面加载状态 */
  isLoading = false
  /** 编辑提交数据 */
  submitSku = _.cloneDeep(initFormFileds)
  /** 绑定报价单列表 */
  boundTableList: BoundCombineDataType[] = []
  /** 报价信息表单 */
  boundFormFields: { [key: string]: BoundTableFormFieldsItem } = {}
  /** 绑定报价单，且不需要编辑 */
  boundedList: BoundCombineDataType[] = []
  /** 已有报价信息 */
  basicPriceList: BasicPrice[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 更新skuId */
  setSkuId(id?: string) {
    this.skuId = id || undefined
  }

  /** 更新商品图片 */
  setImageList(filesList?: UploadFile[]) {
    this.imageList = filesList || []
  }

  /** 更新组成商品配置 */
  setTableFormConfig(value: TableConfigInterface[]) {
    this.tableFormConfig = value
  }

  /** 添加组成商品配置列表项 */
  addTableFormConfigItem() {
    this.tableFormConfig.push({
      ..._.cloneDeep(initTableConfigItem),
      key: getRandomId(),
    })
  }

  /** 删除组成商品配置列表项 */
  deleteTableFormConfigItem(index: number) {
    this.tableFormConfig.splice(index, 1)
  }

  /** 更新组成商品配置项 */
  setTableFormConfigItem<T extends keyof TableConfigInterface>(
    key: T,
    value: TableConfigInterface[T],
    index: number,
  ) {
    this.tableFormConfig[index][key] = value
  }

  /** 更新商品列表 */
  setTableSkuList(value: Sku[]) {
    this.tableSkuList = value
  }

  /** 添加商品列表项 */
  addTableSkuListItem() {
    this.tableSkuList.push(undefined)
  }

  /** 删除商品列表项 */
  deleteTableSkuListItem(index: number) {
    this.tableSkuList.splice(index, 1)
  }

  /** 更新商品列表项 */
  setTableSkuListItem(index: number, sku: Sku) {
    this.tableSkuList[index] = sku
  }

  /** 设置组成商品报错提示 */
  setTableErrorTip(tip: string) {
    this.tableErrorTip = tip
  }

  /** 获取绑定报价单列表数据 */
  getBoundTableList(res: ListBasicPriceV2Response) {
    const { basic_prices = [], quotation_map = {} } = res
    this.boundTableList = []
    this.boundedList = []
    this.basicPriceList = []
    this.boundFormFields = {}

    // 存储在对应报价单中绑定信息超过20条的组成商品信息
    const errorList: { skuName: string; quotationName: string }[] = []

    _.forEach(basic_prices, (basicPriceItem) => {
      const { quotation_id } = basicPriceItem
      // 当前组合商品报价信息
      if (basicPriceItem.sku_id === this.skuId) {
        this.basicPriceList.push(basicPriceItem)
        const { inner_name } = quotation_map[quotation_id!]
        let isAllSkuBound = true
        const items: BoundCombineChildrenType[] = []
        const combinSkus: string[] = []
        let totalPrice = 0

        if (this.submitSku.ingredients?.ingredients) {
          // 组成商品在对应报价单中的报价信息
          _.forEach(
            this.submitSku.ingredients.ingredients,
            (ingredientItem) => {
              const { sku_id, ratio, order_unit_id = '' } = ingredientItem

              if (sku_id && sku_id !== '0') {
                const ingredientSku = _.find(
                  this.tableSkuList,
                  (skuItem) => skuItem?.sku_id === sku_id,
                )
                const { name = '' } = ingredientSku || {}

                // 获取单位
                const unitList = getSkuUnitList(ingredientSku!)
                const unitItem = _.find(unitList, (item) => {
                  return item.unit_id === order_unit_id
                })

                const orderUnitName = unitItem?.text || ''

                // 是否绑定报价单，及价格信息
                let isBound = true
                let price = 0
                // 组成商品在报价单中已绑定的所有单位
                const basicPrices = _.find(basic_prices, (priceItem) => {
                  return (
                    priceItem.sku_id === sku_id &&
                    priceItem.quotation_id === quotation_id
                  )
                })
                const priceUnitList = getPriceUnitList(
                  ingredientSku!,
                  unitList,
                  order_unit_id,
                )

                let priceUnitObj: UnitGlobal | undefined
                let orderUnitObj: UnitGlobal | undefined
                let feeUnitPrice = { unit_id: '' }

                if (basicPrices) {
                  const {
                    items: { basic_price_items = [] },
                  } = basicPrices

                  /** 商品在报价单与组合商品中单位相同的 价格/单位 */
                  const basicPrice = _.find(
                    basic_price_items,
                    (unitPriceItem) => {
                      return unitPriceItem.order_unit_id === order_unit_id
                    },
                  )

                  /** 报价单中同一商品已存在20个不同 价格/单位 */
                  if (basic_price_items.length >= 20 && !basicPrice) {
                    isAllSkuBound = false
                    isBound = false
                    errorList.push({
                      skuName: name,
                      quotationName: inner_name || '',
                    })
                  }

                  if (basicPrice) {
                    // 已绑定报价单，获取价格信息
                    const { fee_unit_price } = basicPrice
                    if (fee_unit_price) {
                      const { val, unit_id } = fee_unit_price
                      feeUnitPrice = _.cloneDeep(fee_unit_price)

                      _.forEach(priceUnitList, (unitItem) => {
                        if (unitItem.unit_id === order_unit_id) {
                          orderUnitObj = _.cloneDeep(unitItem)
                        }
                        if (unitItem.unit_id === unit_id) {
                          priceUnitObj = _.cloneDeep(unitItem)
                        }
                      })

                      const rate = getCombineUnitRate(
                        orderUnitObj as UnitGlobal,
                        priceUnitObj as UnitGlobal,
                        ingredientSku!,
                      )
                      const itemPrice =
                        Math.round(Number(val) * 100) *
                        Math.round(Number(ratio) * 10000) *
                        rate

                      totalPrice =
                        Math.round((totalPrice * 1000000 + itemPrice) / 10000) /
                        100
                      price = Number(val)
                    }
                  } else {
                    const basicIndex = _.findIndex(
                      this.basicPriceList,
                      (priceItem) => {
                        return (
                          priceItem.sku_id === sku_id &&
                          priceItem.quotation_id === quotation_id
                        )
                      },
                    )
                    if (basicIndex === -1) {
                      this.basicPriceList.push(basicPrices)
                    }
                    isAllSkuBound = false
                    isBound = false
                  }
                } else {
                  isAllSkuBound = false
                  isBound = false
                }

                if (!isBound) {
                  this.boundFormFields[`${sku_id}_${quotation_id}`] = {
                    price: undefined,
                    fee_unit_price: { unit_id: order_unit_id },
                  }
                }

                // 获取组成商品名称列表
                combinSkus.push(name)

                // 组成商品列表
                items.push({
                  fee_unit_price: feeUnitPrice,
                  quotation_id,
                  sku_id,
                  order_unit_id,
                  isBound,
                  name,
                  ratio,
                  orderUnitName,
                  priceUnitName: priceUnitObj?.text || '',
                  price,
                  priceUnitList,
                })
              }
            },
          )
        }
        // 组合商品-报价单条目
        const listItem: BoundCombineDataType = {
          ...this.submitSku,
          isAllSkuBound,
          items,
          totalPrice,
          quotation_id,
          quotation: inner_name,
          combineSkus: '',
          combineItem: [],
        }

        if (!isAllSkuBound) {
          // 存在未绑定报价单的组成商品，展示给用户填写价格信息
          this.boundTableList.push(listItem)
        } else {
          // 不存在未绑定的组成商品，提交请求前，重新计算组合商品单价
          this.boundedList.push(listItem)
        }
      }
    })

    return { errorList, boundTableList: this.boundTableList }
  }

  /** 校验是否需要补充报价单绑定信息 */
  isNeedBindQuotation() {
    const idList: string[] = _.map(
      this.submitSku.ingredients?.ingredients,
      (ingredientItem) => {
        return ingredientItem.sku_id as string
      },
    )
    // 获取组合商品及组成商品的报价信息
    return ListBasicPriceV2({
      filter_params: {
        sku_ids: [...idList, this.skuId || ''],
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC],
      },
      paging: { limit: 999, offset: 0 },
    }).then((json) => {
      return this.getBoundTableList(json.response)
    })
  }

  /** 更新组合商品单价 */
  setBoundListTotalPrice(value: {
    [key: string]: { price: number; fee_unit_price: { unit_id: string } }
  }) {
    const key = _.keys(value)[0]
    const idList = key.split('_')
    const skuId = idList[0]
    const quotationId = idList[1]

    const newList = _.map(this.boundTableList, (tableItem) => {
      let newtotalPrice = 0
      if (tableItem.items.length) {
        _.map(tableItem.items, (childItem, index) => {
          const { sku_id, ratio, quotation_id, order_unit_id, priceUnitList } =
            childItem
          if (sku_id === skuId && quotation_id === quotationId) {
            const { price, fee_unit_price } = value[key]
            childItem.price = price
            childItem.fee_unit_price = fee_unit_price
            tableItem.items[index].price = price
            tableItem.items[index].fee_unit_price = fee_unit_price
          }

          const ingredientSku = _.find(
            this.tableSkuList,
            (skuItem) => skuItem?.sku_id === sku_id,
          )

          let priceUnitObj: UnitGlobal | undefined
          let orderUnitObj: UnitGlobal | undefined

          _.forEach(priceUnitList, (unitItem) => {
            if (unitItem.unit_id === order_unit_id) {
              orderUnitObj = _.cloneDeep(unitItem)
            }
            if (unitItem.unit_id === childItem.fee_unit_price.unit_id) {
              priceUnitObj = _.cloneDeep(unitItem)
            }
          })

          if (priceUnitObj && orderUnitObj) {
            const rate = getCombineUnitRate(
              orderUnitObj as UnitGlobal,
              priceUnitObj as UnitGlobal,
              ingredientSku!,
            )
            const itemPrice =
              Math.round(Number(childItem.price) * 100) *
              Math.round(Number(ratio) * 10000) *
              rate

            newtotalPrice =
              Math.round((newtotalPrice * 1000000 + itemPrice) / 10000) / 100
          }
        })
      }
      return { ...tableItem, totalPrice: newtotalPrice }
    })

    this.boundTableList = newList
  }

  /** 向后台提交数据 */
  getRequestData(infoForm: any, tableForm: any) {
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

    // 组成商品
    const ingredients = _.map(tableForm.sku, (skuItem, index: number) => {
      return {
        ...skuItem,
        ratio: skuItem.ratio + '',
        on_sale: this.tableFormConfig[index].on_sale,
      }
    })

    const submitValue = {
      ...this.infoFormFileds,
      ...infoForm,
      on_sale: infoForm.sale_state === '1',
      repeated_field: { images },
      ingredients: { ingredients },
    }

    return submitValue
  }

  /** 新建组合商品 */
  createCombine(infoForm: any, tableForm: any) {
    const submitValue = this.getRequestData(infoForm, tableForm)
    return CreateSkuV2({ sku: submitValue })
  }

  /** 获取新增绑定报价单价格 */
  getBasicPrice() {
    const newBasicPrice: BasicPrice[] = []
    const combineBasicPrice: BasicPrice[] = []

    _.forEach([...this.boundTableList, ...this.boundedList], (combineItem) => {
      const { quotation_id, base_unit_id, totalPrice } = combineItem
      _.forEach(combineItem.items, (skuItem) => {
        if (!skuItem.isBound) {
          // 未绑定报价单的组成商品
          const { sku_id, order_unit_id, price, fee_unit_price } = skuItem
          const item = {
            on_shelf: true,
            order_unit_id,
            fee_unit_price: {
              ...fee_unit_price,
              val: price + '',
            },
            minimum_order_number: '1',
          }

          newBasicPrice.push({
            basic_price_id: '0',
            sku_id: sku_id,
            quotation_id: quotation_id,
            items: {
              basic_price_items: [item],
            },
          })
        }
      })

      const combineBasiePrice = _.find(this.basicPriceList, (basicItem) => {
        return (
          basicItem.sku_id === this.skuId &&
          basicItem.quotation_id === quotation_id
        )
      })

      // 组合商品
      combineBasicPrice.push({
        basic_price_id: '0',
        ...combineBasiePrice,
        sku_id: combineItem.sku_id,
        quotation_id: quotation_id,
        items: {
          basic_price_items: [
            {
              minimum_order_number: '1',
              on_shelf: combineBasiePrice?.items.basic_price_items[0].on_shelf,
              order_unit_id: base_unit_id,
              fee_unit_price: {
                unit_id: base_unit_id,
                val: totalPrice + '',
              },
            },
          ],
        },
      })
    })
    return { combineBasicPrice, newBasicPrice }
  }

  /** 提交编辑请求 */
  async submitUpdate() {
    const { combineBasicPrice, newBasicPrice } = await this.getBasicPrice()
    return UpdateSkuV2({
      sku: { ...this.submitSku, production_unit: undefined },
      basic_prices: combineBasicPrice,
      ingredient_basic_prices: newBasicPrice,
    })
  }

  /** 编辑组合商品 */
  updateCombine(infoForm: any, tableForm: any) {
    const submitValue = this.getRequestData(infoForm, tableForm)
    this.submitSku = submitValue

    return this.isNeedBindQuotation()
  }

  /** 获取组合商品信息 */
  async getCombineDetail(id: string) {
    this.isLoading = true
    return GetSkuV2({ sku_id: id })
      .then((json) => {
        const { sku, ingredient_map } = json.response
        if (sku) {
          const { repeated_field, on_sale, ingredients } = sku

          if (repeated_field) {
            // 商品图片
            const { images } = repeated_field

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
          }

          // 组成商品
          let tableForm: Ingredient[] = []
          if (ingredients?.ingredients) {
            tableForm = ingredients.ingredients
            this.tableFormConfig = []
            _.forEach(ingredients.ingredients, async (skuItem, index) => {
              const { sku_id, order_unit_id } = skuItem
              const sku = ingredient_map![sku_id as string]
              const unitList = getSkuUnitList(sku)
              const unitSelect = _.find(unitList, (unitItem) => {
                return unitItem.unit_id === order_unit_id
              })
              this.tableSkuList.push(sku)
              this.tableFormConfig.push({
                key: getRandomId(),
                unitList,
                skuOptions: [sku],
                unitName: unitSelect?.text || '',
                on_sale: !!sku.on_sale,
              })
            })
          }

          const infoForm = {
            ...sku,
            sale_state: on_sale ? '1' : '0',
          }

          this.infoFormFileds = infoForm

          return { infoForm, tableForm }
        }
      })
      .finally(() => {
        this.isLoading = false
      })
  }

  clearQuotationTable() {
    this.boundTableList = []
    this.basicPriceList = []
  }

  clearStore() {
    this.skuId = undefined
    this.infoFormFileds = _.cloneDeep(initFormFileds)
    this.imageList = []
    this.tableFormConfig = [_.cloneDeep(initTableConfigItem)]
    this.tableErrorTip = ''
    this.isLoading = false
    this.tableSkuList = []
    this.submitSku = _.cloneDeep(initFormFileds)
    this.boundFormFields = {}
    this.boundTableList = []
    this.boundedList = []
  }
}

export default new Store()
