import { runInAction, makeAutoObservable } from 'mobx'
import moment from 'moment'
import _ from 'lodash'
import { dateTMM, MToDate } from '@/common/util'
import { getImages } from '@/common/service'
import { ListShop, UpdateShop, Shop_Type } from 'gm_api/src/preference'

import { BannersType, ImageType } from '../common/interface'

class Store {
  activeTab = 'base_setting'
  shop_id = ''
  type = Shop_Type.TYPE_EDUCATION
  resBody: any = null // 存储响应

  // 店铺设置
  name = ''
  phone = ''
  logo: ImageType | undefined = undefined
  leave_time = moment().startOf('day').toDate() // 请假截止时间
  leave_day = 0 // 请假截止天数
  help_images: ImageType[] = [] // 帮助手册设置

  // 店铺装修
  banners: BannersType[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  changeActiveTab(tab: string) {
    this.activeTab = tab
  }

  changeName(v: string) {
    this.name = v
  }

  changePhone(v: string) {
    this.phone = v
  }

  _handleChangeLeaveTime(v: Date) {
    this.leave_time = v
  }

  _handleChangeLeaveDay(v: number) {
    this.leave_day = v
  }

  changeLogo(file: ImageType) {
    this.logo = file
  }

  _handleChangeHelpImages(files: ImageType[]) {
    this.help_images = files
  }

  _handleChangeBanners(banners: BannersType[]) {
    this.banners = banners
  }

  // 获取数据
  getData() {
    // 暂时 limit: 1，后台为了拓展性，将数据改为数组，目前仅有唯一的一个数据。
    return ListShop({ paging: { limit: 10 }, type: this.type }).then((json) =>
      runInAction(() => {
        const data = _.head(json.response.shops)
        if (data !== undefined) {
          const {
            customer_service_phone,
            name,
            shop_id,
            absence_rule,
            logo,
            attrs,
            layout,
          } = data
          this.resBody = data
          // 店铺设置
          this.name = name || ''
          this.phone = customer_service_phone || ''
          this.leave_time = MToDate(_.toNumber(absence_rule?.times))
          this.leave_day = absence_rule?.days || 0
          this.logo = logo ? _.head(getImages([logo])) : undefined
          this.help_images = getImages(attrs?.reference_images || [])
          this.shop_id = shop_id
          // 店铺装修
          this.banners = _.map(layout?.banners, (v) => ({
            ...v,
            image: getImages([v.image])[0],
          }))
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
      },
      name: this.name,
      customer_service_phone: this.phone,
      logo: this.logo && {
        type: this.logo?.type,
        weight: this.logo?.weight,
        height: this.logo?.height,
        path: this.logo?.path,
      },
      attrs: {
        reference_images: _.map(this.help_images, (v) => ({
          type: v?.type,
          weight: v?.weight,
          height: v?.height,
          path: v?.path,
        })),
      },
      absence_rule: {
        days: this.leave_day,
        times: dateTMM(this.leave_time as Date),
      },
    }
    return params
  }
}

export default new Store()
