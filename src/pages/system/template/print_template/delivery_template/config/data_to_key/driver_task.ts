import _ from 'lodash'
import moment from 'moment'

function driverTaskData(data: any[]) {
  const driverMap: { [key: string]: any } = {} // {'司机1':{order:[{订单1},{订单1},{订单1}]},'司机2':{order:[{订单1},{订单1},{订单1}]}
  // 按司机进行拆分
  _.forEach(data, (item) => {
    if (Object.hasOwnProperty.call(driverMap, item.driver_name)) {
      driverMap[item.driver_name] = {
        order: [item].concat(driverMap[item.driver_name].order),
      }
    } else {
      driverMap[item.driver_name] = {
        order: [item],
      }
    }
  })
  // 将司机对象变成数组 [[司机任务单],[司机任务单],[司机任务单]....]
  const detailMap: any[] = []
  _.forEach(driverMap, (value, key) => {
    if (key === '-') return
    detailMap.push(Object.values(value)[0])
  })
  //   let taskList
  //   if (sortFn) {
  //     taskList = sortFn(data.order_detail)
  //   } else {
  //     taskList = _.sortBy(data.order_detail, 'sort_id')
  //   }
  return _.map(detailMap, (item) => {
    const driverTask = _.map(item, (o, i) => {
      return {
        序号: i + 1,
        // 序号: o.sort_id || '-',
        订单号: o.serial_no || '-',
        商户名: o.receive_customer || '-',
        收货地址: o.receive_address || '-',
        收货时间:
          moment(o.receive_begin_time).format('MM/DD-HH:mm') +
          '~\n' +
          moment(o.receive_end_time).format('MM/DD-HH:mm'),
        配送框数: '',
        回收框数: '',
        订单备注: '',
      }
    })

    const common = {
      配送司机: item[0].driver_name || '-',
      车牌号: item[0].driver_car_license || '-',
      联系方式: item[0].driver_phone || '-',
      打印时间: moment().format('YYYY-MM-DD HH:mm:ss'),
    }
    return {
      common,
      _table: {
        driver_task: driverTask,
      },
      _origin: data,
    }
  })
}

export default driverTaskData
