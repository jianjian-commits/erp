import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { PagingMaxLimit } from 'gm_api'
import {
  Device,
  ListDevice,
  ListDeviceRequest_FilterBindType
} from 'gm_api/src/device'
import {
  BindProcessorDevices, CreateProcessor, DeleteProcessor, ListDeviceOfProcessor, ListProcessTemplate,
  ListProcessTemplateOfProcessor, Processor,
  ProcessTemplate, ProcessType_Status, Status_Code, UnBindProcessorDevices, UpdateProcessor, UpdateProcessorProcessTemplate
} from 'gm_api/src/production'
import _ from 'lodash'
import { makeAutoObservable } from 'mobx'
import { getProcesses, getProcessTypeList } from '../utils'
import getFactoryModalTree from './get_modal_tree'
import { ProcessorItem, ProcessTypeItem } from './interface'


// 由四个状态值来控制工厂模型的变化
const additionalOptions = {
  edit: false,
  expand: false,
  showIcon: false,
  selected: false,
}

// 默认有一个未分配的车间类型，用于创建新的车间
const defaultFactoryModal: ProcessorItem = {
  parent_id: '0',
  processor_id: '0',
  name: t('未分配'),
  children: [],
  ...additionalOptions,
}

export const initFactoryModal: ProcessorItem = {
  parent_id: '',
  processor_id: '',
  name: '',
  children: [],
  ...additionalOptions,
}

interface CurrentModal {
  current_selected_modal: ProcessorItem
  processes: ProcessTemplate[] // 当前所选择模型下已绑定的工序
  devices: Device[] // 当前所选择模型下的设备
}

interface ProcessesAddDetail {
  current_process_type: string
  current_processes: { [key: string]: string[] }
}

interface DeviceAddDetail {
  current_device_type: string
  current_device: { [key: string]: string[] }
}

class Store {
  // 当前选中模型
  current_modal: CurrentModal = {
    current_selected_modal: { ...initFactoryModal }, // 默认设置选择第一个
    processes: [],
    devices: [],
  }

  // 是否处于添加工序状态
  add_process = false

  // 是否处于添加设备状态
  add_device = false

  // tab页签类型
  tabType = 'process'

  // 工厂模型列表
  factory_modal_list: ProcessorItem[] = [{ ...defaultFactoryModal }]

  // 工序列表
  processes_list: { [key: string]: ProcessTemplate[] } = { '': [] }

  // 工序类型列表
  process_type_list: ProcessTypeItem[] = []

  processes_add_detail: ProcessesAddDetail = {
    current_process_type: '',
    current_processes: {},
  }

  device_add_detail: DeviceAddDetail = {
    current_device_type: '',
    current_device: {},
  }

  // 设备列表
  device_list: { [key: string]: Device[] } = {}

  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  updateProcessAddDetail<T extends keyof ProcessesAddDetail>(
    key: T,
    value: ProcessesAddDetail[T],
  ) {
    this.processes_add_detail[key] = value
  }

  updateDeviceAddDetail<T extends keyof DeviceAddDetail>(
    key: T,
    value: DeviceAddDetail[T],
  ) {
    this.device_add_detail[key] = value
  }

  updateFactoryModalItem<T extends keyof ProcessorItem>(
    parent_id: string,
    processor_id: string,
    key: T,
    value: ProcessorItem[T],
  ) {
    if (parent_id === '0') {
      // 父级模型的更新
      const item: ProcessorItem = _.find(
        this.factory_modal_list,
        (m) => m.processor_id === processor_id,
      )!
      item[key] = value
    } else {
      const parent: ProcessorItem = _.find(
        this.factory_modal_list,
        (m) => m.processor_id === parent_id,
      )!
      const item: ProcessorItem = _.find(
        parent.children,
        (p) => p.processor_id === processor_id,
      )!
      item[key] = value
    }
  }

  updateFactoryModalList(list: ProcessorItem[]) {
    this.factory_modal_list = [...list]
  }

  addNewFactoryModalItem(parent_id: string) {
    if (parent_id === '0') {
      this.factory_modal_list.push({
        ...initFactoryModal,
        parent_id,
        edit: true,
      })
      return
    }

    const modal: ProcessorItem = _.find(
      this.factory_modal_list,
      (m) => m.processor_id === parent_id,
    )!
    modal.children.push({ ...initFactoryModal, parent_id, edit: true })
  }

  deleteFactoryModalItem(parent_id: string, processor_id: string) {
    if (parent_id === '0') {
      const index: number = _.findIndex(
        this.factory_modal_list,
        (m) => m.processor_id === processor_id,
      )
      this.factory_modal_list.splice(index, 1)
    } else {
      const parentIndex: number = _.findIndex(
        this.factory_modal_list,
        (m) => m.processor_id === parent_id,
      )!
      const index: number = _.findIndex(
        this.factory_modal_list[parentIndex].children,
        (p) => p.processor_id === processor_id,
      )!
      this.factory_modal_list[parentIndex].children.splice(index, 1)
    }
  }

  setCurrentSelectedModal(modal: ProcessorItem) {
    this.current_modal.current_selected_modal = modal
    this.add_process = false
    // 获取当前选中模型所绑定的工序
    if (modal.processor_id) {
      if (this.tabType === 'process') {
        // 获取工序数据
        this.getProcessesOfCurrentModal(modal.processor_id)
      } else {
        // 获取设备table数据
        this.getDevicesOfCurrentModal(modal.processor_id)
      }
    }
  }

  // 设置页签选中状态
  setType(tabType: string) {
    this.tabType = tabType
  }

  setAddProcess(add: boolean) {
    this.add_process = add
    // 默认选择第一个分类, 清空信息
    this.processes_add_detail = {
      current_process_type: '',
      // 记录不同分类下选择的工序信息
      current_processes: {},
    }
  }

  // 设置添加设备
  setAddDevice(add: boolean) {
    this.add_device = add
    // 默认选择第一个分类, 清空信息
    this.device_add_detail = {
      current_device_type: '',
      // 记录不同分类下选择的工序信息
      current_device: {},
    }
  }

  initData() {
    this.processes_list = { '': [] }
    this.add_process = false // 添加工序
    this.add_device = false // 添加设备
    this.current_modal = {
      current_selected_modal: { ...initFactoryModal },
      processes: [],
      devices: [],
    }
  }

  getFactoryModalList() {
    return getFactoryModalTree().then((data) => {
      this.factory_modal_list = _.map(data, (item) => ({
        ...item,
        ...additionalOptions,
        children: _.map(item.children, (child) => ({
          ...child,
          ...additionalOptions,
        })),
      }))
      this.factory_modal_list.unshift({ ...defaultFactoryModal })
      return data
    })
  }

  createFactoryModal(name: string, parent_id: string | undefined) {
    return CreateProcessor(
      {
        processor: {
          name: name.trim(),
          parent_id: parent_id === '0' ? undefined : parent_id,
        },
      },
      [Status_Code.DUPLICATE_NAME],
    ).then((json) => {
      if (json.code === Status_Code.DUPLICATE_NAME) {
        Tip.danger(t('该模型名称已存在！'))
        return null
      }
      return json
    })
  }

  updateFactoryModal(item: ProcessorItem) {
    const new_item: Processor = {
      ..._.omit(item, [
        'edit',
        'expand',
        'showIcon',
        'selected',
        'children',
        'value',
        'text',
      ]),
      processor_id: item.processor_id || '',
      name: (item.name || '').trim(),
    }
    return UpdateProcessor({ processor: { ...new_item } }, [
      Status_Code.DUPLICATE_NAME,
    ]).then((json) => {
      if (json.code === Status_Code.DUPLICATE_NAME) {
        Tip.danger(t('该模型名称已存在！'))
        return null
      }
      return json
    })
  }

  deleteFactoryModal(processor_id: string) {
    return DeleteProcessor({ processor_id }).then((json) => {
      return json
    })
  }

  getProcessesOfCurrentModal(processor_id: string) {
    let ids: string[] = []
    return ListProcessTemplateOfProcessor({ processor_id })
      .then((json) => {
        // 拿到返回的工序模板id查询工序信息
        const { process_template_ids } = json.response
        ids = process_template_ids || []
        return process_template_ids || []
      })
      .then((process_template_ids) => {
        return ListProcessTemplate({
          process_template_ids,
          filter_deleted: true,
          paging: { limit: PagingMaxLimit },
        })
      })
      .then((json) => {
        // 为[]说明未绑定工序
        if (ids.length) {
          this.current_modal.processes = json.response.process_templates || []
        } else {
          this.current_modal.processes = []
        }
        return []
      })
  }

  // 选中当前模型车间，获取设备
  getDevicesOfCurrentModal(processor_id: string) {
    // let ids: string[] = []
    return ListDeviceOfProcessor({ processor_id }).then((json) => {
      // 拿到返回的设备模板id 查询设备信息
      // const { devices } = json.response
      this.current_modal.devices = json.response.devices || []
    })
  }

  getProcessTypes() {
    getProcessTypeList().then((data) => {
      this.process_type_list = _.map(data, (d) => {
        const isDefault = +(d?.status || 0) & ProcessType_Status.STATUS_DEFAULT
        // 处理一下未分类类型的展示
        return {
          ...d,
          text: isDefault ? t('未分类') : d.name,
        }
      })
      return data
    })
  }

  // 更新工序操作
  updateProcessesOfProcessor(process_template_ids: string[]) {
    const { current_selected_modal } = this.current_modal
    return UpdateProcessorProcessTemplate({
      processor_id: current_selected_modal.processor_id,
      process_template_ids,
    }).then((json) => {
      if (json.response) {
        Tip.tip(t('添加成功'))
      }
      this.add_process = false
      return this.getProcessesOfCurrentModal(
        current_selected_modal.processor_id,
      )
    })
  }

  // 添加设备
  addDevice(device_ids: string[]) {
    const { current_selected_modal } = this.current_modal
    return BindProcessorDevices({
      processor_id: current_selected_modal.processor_id,
      device_ids,
    }).then((json) => {
      if (json.response) {
        Tip.tip(t('添加成功'))
      }
      this.add_device = false
      return this.getDevicesOfCurrentModal(current_selected_modal.processor_id)
    })
  }

  // 删除设备
  deleteDevice(device_ids: string[]) {
    const { current_selected_modal } = this.current_modal
    return UnBindProcessorDevices({
      processor_id: current_selected_modal.processor_id,
      device_ids,
    }).then((json) => {
      if (json.response) {
        Tip.tip(t('删除成功'))
      }
      return this.getDevicesOfCurrentModal(current_selected_modal.processor_id)
    })
  }

  getProcesses() {
    getProcesses({ paging: { limit: 999 }, filter_deleted: true }).then(
      (data) => {
        // 只有在添加工序时才会拉取这个接口，此时直接先过滤掉已选择的工序
        const not_selected: ProcessTemplate[] = _.xorBy(
          data,
          this.current_modal.processes,
          'process_template_id',
        )
        // 处理成 key: []形式
        this.processes_list = _.groupBy(not_selected, 'process_type_id')
        return data
      },
    )
  }

  getDevice() {
    return ListDevice({
      paging: { limit: 999 },
      filter_bind_type:
        ListDeviceRequest_FilterBindType.FILTERBINDTYPE_PRODUCTION,
    }).then((res) => {
      this.device_list = _.groupBy(res.response.devices, 'device_type')
    })
  }
}

export default new Store()
