import { t } from 'gm-i18n'
import { makeAutoObservable } from 'mobx'
import _ from 'lodash'
import {
  CreateProcessTemplate,
  UpdateProcessTemplate,
  GetProcessTemplate,
  Status_Code,
  Attr,
} from 'gm_api/src/production'
import { Tip } from '@gm-pc/react'

import { ProcessBaseData, ProcessGuideTypeValues } from './interface'

const initGuideData: Attr = {
  attr_id: '0',
  name: '',
  type: 2,
  values: [],
}

const initTypeValues: ProcessGuideTypeValues = {
  desc: '',
}

const initBaseData = {
  name: '',
  customized_code: '',
  process_type_id: '',
  description: '',
  latest_attr_id: '0',
}

/**
 * attr_id由前端维护，以列表index表示
 */
class ProcessStore {
  // 所有字段放在baseData保存，方便update时候回传
  baseData: ProcessBaseData = {
    ...initBaseData,
  }

  guideDataList: Attr[] = [{ ...initGuideData }]

  // 工序指导参数属性列表，方便弹窗展示与修改
  typeValuesList: ProcessGuideTypeValues[] = [{ ...initTypeValues }]

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateBaseData<T extends keyof ProcessBaseData>(
    key: T,
    value: ProcessBaseData[T],
  ) {
    this.baseData[key] = value
  }

  initData() {
    this.guideDataList = [{ ...initGuideData }]
    this.baseData = {
      ...initBaseData,
    }
  }

  addNewGuideDataItem() {
    this.guideDataList.push({
      ...initGuideData,
    })
  }

  deleteGuideDataItem(index: number) {
    this.guideDataList.splice(index, 1)
  }

  updateGuideDataList<T extends keyof Attr>(
    index: number,
    key: T,
    value: Attr[T],
  ) {
    const guide_data = this.guideDataList[index]
    guide_data[key] = value
  }

  initTypeValuesList(index: number) {
    const list = this.guideDataList[index]?.values?.slice() || []
    if (list.length === 0) {
      this.typeValuesList = [{ ...initTypeValues }]
      return
    }

    this.typeValuesList = _.map(list, (item) => ({ desc: item })).slice()
  }

  clearTypeValuesList() {
    this.typeValuesList = [{ ...initTypeValues }]
  }

  addNewTypeValue() {
    this.typeValuesList.push({ ...initTypeValues })
  }

  deleteNewTypeValue(index: number) {
    this.typeValuesList.splice(index, 1)
  }

  updateTypeValuesList(index: number, value: string) {
    this.typeValuesList[index].desc = value
  }

  clearProcessData() {
    this.baseData = { ...initBaseData }
    this.guideDataList = [{ ...initGuideData }]
  }

  getProcessData() {
    const attrs: Attr[] = _.map(
      _.filter(this.guideDataList.slice(), ({ name }) => !!_.trim(name)),
      (item: Attr, index: number) => ({
        ...item,
        name: item.name?.trim(),
        attr_id: '' + index,
      }),
    )

    return {
      ...this.baseData,
      name: this.baseData.name.trim(),
      description: this.baseData.description?.trim() || '',
      customized_code: this.baseData.customized_code?.trim() || '',
      attrs: {
        attrs: _.map(attrs.slice(), (attr) => ({
          ...attr,
          attr_id: attr.attr_id,
        })),
        // 前端维护的id，表示当前使用的最大属性id，为了与bom挂钩用
        latest_attr_id: `${attrs.length === 0 ? '0' : attrs.length - 1}`,
      },
    }
  }

  createProcess(process_type_id: string) {
    return CreateProcessTemplate(
      {
        process_template: {
          ...this.getProcessData(),
          process_type_id: this.baseData.process_type_id
            ? this.baseData.process_type_id
            : process_type_id,
        },
      },
      [Status_Code.DUPLICATE_NAME, Status_Code.DUPLICATE_CODE],
    ).then((json) => {
      if (json.code === Status_Code.DUPLICATE_NAME) {
        Tip.danger(t('该工序名称已存在!'))
        return null
      }
      if (json.code === Status_Code.DUPLICATE_CODE) {
        Tip.danger(t('工序编码与已有的工序编码重复，请修改！'))
        return null
      }
      return json
    })
  }

  updateProcess(id: string) {
    return UpdateProcessTemplate(
      {
        process_template: {
          ...this.getProcessData(),
          process_template_id: id,
        },
      },
      [Status_Code.DUPLICATE_NAME, Status_Code.DUPLICATE_CODE],
    ).then((json) => {
      if (json.code === Status_Code.DUPLICATE_NAME) {
        Tip.danger('该工序名称已存在!')
        return null
      }
      if (json.code === Status_Code.DUPLICATE_CODE) {
        Tip.danger(t('工序编码与已有的工序编码重复，请修改！'))
        return null
      }
      return json
    })
  }

  getProcess(id: string | undefined) {
    GetProcessTemplate({ process_template_id: id }).then((json) => {
      const { process_template } = json.response

      // 基本信息
      this.baseData = {
        ...process_template,
        name: process_template!.name,
        process_type_id: process_template?.process_type_id || '',
        latest_attr_id: process_template.attrs?.latest_attr_id || '0',
      }

      // 指导参数
      this.guideDataList = _.map(process_template?.attrs?.attrs, (attr) => ({
        attr_id: attr.attr_id || '',
        name: attr.name || '',
        type: attr.type || 2,
        values: attr.values || [],
      }))

      if (!this.guideDataList.length) {
        this.guideDataList = [{ ...initGuideData }]
      }

      return json
    })
  }
}

export default new ProcessStore()
