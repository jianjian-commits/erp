import { Big } from 'big.js'
import _ from 'lodash'

function getDetail(ssuArr: any[]) {
  const len = ssuArr.length
  return _.map(ssuArr, (ssu, index) =>
    [
      `${ssu.receive_customer}*`,
      ssu.ssu_quantity,
      (index + 1) % 2 === 0
        ? '<br>'
        : len !== 1 && index !== len - 1
        ? '+'
        : '',
    ].join(''),
  ).join('')
}

function mergeObjectList(list: any[]) {
  const ssuWithCustomer: { [key: string]: any } = {}
  _.forEach(list, (item) => {
    if (ssuWithCustomer[item.ssu_name]) {
      ssuWithCustomer[item.ssu_name].customer_detail.push({
        ssu_quantity: item.ssu_quantity,
        receive_customer: item.receive_customer,
      })
    } else {
      ssuWithCustomer[item.ssu_name] = {
        ...item,
        customer_detail: [
          {
            ssu_quantity: item.ssu_quantity,
            receive_customer: item.receive_customer,
          },
        ],
      }
    }
  })
  return ssuWithCustomer
}

function driverSSu(list: any[]) {
  const driverMap: { [key: string]: any } = {}
  const driverSSUGroup: { [key: string]: any } = {}
  // 分司机
  _.forEach(list, (item) => {
    if (Object.hasOwnProperty.call(driverMap, item.driver_name)) {
      driverMap[item.driver_name] = {
        order: [item].concat(driverMap[item.driver_name].order),
        details: item.details.concat(driverMap[item.driver_name].details),
      }
    } else {
      driverMap[item.driver_name] = {
        order: [item],
        details: item.details,
      }
    }
  })

  // 分ssu
  _.forEach(driverMap, (driver, key) => {
    // 二级分类
    driverSSUGroup[key] = _.groupBy(
      driver.details,
      (item) => item.category_name_2,
    )
    // 三级分类
    const list = []
    _.forEach(driverSSUGroup[key], (item, categoryKey) => {
      driverSSUGroup[key][categoryKey] = mergeObjectList(item)
    })
  })

  /* --------- 司机ssu列表 ---------------- */
  const driverList = _.map(driverSSUGroup, (dirverSsus) => {
    let driverSsu: any[] = []
    let common = {}
    _.forEach(dirverSsus, (ssuObj, categoryName) => {
      const ssuList = _.map(ssuObj, (ssu) => ({
        商品名称: ssu.ssu_name || '-',
        规格: ssu.unit_text,
        下单数: ssu.ssu_quantity || '-',
        包装单位: ssu.ssu_unit || '-',
        分类: ssu.category_name_2 || '-',
        明细: getDetail(ssuObj),
      }))
      // 每种二级分类的数量
      const groupLength = Object.keys(dirverSsus[categoryName])?.length || 0
      const categoryLen = {
        _special: {
          text: `${categoryName}: ${groupLength}`,
        },
      }
      driverSsu = driverSsu.concat(ssuList, categoryLen)
      common = {
        // 配送司机: ssuArr[0]?.driver_name || '-',
        // 车牌号码: ssuArr[0]?.driver_car_license || '-',
        // 司机电话: ssuArr[0]?.driver_phone || '-',
        // 打印时间: moment().format('YYYY-MM-DD HH:mm:ss'),
      }
    })
    /* --------- 分类商品统计 ---------------- */
    const counter = _.map(dirverSsus, (o, k) => ({
      text: k,
      len: Object.keys(o)?.length || 0,
      quantity: Big(_.sumBy(o, 'ssu_quantity')).toFixed(2),
    }))

    return {
      common,
      _counter: counter,
      _table: {
        driver_sku: driverSsu,
      },
      _origin: list,
    }
  })
  return driverList
}

export default driverSSu
