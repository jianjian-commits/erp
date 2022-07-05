/* eslint-disable no-unused-expressions */
/* eslint-disable promise/no-nesting */
import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  Customer_Status,
  Customer_Type,
  CreateCustomer,
  GetCustomer,
  UpdateCustomer,
  Customer,
} from 'gm_api/src/enterprise'
import {
  ListEshopMenuPeriodGroup,
  MenuPeriodGroup,
  MenuPeriodGroup_Type,
} from 'gm_api/src/merchandise'
import {
  GetInviteCode,
  CreateOperationInfo,
  UpdateOperationInfo,
  ListOperationInfo,
  Cycle,
} from 'gm_api/src/eshop'
import moment from 'moment'
import {
  ServiceInfo,
  OperationInfo,
  CycleTimeItem,
  IconsData,
} from '../interface'
import { message } from 'antd'
import { t } from 'gm-i18n'
import { imageDomain } from '@/common/service'
const initSchoolCustomer = {
  name: '',
  customer_id: '0',
  customized_code: '',
  credit_type: 3,
  is_frozen: false,
  is_in_whitelist: false,
  status: Customer_Status.STATUS_IS_BILL_TARGET.toString(),
  type: Customer_Type.TYPE_SCHOOL,
  attrs: {
    addresses: [
      {
        address: '',
        city_id: '',
        district_id: '',
        geotag: {
          latitude: '',
          longitude: '',
        },
      },
    ],
    menu_period_relation: {}, // 餐次关联数据
  },
  settlement: {
    china_vat_invoice: {
      company_name: '',
      financial_contact_name: '',
      financial_contact_phone: '',
    },
  },
}

const initCycleTime = {
  1: {
    start: '',
    end: '',
    start_time: '',
    end_time: '',
  },
  2: {
    start: '',
    end: '',
    start_time: '',
    end_time: '',
  },
  3: {
    start: moment().startOf('day').format('YYYY-MM-DD'),
    end: moment().endOf('day').format('YYYY-MM-DD'),
    start_time: moment().startOf('day').format('HH:mm'),
    end_time: moment().endOf('day').format('HH:mm'),
  },
}
const initServiceInfo = {
  school_id: '0',
  operation_info_id: '0',
  semester_start: moment().startOf('day').toDate(),
  semester_end: moment().endOf('day').toDate(),
  delivery_infos: [],
  cycle: Cycle.CYCLE_WEEKLY,
  CycleTime: { ...initCycleTime },
}

class Store {
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // @ts-ignore
  // 基础信息
  schoolCustomer: Customer = {
    ...initSchoolCustomer,
  }

  // 运营时间
  serviceInfo: ServiceInfo = {
    ...initServiceInfo,
  }

  icons: IconsData[] = [
    {
      id: '1',
      url: imageDomain + 'group_0/type_10/36.png',
    },
    {
      id: '2',
      url: imageDomain + 'group_0/type_10/76.png',
    },
    {
      id: '3',
      url: imageDomain + 'group_0/type_10/920.png',
    },
  ]

  // 地图的地址
  mp_address = ''

  // 学校id 保存起来 改变运营时候用
  school_id = ''

  // 菊花码的地址
  img_url = ''

  setSchoolCustomer(key: string, value: string) {
    _.set(this.schoolCustomer, key, value)
  }

  setServiceInfo<T extends keyof ServiceInfo>(key: T, value: ServiceInfo[T]) {
    this.serviceInfo[key] = value
  }

  setServiceCycle<T extends keyof CycleTimeItem>(key: T, value: string) {
    const { cycle } = this.serviceInfo
    this.serviceInfo.CycleTime[cycle][key] = value
  }

  setServiceInfoDelivery(value: any, index: number, key: string) {
    // if (index !== undefined) {
    //   this.serviceInfo.delivery_infos[index!] = value
    // } else {
    //   this.serviceInfo.delivery_infos.push(value)
    // }
    // this.serviceInfo.delivery_infos[index][key] = value
    _.set(this.serviceInfo.delivery_infos[index], key, value)
  }

  setStoreKey(key: 'mp_address', value: string) {
    this[key] = value
  }

  // 处理时间变成ms
  dealWithTime(time: string) {
    if (!time) {
      return '0'
    }
    const timeArr: string[] = time.split(':')
    const timeInMilliseconds =
      Number(timeArr[0]) * 3600000 + Number(timeArr[1]) * 60000
    return '' + timeInMilliseconds
  }

  // 处理ms变成hours
  dealWithHours(time: string) {
    const tempTime = moment.duration(time)
    const hours = '' + tempTime.hours() + ':' + tempTime.minutes()
    return hours
  }

  /**
   * @description 处理接口放回需要的数据
   * @return operation_info
   */
  dealWithOperationInfo() {
    const { semester_start, semester_end, CycleTime, cycle, delivery_infos } =
      this.serviceInfo
    const infos = _.cloneDeep(delivery_infos)

    _.forEach(infos, (item) => {
      item.receive_time = this.dealWithTime(item.receive_time!)
    })
    const { start, end, start_time, end_time } = CycleTime[cycle]
    const operation_info = {
      ...this.serviceInfo,
      school_id: this.school_id,
      semester_start: '' + semester_start.getTime(),
      semester_end: '' + semester_end.getTime(),
      delivery_info: {
        delivery_infos: infos,
      },
      cycle_info: {
        cycle,
        start: '' + start,
        end: '' + end,
        start_time: '' + start_time!,
        end_time: '' + end_time!,
      },
    } as OperationInfo
    return _.omit(operation_info, ['cycle', 'CycleTime', 'delivery_infos'])
  }

  // 创建学校
  createSchool() {
    _.set(
      this.schoolCustomer,
      'attrs.addresses[0].poi_address',
      this.mp_address,
    )
    return CreateCustomer({ customer: this.schoolCustomer }).then((json) => {
      this.school_id = json.response.customer.customer_id
      message.success(t('创建成功'))
      const operation_info = this.dealWithOperationInfo()
      return CreateOperationInfo({ operation_info })
    })
  }

  // 更改运营时间
  updateSchoolCustomer() {
    _.set(
      this.schoolCustomer,
      'attrs.addresses[0].poi_address',
      this.mp_address,
    )
    const params = { customer: this.schoolCustomer }
    return UpdateCustomer(params)
      .then((json) => {
        this.school_id = json.response.customer.customer_id!
        const operation_info = this.dealWithOperationInfo()
        if (operation_info.operation_info_id === '0') {
          return CreateOperationInfo({ operation_info })
        } else {
          return UpdateOperationInfo({
            // @ts-ignore
            operation_info,
          })
        }
      })
      .then(() => {
        this.getShoolCustomer(this.school_id)
        return message.success(t('修改成功'))
      })
      .catch(() => {
        return message.error(t('修改失败'))
      })
  }

  // 获取运营时间和基本信息
  getShoolCustomer(id: string) {
    Promise.all([
      GetCustomer({ customer_id: id }),
      ListOperationInfo({ school_id: id, paging: { limit: 999 } }),
    ]).then((json) => {
      const { customer } = json[0].response
      const { operation_infos } = json[1].response
      this.schoolCustomer = customer
      this.mp_address = customer?.attrs?.addresses?.[0].poi_address!

      if (operation_infos.length > 0) {
        const {
          delivery_info,
          school_id = '0',
          semester_start,
          semester_end,
        } = operation_infos[0]!
        const { cycle, start, end, start_time, end_time } =
          operation_infos[0].cycle_info!

        const params = _.omit(operation_infos[0], 'cycle_info', 'delivery_info')

        // 将收货时间转成小时
        _.forEach(delivery_info?.delivery_infos!, (item) => {
          item.receive_time = this.dealWithHours(item.receive_time!)
        })

        // 构建cycTime
        const CycleTime = { ...initCycleTime }
        CycleTime[cycle || 1] = {
          start: start!,
          end: end!,
          start_time: start_time!,
          end_time: end_time!,
        }
        this.serviceInfo = {
          ...params,
          cycle: cycle!,
          CycleTime,
          delivery_infos: delivery_info?.delivery_infos!,
          semester_start: new Date(+semester_start!),
          semester_end: new Date(+semester_end!),
          school_id: school_id!,
        }
      }
    })
  }

  // 获取餐次
  getMenuPeriodList() {
    return ListEshopMenuPeriodGroup({
      paging: { limit: 999 },
      type: MenuPeriodGroup_Type.ESHOP,
    }).then((json) => {
      // 没有id的时候需要构建数据
      this.serviceInfo.delivery_infos = _.map(
        json.response.menu_period_groups!,
        (item) => {
          return {
            menu_period_group: item,
            receive_date: '0',
            receive_time: '00:00',
          }
        },
      )
    })
  }

  // 获取菊花 编辑时候调用
  getCodeImg(school_id: string) {
    GetInviteCode({ school_id }).then((json) => {
      this.img_url = json.response.invite_code.mini_qrcode!
    })
  }

  // 清除
  init() {
    // @ts-ignore
    this.schoolCustomer = { ...initSchoolCustomer }
    this.serviceInfo = { ...initServiceInfo }
    this.mp_address = ''
  }
}

export default new Store()
