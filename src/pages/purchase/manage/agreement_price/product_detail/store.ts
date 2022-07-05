import { makeAutoObservable, toJS } from 'mobx'
import {
  Quotation,
  CreateQuotationBasicPrice,
  Quotation_Type,
  BasicPrice,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import moment from 'moment'
import { SheetType } from './type'

const initSheet: SheetType = {
  skuName: '',
  skuId: '',
  ssuId: '',
  ssuSelectData: [],
  categoryName: '',
  price: '',
  pkgPrice: '',
  measUnit: '',
  pkgUnit: '',
  rate: '',
  supplier: {},
  unitId: '',
  startTime: moment().startOf('day').valueOf().toString(),
  endTime: moment().endOf('day').valueOf().toString(),
}

class Store {
  list: SheetType[] = [{ ...initSheet }]

  constructor() {
    makeAutoObservable(this)
  }

  resetData() {
    this.list = [{ ...initSheet }]
  }

  addRow(index = this.list.length) {
    this.list.splice(index + 1, 0, { ...initSheet })
  }

  deleteRow(index: number) {
    this.list.splice(index, 1)
  }

  updateList(index: number, msg: any) {
    this.list[index] = {
      ...this.list[index],
      ...msg,
    }
  }

  createSheet() {
    const sheets: any = {}
    _.forEach(this.list, (item, index) => {
      const key = `${item.supplier.supplier_id}:${item.startTime}:${item.endTime}`
      const quotation: Omit<Quotation, 'quotation_id'> = {
        type: Quotation_Type.PROTOCOL_PRICE,
        start_time: item.startTime,
        end_time: item.endTime,
        supplier_id: item.supplier.supplier_id,
      }
      const basic_price: Omit<BasicPrice, 'basic_price_id'> = {
        sku_id: item.skuId,
        unit_id: item.unitId,
        price: item.price,
        ssu_id: item.ssuId,
      }
      // const basic_price: Omit<BasicPrice, 'basic_price_id'> = _.map(
      //   this.list,
      //   (e) => {
      //     return {
      //       sku_id: e.skuId,
      //       items: {
      //         basic_price_items: [
      //           {
      //             fee_unit_price: {
      //               val: e.price + '',
      //               unit_id: e.purchase_unit_id,
      //             },
      //             order_unit_id: e.purchase_unit_id,
      //           },
      //         ],
      //       },
      //     }
      //   },
      // )
      if (sheets[key]) {
        sheets[key].basic_prices.push(basic_price)
      } else {
        const ProtocolSheet = { quotation, basic_prices: [basic_price] }
        sheets[key] = ProtocolSheet
      }
      // })
    })
    return CreateQuotationBasicPrice({ sheets }).then((res) => {
      return res.response
    })
  }
}

export default new Store()
