import _ from 'lodash'

const getBoxPrintData = (sheetData: any[][]) => {
  const datas = _.slice(sheetData, 1)
  return _.map(datas, (data) => {
    return {
      customer_lv1_name: data[0],
      customer_lv2_name: data[1],
      desc: data[2],
      print_time: data[3],
    }
  })
}

export { getBoxPrintData }
