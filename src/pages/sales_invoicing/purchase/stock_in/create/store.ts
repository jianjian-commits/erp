import { makeAutoObservable } from 'mobx'
import { GetInventorySettings } from 'gm_api/src/preference'
import { GetBasicPrice, SsuId } from 'gm_api/src/merchandise'

class Store {
  openBasicPriceState = false
  supplier_id = ''

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setSupplierId(supplier_id: string) {
    this.supplier_id = supplier_id
  }

  setOpenBasicPriceState() {
    return GetInventorySettings().then((res) => {
      this.openBasicPriceState =
        res.response.inventory_settings
          .stock_sheet_price_equal_protocol_price === 1
      return res.response
    })
  }

  getBasicPrice(ssu_id: SsuId) {
    return GetBasicPrice({ supplier_id: this.supplier_id, ssu_id }).then(
      (res) => {
        return res.response
      },
    )
  }
}

export default new Store()
