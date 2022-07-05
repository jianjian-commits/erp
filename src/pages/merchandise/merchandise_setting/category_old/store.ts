import { t } from 'gm-i18n'
import { runInAction, makeAutoObservable } from 'mobx'
import { IconOptions, DefaultIconOptions } from '../../manage/interface'
import {
  CreateSpu,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
  DeleteSpu,
  GetCategoryTree,
  UpdateSpu,
  ListCategoryImage,
} from 'gm_api/src/merchandise'
import { Tip } from '@gm-pc/react'
import _ from 'lodash'
import { imageDomain } from '@/common/service'

class CategoryStore {
  category1 = []
  category2 = []
  spus = []

  icons: IconOptions[] = []

  defaultIcon: DefaultIconOptions = {}

  // 勾选的id
  checkList = []

  // 实际勾选的spulist
  checkData = []

  activeCategory: { [key: string]: string } = {
    name: '',
    icon: '',
  }

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
    this.init()
  }

  getIcons() {
    return ListCategoryImage({}).then((json) => {
      runInAction(() => {
        this.icons = _.map(json.response.images, (image) => {
          return {
            ...image,
            ...image.image,
            id: image.category_image_id,
            url: imageDomain + image.image.path,
          }
        })
      })
      return json.response
    })
  }

  getCategory() {
    this.init()
    return GetCategoryTree({}).then((json) => {
      runInAction(() => {
        _.forEach(json.response.categories, (c) => {
          if (+c.parent_id === 0) {
            c.url = `${
              _.find(this.icons, (icon) => c.icon === icon.id)?.url
            }?imageView2/3/w/60`
            this.category1.push(c)
          } else {
            this.category2.push(c)
          }
        })
        this.spus = _.map(json.response.spus, (v) => ({
          ...v,
          category_id: v.spu_id,
          level: 2,
        }))
      })
      return json.response
    })
  }

  getDefaultIcon() {
    this.defaultIcon = {
      id: 54,
      name: 'icon-xia.png',
    }
  }

  getList() {}

  changeDefaultIcon(id: number) {
    console.log('change default icon', id)
  }

  deleteIcon() {
    console.log('deleteIcon')
  }

  addIcon(icon) {
    console.log('addIcon', icon)
  }

  changeActiveCategory(name: string, value: string) {
    this.activeCategory[name] = value
  }

  init() {
    this.category1 = []
    this.category2 = []
    this.spus = []
    this.activeCategory = {
      name: '',
      icon: '',
    }
  }

  createCategory(parent_id: string) {
    const { name, icon } = this.activeCategory
    const _name = _.trim(name)
    if (!_name) {
      Tip.tip(t('请输入分类名 '))
      return
    } else if (_name.length > 30) {
      Tip.tip(t('分类名的长度不得大于30 '))
      return
    }
    if (+parent_id === 0 && !icon) {
      Tip.tip(t('请选择分类图标 '))
      return
    }

    const req = {
      name: _name,
      parent_id: parent_id,
    }
    if (+parent_id === 0) {
      req.icon = icon
    }

    return CreateCategory({ category: req })
  }

  createSpu(parent_id: string) {
    const _name = _.trim(this.activeCategory.name)
    if (!_name) {
      Tip.tip(t('请输入分类名 '))
      return
    } else if (_name.length > 30) {
      Tip.tip(t('分类名的长度不得大于30 '))
      return
    }

    const req = {
      name: _.trim(_name),
      parent_id: parent_id,
    }

    return CreateSpu({ spu: req })
  }

  changeCategory(
    parent_id: number,
    category_id: number,
    name: string,
    icon: string,
  ) {
    const _name = _.trim(name)
    if (!_name) {
      Tip.tip(t('请输入分类名 '))
      return
    } else if (_name.length > 30) {
      Tip.tip(t('分类名的长度不得大于30 '))
      return
    }
    const category =
      parent_id === '0'
        ? _.find(this.category1, (c) => c.category_id === category_id)
        : _.find(this.category2, (c) => c.category_id === category_id)

    const req = Object.assign({}, category, {
      parent_id: parent_id,
      category_id: category_id,
      name: _name,
    })
    if (icon) req.icon = icon
    return UpdateCategory({ category: req })
  }

  changeSpu(parent_id: string, spu_id: string, name: string) {
    const _name = _.trim(name)
    if (!_name) {
      Tip.tip(t('请输入分类名 '))
      return
    } else if (_name.length > 30) {
      Tip.tip(t('分类名的长度不得大于30 '))
      return
    }
    const spu = _.find(this.spus, (spu) => spu.category_id === spu_id)

    const req = Object.assign({}, spu, {
      parent_id: parent_id,
      spu_id: spu_id,
      name: _name,
    })
    return UpdateSpu({ spu: req })
  }

  deleteSpu(spu_id: string) {
    return DeleteSpu({ spu_id })
  }

  deleteCategory(category_id: string) {
    return DeleteCategory({ category_id })
  }
}

export default new CategoryStore()
