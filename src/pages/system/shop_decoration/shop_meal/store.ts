import { runInAction, makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { getImages } from '@/common/service'
import {
  ListShop,
  UpdateShop,
  ShopLayout_Type,
  Shop_Type,
  Shop_Status,
} from 'gm_api/src/preference'
import { ListServicePeriod } from 'gm_api/src/enterprise'
import { ListQuotationV2, Quotation_Type } from 'gm_api/src/merchandise'

import { BannersType, ImageType, RadioCheckType } from '../common/interface'

type DataType = {
  text: string
  value: string
}[]

class BMealStore {
  active_tab = ''
  shop_id = ''
  type = Shop_Type.TYPE_SOCIAL
  layoutType = ShopLayout_Type.TYPE_WITHOUT_TIME
  resBody: any = null

  // 报价单
  sale = ''
  sales: DataType = []
  // 运营时间
  time = ''
  times: DataType = []

  name = ''
  phone = ''
  notice = true
  notice_message = ''

  logo: ImageType | undefined = undefined

  register_code = false
  // 是否开启商城端验货
  status = false
  // 是否开启更改验收数
  inspectionCount_code = false
  // 签名
  need_write_signature = false
  allow_update_signature = false
  radioCheck: RadioCheckType = {
    value: 1,
    data: [
      {
        value: 1,
        text: '不生成售后申请',
        tip: '验收数与出库数不符时，不做额外处理，不生成售后单据',
        disabled: true,
      },
      {
        value: 2,
        text: '生成仅退款申请',
        tip: '当验收数与出库数不符时，验收数与出库数的差异值自动生成仅退款申请',
      },
      {
        value: 3,
        text: '生成退款退货申请',
        tip: '当验收数与出库数不符时，验收数与出库数的差异值自动生成退款退货申请',
      },
    ],
  }

  switch_mp_page = 1

  // 店铺装修
  banners: BannersType[] = []

  noticeTitle = ''
  noticeContent = ''
  noticeImageUrl: ImageType | undefined = undefined

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateProps({ name, value }: { name: string; value: any }) {
    _.set(this, name, value)
  }

  setSwitchMpPage(value = 1) {
    this.switch_mp_page = value
  }

  setRadioValue(value: any) {
    this.radioCheck.value = value
  }

  changeActiveTab(v: string) {
    this.active_tab = v
  }

  changeName(v: string) {
    this.name = v
  }

  changePhone(v: string) {
    this.phone = v
  }

  changeLogo(file: ImageType) {
    this.logo = file
  }

  _handleChangeNoticeTitle(v: string) {
    this.noticeTitle = v
  }

  _handleChangeNoticeContent(v: string) {
    this.noticeContent = v
  }

  _handleChangeNoticeImageUrl(v: ImageType[]) {
    this.noticeImageUrl = _.head(v)
  }

  _handleChangeShopSort(v: ShopLayout_Type) {
    this.layoutType = v
  }

  _handleChangeSale(v: string) {
    this.sale = v
  }

  _handleChangeTime(v: string) {
    this.time = v
  }

  _handleChangeNotice(v: boolean) {
    this.notice = v
  }

  changeNoticeMessage(v: string) {
    this.notice_message = v
  }

  _handleChangeRegisterCode(v: boolean) {
    this.register_code = v
  }

  _handleChangeInspectionCode(v: boolean) {
    this.status = v
  }

  _handleChangeInspectionCountCode(v: boolean) {
    this.inspectionCount_code = v
  }

  _handleChangeBanners(banners: BannersType[]) {
    this.banners = banners
  }

  // 获取报价单数据
  getListQuotation() {
    return ListQuotationV2({
      paging: { all: true },
      filter_params: {
        parent_quotation_ids: ['0'],
        quotation_types: [Quotation_Type.WITHOUT_TIME, Quotation_Type.PERIODIC], // 只需要报价单类型
      },
    }).then((json) =>
      runInAction(() => {
        this.sales = _.map(json.response.quotations, (v) => ({
          text: v.inner_name || '',
          value: v.quotation_id,
        }))
        return json
      }),
    )
  }

  // 获取运营时间
  getListServicePeriod() {
    // todo: 找对于后台询问接口，大家都没传那个必选字段 type
    return ListServicePeriod({
      paging: {
        all: true,
      },
    }).then((json) =>
      runInAction(() => {
        this.times = _.map(json.response.service_periods, (v) => ({
          text: v.name,
          value: v.service_period_id,
        }))
        return json
      }),
    )
  }

  // 获取数据
  getData() {
    // 暂时 limit: 1，后台为了拓展性，将数据改为数组，目前仅有唯一的一个数据。
    return ListShop({ paging: { limit: 10 }, type: this.type }).then((json) =>
      runInAction(() => {
        const data = _.head(json.response.shops)
        if (data !== undefined) {
          const {
            name,
            shop_id,
            logo,
            layout,
            need_invitation_code,
            customer_service_phone,
            enable_shop_announcement,
            shop_announcement,
            default_service_period_id,
            default_quotation_id,
            status,
            accept_method,
            need_write_signature,
            allow_update_signature,
          } = data
          this.logo = logo ? _.head(getImages([logo])) || this.logo : this.logo
          this.radioCheck.value = accept_method
          this.inspectionCount_code = false
          // 0
          if (Number(status) === Shop_Status.STATUS_UNSPECIFIED) {
            this.status = false
          }
          // 256
          if ((Number(status) & Shop_Status.STATUS_ENABLE_ACCEPT) !== 0) {
            this.status = true
          }
          // 768
          if (
            (Number(status) & Shop_Status.STATUS_ENABLE_CHANGE_ACCEPT_NUM) !==
            0
          ) {
            this.inspectionCount_code = true
          }
          this.shop_id = shop_id
          this.resBody = data
          this.need_write_signature = need_write_signature
          this.allow_update_signature = allow_update_signature
          this.register_code = need_invitation_code || this.register_code
          this.name = name || this.name
          this.phone = customer_service_phone || this.phone
          this.notice = enable_shop_announcement || this.notice
          this.notice_message = shop_announcement || this.notice_message
          this.sale = default_quotation_id || this.sale
          this.time = default_service_period_id || this.time

          // 店铺装修
          this.banners = _.map(layout?.banners, (v) => ({
            ...v,
            image: getImages([v.image])[0],
          }))

          this.noticeTitle = _.get(layout, 'announcement.head', '')
          this.noticeContent = _.get(layout, 'announcement.body', '')
          if (layout?.announcement?.image) {
            this.noticeImageUrl = _.head(getImages([layout.announcement.image]))
          }
          this.layoutType = _.get(
            layout,
            'type',
            ShopLayout_Type.TYPE_WITHOUT_TIME,
          )
        }
        return json
      }),
    )
  }

  update() {
    const params = Object.assign(this.reqParams, { type: this.type })
    return UpdateShop({ shop: params })
  }

  get reqParams() {
    let bshop_inspection_status
    const { status, inspectionCount_code } = this
    if (status === false) {
      bshop_inspection_status = 0
    }
    if (status === true && inspectionCount_code === false) {
      bshop_inspection_status = 256
    }
    if (status === true && inspectionCount_code === true) {
      bshop_inspection_status = 768
    }
    const params = {
      ...this.resBody,
      shop_id: this.shop_id,
      type: this.type,
      layout: {
        banners: _.map(this.banners, (v) => ({
          image: {
            type: v.image?.type,
            weight: v.image?.weight,
            height: v.image?.height,
            path: v.image?.path,
          },
          link: v?.link,
        })),
        announcement: {
          image: this.noticeImageUrl,
          head: this.noticeTitle,
          body: this.noticeContent,
        },
        type: this.layoutType,
      },
      need_write_signature: this.need_write_signature,
      allow_update_signature: this.allow_update_signature,
      need_invitation_code: this.register_code,
      enable_shop_announcement: this.notice,
      shop_announcement: this.notice_message,
      default_service_period_id: this.time,
      default_quotation_id: this.sale,
      name: this.name,
      customer_service_phone: this.phone,
      logo: this.logo && {
        type: this.logo?.type,
        weight: this.logo?.weight,
        height: this.logo?.height,
        path: this.logo?.path,
      },
      status: bshop_inspection_status,
      accept_method: this.radioCheck.value,
    }
    return params
  }
}

export default new BMealStore()
