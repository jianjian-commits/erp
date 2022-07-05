import { action, makeAutoObservable } from 'mobx'

import {
  GetGroup,
  ListProvince,
  Province,
  ListCity,
  GetStation,
  City,
  UpdateStationAvailableCity,
} from 'gm_api/src/enterprise'

import {
  DeliverySettings,
  GetDeliverySettings,
  UpdateDeliverySettings,
} from 'gm_api/src/preference'

interface SelectDataType {
  text: string
  value: string
}

interface RegionSelectDataType {
  provinceValue: string
  cityValue: string
  provinceData: SelectDataType[]
}

class Store {
  city_ids: string[] = []
  regionSelectData: RegionSelectDataType[] = []

  delivery_settings: DeliverySettings = {
    delivery_settings_id: '',
    is_driver_signing_image: false,
    need_write_signature: false,
    forbid_update_signature: false
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  @action
  getCityIds(station_id: string) {
    return GetStation({ station_id }).then((res) => {
      const station = res.response.station
      this.city_ids = station.attrs?.available_city_ids || []
      return station.attrs?.available_city_ids || []
    })
  }

  @action
  getCountryId(group_id: string) {
    return GetGroup({ group_id }).then((res) => {
      return res.response.group.country_id!
    })
  }

  @action
  getProvinceList(country_id: string) {
    return ListProvince({ country_id }).then((res) => {
      const provinces = res.response.provinces
      return provinces
    })
  }

  @action
  getCityListByCityId(city_ids: string[]) {
    return ListCity({ city_ids }).then((res) => {
      return res.response.cities
    })
  }

  sortRegionSelectData(provinces: Province[], cities: City[]) {
    const provinceSelectData = provinces.map((province) => {
      return { text: province.local_name, value: province.province_id }
    })
    this.regionSelectData = cities.map((city) => {
      const data: RegionSelectDataType = {
        cityValue: city.city_id,
        provinceValue: city.province_id,
        provinceData: provinceSelectData,
      }
      return data
    })
    if (this.regionSelectData.length === 0) {
      this.regionSelectData.push({
        provinceData: provinceSelectData,
        cityValue: '',
        provinceValue: provinces[0].province_id,
      })
    }
  }

  updateRegionSelectData<T extends keyof RegionSelectDataType>(
    index: number,
    key: T,
    value: any,
  ): void {
    this.regionSelectData[index][key] = value
  }

  collectCityIds() {
    const city_ids = this.regionSelectData
      .filter((data) => data.cityValue)
      .map((data) => data.cityValue)
    return [...new Set(city_ids)]
  }

  submitForm(station_id: string, available_city_ids: string[]) {
    this.updateSetting()
    return UpdateStationAvailableCity({ station_id, available_city_ids }).then(
      (res) => {
        return res.response
      },
    )
  }

  addRegionSelectData(index: number) {
    const data = { ...this.regionSelectData[index] }
    this.regionSelectData.splice(index + 1, 0, data)
  }

  delRegionSelectData(index: number) {
    if (this.regionSelectData.length === 1) return
    this.regionSelectData.splice(index, 1)
  }

  init(): void {
    GetDeliverySettings().then(
      (res) => (this.delivery_settings = res.response.delivery_settings),
    )
  }

  toggle(): void {
    this.delivery_settings.is_driver_signing_image = !this.delivery_settings
      .is_driver_signing_image
      if(this.delivery_settings.need_write_signature){
        this.toggleSign(false)
      }
  }

  toggleSign(value = !this.delivery_settings.need_write_signature): void {
    this.delivery_settings.need_write_signature = value
    // 关闭则联动关闭追加电子签名
    if(!value){
      this.toggleUpdateSign(false)
    }
    // 打开则联动关闭拍照签收
    if(value){
      this.delivery_settings.is_driver_signing_image = false
    }
  }

  toggleUpdateSign(value = !this.delivery_settings.forbid_update_signature){
    this.delivery_settings.forbid_update_signature = !value
  }
    

  updateSetting(): void {
    UpdateDeliverySettings({
      delivery_settings: this.delivery_settings,
    })
  }
}

export default new Store()
