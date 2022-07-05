import { makeAutoObservable } from 'mobx'
import {
  UpdateAppointTimeSettings,
  GetAppointTimeSettings,
  AppointTimeSettings,
  AppointTimeSettings_Settings_SingleSetting_CategoryList,
} from 'gm_api/src/preference'
export type Categories =
  AppointTimeSettings_Settings_SingleSetting_CategoryList[]

const initSettingData = {
  appoint_time_settings_id: '',
  group_id: '',
  station_id: '',
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  settingData: AppointTimeSettings = initSettingData

  categories: Categories = []

  category_setting_open = false

  initData() {
    this.settingData = initSettingData
    this.categories = []
    this.category_setting_open = false
  }

  /**
   * @description 获取上次的设置
   * @param settingType 根据type 区分是哪个设置 获取分类的type,1 代表按非加工订单查看，2代表非加工按商品查看 34代表按加工订单/商品查看
   */
  fetchSetting(settingType: number) {
    return GetAppointTimeSettings().then((res) => {
      const { purchase_settings } = res.response
      this.settingData = purchase_settings
      const setting = purchase_settings?.settings?.settings
      if (setting) {
        const index = setting.findIndex((f) => f.type === settingType)
        const { categories = [], category_setting_open = false } =
          setting[index] || {}
        this.categories = categories
        this.category_setting_open = category_setting_open
      }
    })
  }

  updateSetting(
    settingType: number,
    categories: Categories,
    category_setting_open: boolean,
  ) {
    if (this.settingData.settings) {
      const setting = this.settingData.settings.settings
      if (setting) {
        const index = setting.findIndex((f) => f.type === settingType)
        setting[index].categories = categories
        setting[index].category_setting_open = category_setting_open
      }
      return UpdateAppointTimeSettings({ appoint_settings: this.settingData })
    }
  }
}

export default new Store()
