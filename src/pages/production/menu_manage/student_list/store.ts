import { makeAutoObservable, toJS } from 'mobx'
import _ from 'lodash'
import { Tip, Dialog } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { CreateOrBatchData, Menu_Period, IconsData } from './interface'
import {
  // ListMenuPeriodGroup,
  // CreateMenuPeriodGroup,
  // UpdateMenuPeriodGroup,
  // DeleteMenuPeriodGroup,
  MenuPeriodGroup_Type,
  ListEshopMenuPeriodGroup,
  CreateEshopMenuPeriodGroup,
  UpdateEshopMenuPeriodGroup,
  DeleteEshopMenuPeriodGroup,
  ListCategoryImage,
  Status_Code,
} from 'gm_api/src/merchandise'
import { imageDomain } from '@/common/service'

const initBatchData: CreateOrBatchData = {
  // 创建餐次的data
  name: '',
  icon: { id: '', show: false, url: '' },
}

const initPaging = {
  offset: 0,
  limit: 10,
  need_count: true,
}
class Store {
  menu_period: Menu_Period[] = []

  // 创建餐次和批量操作获取的数据
  create_or_batch_data: CreateOrBatchData = { ...initBatchData }

  paging = { ...initPaging }

  count = '0'

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

  selected: string[] = []
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  setSelected(selected: string[]) {
    this.selected = selected
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

  setBatchData() {
    this.create_or_batch_data = { ...this.create_or_batch_data }
  }

  // 餐次列表
  fetchMealList(params?: any) {
    if (params) {
      this.paging = params.paging
    }
    return ListEshopMenuPeriodGroup({
      paging: this.paging,
      type: MenuPeriodGroup_Type.ESHOP,
    }).then((json) => {
      const { menu_period_groups } = json.response
      if (menu_period_groups) {
        const changeData = () => {
          return _.map(menu_period_groups, (item) => ({
            ...item,
            name: item.name,
            icon: _.find(this.icons, { id: item.icon })!,

            isEditing: false,
          }))
        }
        this.menu_period = changeData()
        if (this.paging.offset === 0) {
          this.count = json.response.paging.count!
        }
      }
      this.selected = []
      return json.response
    })
  }

  // 新建餐次
  createMealTimes() {
    const { name, icon } = this.create_or_batch_data
    if (!name) {
      Tip.danger(t('餐次名称不为空'))
      return false
    }
    if (!icon.id) {
      Tip.danger(t('图标不能为空'))
      return false
    }
    return CreateEshopMenuPeriodGroup({
      menu_period_group: {
        name,
        icon: icon.id,
        type: MenuPeriodGroup_Type.ESHOP,
        menu_period_group_id: '0',
      },
    }).then((json) => {
      if (json.response.menu_period_group) {
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
    return UpdateEshopMenuPeriodGroup({
      menu_period_group: {
        ...this.menu_period[index],
        icon: this.menu_period[index]?.icon?.id,
      },
    })
  }

  // 删除一项
  deleteMealTimes(index: number) {
    const { menu_period_group_id } = this.menu_period[index]
    return DeleteEshopMenuPeriodGroup(
      {
        menu_period_group_ids: [menu_period_group_id!],
      },
      [Status_Code.MENU_PERIOD_GROUP_ID_BIND_WITH_BUDGET],
    ).then((json) => {
      if (json.code === Status_Code.MENU_PERIOD_GROUP_ID_BIND_WITH_BUDGET) {
        Tip.danger(t('餐次已经绑定了预算, 不能删除！'))
        throw new Error(t('餐次已经绑定了预算, 不能删除！'))
      }
      this.setBatchData()
      Tip.success(t('删除餐次成功'))
      return null
    })
  }

  // 批量删除
  batchDeleteMealTimes() {
    const menu_period_group_ids: string[] = []
    _.forEach(this.selected, (item) => {
      menu_period_group_ids.push(item!)
    })
    return DeleteEshopMenuPeriodGroup({
      menu_period_group_ids: menu_period_group_ids,
    }).then(() => {
      // this.fetchMealList()
      this.setBatchData()
      Tip.success(t('删除成功'))
      this.selected = []
      return null
    })
  }

  clear() {
    this.create_or_batch_data = { ...initBatchData }
    this.paging = { ...initPaging }
    this.selected = []
  }

  fetchIcons() {
    return ListCategoryImage({})
  }
}

export default new Store()
