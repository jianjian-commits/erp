import {
  GetSortingSettings,
  SortingSettings,
  SortingSettings_SortingLockType,
  SortingSettings_SortingNumMethod,
  UpdateSortingSettings,
} from 'gm_api/src/preference'
import { makeAutoObservable } from 'mobx'

class SortingSettingStore {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  sortingData: SortingSettings = {
    sorting_settings_id: '',
    group_id: '',
    station_id: '',
    sorting_num_method:
      SortingSettings_SortingNumMethod.SORTINGNUM_METHOD_ORDER, // 分拣序号生成规则
    sorting_lock: SortingSettings_SortingLockType.SORTINGLOCKTYPE_DELIVERYING, // 锁定分拣
  }

  changeDataItem<T extends keyof SortingSettings>(
    
    key: T,
    value: SortingSettings[T],
  ) {
    this.sortingData[key] = value
  }

  getSortingSettings() {
    return GetSortingSettings().then((res) => {
      this.sortingData = res.response.sorting_settings
      return null
    })
  }

  updateSortingSettings() {
    return UpdateSortingSettings({
      sorting_settings: this.sortingData,
    })
  }
}

export default new SortingSettingStore()
