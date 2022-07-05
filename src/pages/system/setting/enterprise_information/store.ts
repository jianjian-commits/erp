import { makeAutoObservable } from 'mobx'
import { FormType, SelectDataType } from './type'
import {
  UpdateGroup,
  ListProvince,
  GetGroup,
  Province,
} from 'gm_api/src/enterprise'
import { getImages } from '@/common/service'
import globalStore from '@/stores/global'
import { Image } from 'gm_api/src/common'
import _ from 'lodash'

interface ImageType extends Image {
  url: string
}

const initForm: FormType = {
  name: '',
}

class Store {
  form: FormType = { ...initForm }
  group: any = {}
  provinceSelectData: SelectDataType[] = []
  logo: ImageType | undefined = undefined

  constructor() {
    makeAutoObservable(this)
  }

  resetData() {
    this.form = { ...initForm }
    this.group = {}
    this.logo = undefined
  }

  changeLogo(file: ImageType) {
    this.logo = file
  }

  clearLogo() {
    this.logo = undefined
  }

  changeForm<T extends keyof FormType>(key: T, value: FormType[T]) {
    this.form[key] = value
  }

  getProvinceList(country_id: string) {
    return ListProvince({ country_id }).then((res) => {
      const provinces = res.response.provinces
      return provinces
    })
  }

  sortRegionSelectData(provinces: Province[]) {
    const provinceSelectData = provinces.map((province) => {
      return { text: province.local_name, value: province.province_id }
    })
    this.provinceSelectData = provinceSelectData
  }

  getMsgFromAddress(address: any) {
    return _.pick(address, [
      'province_id',
      'city_id',
      'receiver',
      'phone',
      'address',
    ])
  }

  initForm() {
    const group_id = globalStore.userInfo.group_id
    return GetGroup({ group_id }).then((res) => {
      this.group = res.response.group
      const {
        logo: { image },
      } = this.group

      this.form = {
        name: this.group.name,
        country_id: this.group.country_id || '',
        ...this.getMsgFromAddress(this.group.address),
      }
      this.logo = image ? _.head(getImages([image])) : this.logo
      return res.response
    })
  }

  updateGroup() {
    this.group.address = {
      ...this.group.address,
      ...this.getMsgFromAddress(this.form),
    }
    this.group.name = this.form.name
    this.group.logo = {
      image: this.logo && {
        type: this.logo?.type,
        weight: this.logo?.weight,
        height: this.logo?.height,
        path: this.logo?.path,
      },
    }
    return UpdateGroup({ group: this.group }).then((res) => {
      globalStore.fetchUserInfo()
      return res.response
    })
  }
}

export default new Store()
