import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  UpdateAppointTimeSettings,
  GetAppointTimeSettings,
  AppointTimeSettings_Type,
} from 'gm_api/src/preference'
import { dateTMM, MToDate } from '@/common/util'
import moment from 'moment'

interface SelectedItem {
  time: Date
  before_days: number | null
}

const initSelectList: SelectedItem = {
  time: MToDate(_.toNumber('0')),
  before_days: 0,
}

class Store {
  selectedList: SelectedItem[] = _.map(_.times(8), () => ({
    ...initSelectList,
  }))

  settingId = ''
  groupId = ''
  stationId = ''

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  get setting() {
    // pre_start_time 和 pre_end_time 控制前序业务，这里用不上，默认传0和86400000
    const PRE_START_TIME_DEFAULT = '0'
    const PRE_END_TIME_DEFAULT = '86400000'
    return {
      appoint_time_settings_id: this.settingId,
      station_id: this.stationId,
      group_id: this.groupId,
      settings: {
        settings: _.map(this.selectedList, (v, i) => ({
          type: i + 1,
          before_days: '' + v.before_days,
          absolute_time: dateTMM(v.time as Date),
          pre_start_time: PRE_START_TIME_DEFAULT,
          pre_end_time: PRE_END_TIME_DEFAULT,
        })),
      },
    }
  }

  getSetting() {
    return GetAppointTimeSettings({}).then((json) => {
      const { appoint_time_settings_id, group_id, station_id, settings } =
        json.response.purchase_settings

      // 一些配置
      this.settingId = appoint_time_settings_id
      this.groupId = group_id
      this.stationId = station_id

      const productionTime = [
        AppointTimeSettings_Type.PROCESSED_CLEANFOOD_PRODUCE_TIME_BEFORE_ORDER_RECV,
        AppointTimeSettings_Type.PROCESSED_PRODUCE_TIME_BEFORE_ORDER_RECV,
        AppointTimeSettings_Type.PROCESSED_PACK_TIME_BEFORE_ORDER_RECV,
      ]

      // 数据
      const unionSettings = _.unionBy(settings?.settings || [], 'type')
      this.selectedList = _.map(unionSettings, (v) => {
        const time = productionTime.includes(v.type)
          ? moment().endOf('day').toDate()
          : MToDate(_.toNumber(v.absolute_time))
        return {
          time,
          before_days: +v.before_days,
        }
      })

      return json
    })
  }

  updateSetting() {
    return UpdateAppointTimeSettings({
      appoint_settings: this.setting,
    })
  }

  updateSelected<T extends keyof SelectedItem>(
    index: number,
    key: T,
    value: SelectedItem[T],
  ) {
    this.selectedList[index][key] = value
  }
}

export default new Store()
export type { SelectedItem }
