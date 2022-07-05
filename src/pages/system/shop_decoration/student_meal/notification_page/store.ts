import { makeAutoObservable, toJS } from 'mobx'
import {
  UpdateShop,
  ListShop,
  Shop_Type,
  Shop,
  ShopLayout_Announcement,
} from 'gm_api/src/preference'
import _ from 'lodash'
class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  params: Shop = {
    shop_id: '0',
    type: Shop_Type.TYPE_EDUCATION,
  }

  announcement: ShopLayout_Announcement = {
    head: '',
    body: '',
  }

  create() {
    // this.params.layout.announcement = this.announcement
    const params = {
      ...this.params,
    }
    params.layout.announcement = this.announcement
    return UpdateShop({ shop: params })
  }

  setAnnouncement(key: string, value: string) {
    _.set(this.announcement, key, value)
    // this.announcement[key] = value
  }

  getNotice() {
    return ListShop({
      paging: { limit: 999 },
      type: Shop_Type.TYPE_EDUCATION,
    }).then((json) => {
      this.params = json.response.shops[0]
      this.announcement = json.response.shops[0].layout?.announcement || {
        body: '',
        head: '',
      }
    })
  }
}

export default new Store()
