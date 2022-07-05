import { makeAutoObservable } from 'mobx'
import {
  ListDeviceSupplier,
  DeviceSupplier,
  DeviceSupplier_Status,
  UpdateDeviceSupplierStatus,
  DeleteDeviceSupplier,
} from 'gm_api/src/device'
import { PaginationProps } from '@gm-pc/react'
import { SortBy } from 'gm_api/src/common'

class Store {
  supplierList: DeviceSupplier[] = []

  sortBy: SortBy[] = []

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  initData() {
    this.supplierList = []
    this.sortBy = []
  }

  changeSortBy(value: SortBy[]) {
    this.sortBy = value
  }

  getSupplierList(params: PaginationProps) {
    return ListDeviceSupplier({
      paging: params.paging,
      sortby: this.sortBy,
    }).then((json) => {
      this.supplierList = json.response.device_suppliers
      return json.response
    })
  }

  updateSupplierStatue(supplier_id: string, status: DeviceSupplier_Status) {
    return UpdateDeviceSupplierStatus({
      device_supplier_id: supplier_id,
      status,
    })
  }

  deleteSupplier(supplier_id: string) {
    return DeleteDeviceSupplier({ device_supplier_id: supplier_id })
  }
}

export default new Store()
