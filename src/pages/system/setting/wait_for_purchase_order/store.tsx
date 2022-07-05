import { makeAutoObservable, toJS } from 'mobx'
import {
  UpdateAppointTimeSettings,
  GetAppointTimeSettings,
  AppointTimeSettings_Settings_SingleSetting,
  AppointTimeSettings_Type,
  AppointTimeSettings,
} from 'gm_api/src/preference'

type SelectedItem = Partial<AppointTimeSettings_Settings_SingleSetting>
/** 一天的毫秒数 */
const DAY_MM = '86400000'
const DAY_START = '0'
class Store {
  purchase_settings: Partial<AppointTimeSettings> = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  /** 由于settings很深，这里坐下处理，通过this.settings获取比较方便 */
  get settings() {
    return this.purchase_settings.settings?.settings || []
  }

  /** 提交的时候这里处理下数据 */
  get setting(): AppointTimeSettings {
    // 由于下面会修改数据，为了不影响到store的数据导致页面变化，所以这里转换一下
    const tempSettings = toJS(this.purchase_settings.settings?.settings)!
    const type1Settings = tempSettings.filter(
      (v) =>
        v.type ===
        AppointTimeSettings_Type.NONPROCESSED_PURCHASE_TIME_BEFORE_ORDER_RECV,
    )
    const firstItem = type1Settings[0]
    const { pre_start_time } = firstItem
    /**
     * 对于before_days来说：
     * 只有一项的话第一项的before_days要设为0,
     * 两项的话第一项的before_days时1，第二项为0
     */
    if (pre_start_time === DAY_START) {
      /**
       * 如果开始时间为0，比如汇总销售订单收货时间在当天 00:00 - 第二天 00:00,
       * 那么 pre_end_time 的时间要设置为第24时对应的毫秒数，且before_days要设为0
       * [
       *  ...,
       *  { type: 1, pre_start_time: '0', pre_end_time: '86400000', before_days: '0' },
       *  ...
       * ]
       */
      firstItem.pre_end_time = DAY_MM
      firstItem.before_days = DAY_START
      // 且要保证settings里面只包含一项type为1，则把除第一项的type为1的item去掉，目前只有两项，所以这里去掉第二项
      const lastIndex = tempSettings.lastIndexOf(type1Settings[1])
      tempSettings.splice(lastIndex, 1)
    } else {
      /**
       * 如果开始时间不是00：00，比如汇总销售订单收货时间在当天 01:00 - 第二天 01:00，
       * 那么第一项时间的pre_start_time和end设为0，和01：00对应的毫秒数3600000，
       * 第二项的开始时间pre_start_time设置为01：00对应的毫秒数3600000，pre_end_time设置为第24时对应的毫秒数86400000
       *
       * @example
       * [
       *  ...,
       *  { type: 1, pre_start_time: '0', pre_end_time: '3600000', before_days: '1' },
       *  { type: 1, pre_start_time: '3600000', pre_end_time: '86400000', before_days: '0' },
       *  ...
       * ]
       */
      firstItem.pre_start_time = DAY_START
      firstItem.pre_end_time = pre_start_time
      firstItem.before_days = '1'
      type1Settings[1].pre_start_time = String(Number(pre_start_time))
      type1Settings[1].before_days = DAY_START
    }
    return {
      ...(this.purchase_settings as Required<AppointTimeSettings>),
      settings: {
        settings: tempSettings,
      },
    }
  }

  getSetting() {
    return GetAppointTimeSettings().then(({ response }) => {
      const { purchase_settings } = response
      const tempSettings = purchase_settings.settings?.settings!
      const typeOneSettings = tempSettings.filter(
        (v) =>
          v.type ===
          AppointTimeSettings_Type.NONPROCESSED_PURCHASE_TIME_BEFORE_ORDER_RECV,
      )
      /**
       * 如果汇总销售订单收货时间在当天 00:00 - 第二天 00:00，
       * 那么后台只会返回一项{type: 1, pre_start_time: '0', pre_end_time: '86400000'},
       * 如果汇总销售订单收货时间在当天 01:00 - 第二天 01:00，
       * 那么后台会返回两项 {type: 1, pre_start_time: '0', pre_end_time: '3600000'},
       *                  {type: 1, pre_start_time: '3600000', pre_end_time: '86400000'},
       */
      if (typeOneSettings.length > 1) {
        /**
         * 返回了两项，可是页面上展示：01:00 - 第二天 01:00，那么要把第一项的结束时间赋值给其开始时间(赋值之前pre_start_time为0)，
         * 否则页面上会展示当天 00:00 - 第二天 00:00，
         */
        typeOneSettings[0].pre_start_time = typeOneSettings[0].pre_end_time
      } else {
        /**
         * 返回了1项，即意味着页面上要展示当天 00:00 - 第二天 00:00，那么为了方便提交的时候调用get setting()
         * 都照着两个去判断，这里再塞一项
         */
        tempSettings.push({ ...typeOneSettings[0] })
      }
      this.purchase_settings = purchase_settings
    })
  }

  updateSetting() {
    return UpdateAppointTimeSettings({
      appoint_settings: this.setting,
    })
  }

  updateSelected(index: number, value: SelectedItem) {
    Object.assign(this.settings[index], value)
  }
}

export default new Store()
export type { SelectedItem }
