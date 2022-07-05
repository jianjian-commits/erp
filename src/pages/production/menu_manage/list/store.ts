import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import { Tip, Dialog } from '@gm-pc/react'
import { t } from 'gm-i18n'
import moment from 'moment'
import { CreateOrBatchData, Menu_Period, IconsData } from './interface'
import { ServicePeriod_Type } from 'gm_api/src/enterprise'
import {
  MenuPeriod,
  ListMenuPeriodGroup,
  CreateMenuPeriodGroup,
  UpdateMenuPeriodGroup,
  DeleteMenuPeriodGroup,
  ListCategoryImage,
  Status_Code,
} from 'gm_api/src/merchandise'
import { imageDomain } from '@/common/service'

import { dateTMM } from '@/common/util'

// 取00:00:00，并加一毫秒
const zero_add_ms = moment().startOf('day').add(1, 'ms').toDate()
// 取00:00:00
const zero = moment().startOf('day').toDate()

const initBatchData: CreateOrBatchData = {
  // 创建餐次的data
  name: '',
  icon: { id: '', show: false, url: '' },
  order_create_min_time: zero_add_ms,
  order_create_max_time: zero,
  order_receive_min_time: '0', // 0点
  order_receive_max_time: '86399999', // 23:59
  order_receive_min_date: '',
  order_receive_max_date: '',
  default_receive_time: zero,
  default_receive_date: '',
}

class Store {
  menu_period: Menu_Period[] = []

  // 副本
  menu_period_: Menu_Period[] = []

  // 创建餐次和批量操作获取的数据
  create_or_batch_data: CreateOrBatchData = { ...initBatchData }

  // 加个状态，用来判断只修改截止下单天数，没有选择截止下单时间的情况
  lock_status = false

  icons: IconsData[] = [
    {
      id: '1',
      show: false,
      url: imageDomain + 'group_0/type_10/36.png',
    },
    {
      id: '2',
      show: false,
      url: imageDomain + 'group_0/type_10/76.png',
    },
    {
      id: '3',
      show: false,
      url: imageDomain + 'group_0/type_10/920.png',
    },
  ]

  setLockStatus(status: boolean) {
    this.lock_status = status
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  // 修改菜谱餐次列表
  updateListColumn<T extends keyof Menu_Period>(
    index: number,
    key: T,
    value: Menu_Period[T],
  ) {
    this.menu_period[index][key] = value
  }

  // 修改创建餐次和批量操作获取的数据
  updateCreateOrBatchData<T extends keyof CreateOrBatchData>(
    key: T,
    value: CreateOrBatchData[T],
  ) {
    this.create_or_batch_data[key] = value
  }

  // 餐次列表
  fetchMealList() {
    return ListMenuPeriodGroup({ paging: { limit: 999 } }).then((json) => {
      const { menu_period } = json.response
      if (menu_period) {
        const changeData = () => {
          return _.map(menu_period, (item) => ({
            ...item,
            ...item.service_period,
            name: item.menu_period_group.name,
            icon: _.find(this.icons, { id: item.menu_period_group.icon })!,
            order_receive_min_date:
              Number(item.service_period?.order_receive_min_date!) - 1 + '',
            isEditing: false,
          }))
        }
        this.menu_period = changeData()

        // 副本
        this.menu_period_ = changeData()
      }
      return json.response
    })
  }

  // 新建餐次
  createMealTimes() {
    const {
      name,
      icon,
      order_create_min_time,
      order_create_max_time,
      order_receive_min_time,
      order_receive_max_time,
      order_receive_min_date,
      order_receive_max_date,
      default_receive_time,
      default_receive_date,
    } = this.create_or_batch_data
    // order_create_max_time需要加24:00:00
    const one_day = 24 * 60 * 60 * 1000

    const req = {
      name,
      order_create_min_time: dateTMM(order_create_min_time), // 加一毫秒
      order_create_max_time:
        one_day + Number(dateTMM(order_create_max_time)) + '', // 加一天
      order_receive_min_date: Number(order_receive_min_date) + 1 + '', // 需要+1
      default_receive_time: dateTMM(default_receive_time),
      default_receive_date,
      order_receive_max_date, // 60
      order_receive_min_time,
      order_receive_max_time,
    }
    if (!name) {
      Tip.danger(t('餐次名称不为空'))
      return false
    }
    if (!icon.id) {
      Tip.danger(t('图标不能为空'))
      return false
    }
    if (!order_receive_min_date) {
      Tip.danger('截止下单天数不为空')
      return false
    }
    if (!default_receive_date) {
      Tip.danger('默认收货日期不能为空')
      return false
    }

    return CreateMenuPeriodGroup({
      menu_period: [
        {
          // @ts-ignore 忽略必传
          service_period: {
            ...req,
            type: ServicePeriod_Type.TYPE_DEFAULT_MENU_PERIOD,
          },
          // @ts-ignore 忽略必传
          menu_period_group: {
            name,
            icon: icon.id,
          },
        },
      ],
    }).then((json) => {
      if (json.response.menu_period) {
        this.fetchMealList()
        this.clear()
        Dialog.hide()
        Tip.success(t('新建餐次成功'))
      }
      return json.response
    })
  }

  // 更新一项
  updateMealTimes(index: number) {
    const {
      menu_period_group,
      order_receive_min_date,
      order_create_max_time,
      name,
      icon,
    } = this.menu_period[index]
    const service_period = _.omit(this.menu_period[index], [
      'menu_period_group',
      'service_period',
      'isEditing',
      'icon',
      'order_receive_min_date',
      'order_create_max_time',
    ])
    const one_day = 24 * 60 * 60 * 1000

    const service_period_ = Object.assign(
      {
        order_receive_min_date: Number(order_receive_min_date) + 1 + '', // 加一
        order_create_max_time: this.lock_status
          ? one_day + Number(order_create_max_time) + ''
          : order_create_max_time, // 加一天
      },
      service_period,
    )

    return UpdateMenuPeriodGroup({
      menu_period: [
        {
          menu_period_group: Object.assign({}, menu_period_group, {
            name,
            icon: icon?.id || '',
          }),
          service_period: service_period_,
        },
      ],
    })
  }

  // 删除一项
  deleteMealTimes(index: number) {
    const { menu_period_group, service_period } = this.menu_period[index]
    return DeleteMenuPeriodGroup(
      {
        service_period_ids: [service_period?.service_period_id!],
        menu_period_group_ids: [menu_period_group?.menu_period_group_id!],
      },
      [Status_Code.MENU_PERIOD_GROUP_ID_BIND_WITH_BUDGET],
    ).then((json) => {
      if (json.code === Status_Code.MENU_PERIOD_GROUP_ID_BIND_WITH_BUDGET) {
        Tip.danger(t('餐次已经绑定了预算, 不能删除！'))
        throw new Error(t('餐次已经绑定了预算, 不能删除！'))
      }
      this.fetchMealList()
      Tip.success(t('删除餐次成功'))
      return null
    })
  }

  // 批量删除
  batchDeleteMealTimes(selected: string[]) {
    const menu_period_group_ids: string[] = []
    _.forEach(selected, (item) => {
      _.forEach(this.menu_period, (it) => {
        if (it.service_period_id === item) {
          menu_period_group_ids.push(
            it.menu_period_group?.menu_period_group_id!,
          )
        }
      })
    })
    return DeleteMenuPeriodGroup({
      service_period_ids: selected,
      menu_period_group_ids,
    }).then(() => {
      this.fetchMealList()
      Tip.success(t('删除成功'))
      return null
    })
  }

  // 批量设置默认收货日期
  batchSetReceiveTime(selected: string[]) {
    const { default_receive_time } = this.create_or_batch_data
    const menu_period: MenuPeriod[] = []
    _.forEach(selected, (item) => {
      _.map(this.menu_period, (it) => {
        if (it.service_period_id === item) {
          const { menu_period_group, order_receive_min_date } = it
          const service_period = _.omit(it, [
            'menu_period_group',
            'service_period',
            'isEditing',
            'order_receive_min_date',
            'default_receive_time',
          ])
          const service_period_ = Object.assign(
            {
              default_receive_time: dateTMM(default_receive_time),
              order_receive_min_date: Number(order_receive_min_date) + 1 + '',
            },
            service_period,
          )
          menu_period.push({
            menu_period_group,
            service_period: service_period_,
          })
        }
      })
    })
    return UpdateMenuPeriodGroup({
      menu_period,
    }).then((json) => {
      if (json.response.menu_period) {
        this.fetchMealList()
        this.clear()
        Dialog.hide()
        Tip.success(t('修改成功'))
      }
      return json.response
    })
  }

  // 批量设置截止下单时间
  batchSetEndOrderTime(selected: string[]) {
    const {
      order_create_min_time,
      order_create_max_time,
      order_receive_min_date,
    } = this.create_or_batch_data
    if (!order_receive_min_date) {
      Tip.danger('截止下单天数不为空')
      return false
    }
    // if (!order_create_min_time) {
    //   Tip.danger(t('请选择截止下单时间'))
    //   return false
    // }
    const menu_period: MenuPeriod[] = []
    const one_day = 24 * 60 * 60 * 1000

    _.forEach(selected, (item) => {
      _.map(this.menu_period, (it) => {
        if (it.service_period_id === item) {
          const { menu_period_group } = it
          const service_period = _.omit(it, [
            'menu_period_group',
            'service_period',
            'isEditing',
            'order_create_min_time',
            'order_create_max_time',
            'order_receive_min_date',
          ])
          const service_period_ = Object.assign(
            {
              order_create_min_time: dateTMM(order_create_min_time),
              order_create_max_time:
                Number(dateTMM(order_create_max_time)) + one_day + '',
              order_receive_min_date: Number(order_receive_min_date) + 1 + '',
            },
            service_period,
          )
          menu_period.push({
            menu_period_group,
            service_period: service_period_,
          })
        }
      })
    })
    return UpdateMenuPeriodGroup({
      menu_period,
    }).then((json) => {
      if (json.response.menu_period) {
        this.fetchMealList()
        this.clear()
        Dialog.hide()
        Tip.success(t('修改成功'))
      }
      return json.response
    })
  }

  clear() {
    this.create_or_batch_data = { ...initBatchData }
  }

  fetchIcons() {
    return ListCategoryImage({})
  }
}

export default new Store()
