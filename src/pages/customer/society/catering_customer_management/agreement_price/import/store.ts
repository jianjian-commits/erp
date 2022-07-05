import { uploadTengXunFile } from '@/common/service'
import { message } from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import { GetTask, Task_State } from 'gm_api/src/asynctask'
import { FileType } from 'gm_api/src/cloudapi'
import {
  ImportSpecialBasicPrice,
  ListErrSpecialBasicPriceV2,
  Status_Code,
} from 'gm_api/src/merchandise'
import { makeAutoObservable, runInAction, toJS } from 'mobx'
import * as XLSX from 'xlsx'
import { ErrorListProps } from '../type'
import { DataOption } from '@/common/interface'
import _ from 'lodash'

class Store {
  constructor() {
    makeAutoObservable(this)
  }

  customerId?: string

  /** 步骤 */
  step = 0
  /** 选择的文件列表 */
  files: UploadFile[] = []
  /** -1表示未开始，0-100表示上传进度 */
  progress = -1
  successCount?: number
  failureCount?: number
  failureAttachURL?: string
  total = 0

  errors: string[] = []
  errorList: ErrorListProps[] = []
  // 分类tree
  category: DataOption[] = []
  selected: string[] = []
  loading = false
  importErrorCount = 0

  reset({ customerId }: { customerId?: string }) {
    this.step = 0
    this.files = []
    this.progress = -1
    this.customerId = customerId || this.customerId
    this.successCount = undefined
    this.failureAttachURL = undefined
    this.total = 0
    this.errors = []
    this.loading = false
    this.importErrorCount = 0
  }

  async setFile(file: UploadFile) {
    if (file.size! > 1024 * 1024 * 10) {
      message.warn('文件大小不能超过10M')
      return
    }
    if (!/(\.xls|\.xlsx)$/.test(file.name)) {
      message.warn('只允许选择xls或者xlsx格式的文件')
      return
    }

    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file as any)
    const workbook: XLSX.WorkBook = await new Promise((resolve, reject) => {
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target?.result, { type: 'binary' })
        resolve(workbook)
      }
    })
    this.errors = []
    const sheet = workbook.Sheets[Object.keys(workbook.Sheets)?.[0]]
    if (!sheet) return console.error('sheet不存在')
    const selectors = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1']
    const fields = ['商品名', '单位', '单价']
    fields.forEach((field) => {
      if (selectors.every((k) => sheet[k]?.v !== field)) {
        this.errors.push(`当前文件中没有"${field}", 请修改后重新上传`)
      }
    })
    this.files = [file]
  }

  async next() {
    if (this.files.length === 0) return
    // 开始上传
    runInAction(() => {
      this.progress = 5
    })
    const { download_url } = (await uploadTengXunFile(
      FileType.FILE_TYPE_ENTERPRISE_CUSTOMER_IMPORT,
      this.files[0] as any,
    ))!
    // 提交接口
    const {
      response: { task },
    } = await ImportSpecialBasicPrice({
      customer_id: this.customerId!,
      file_url: download_url!,
    })

    // 获取进度
    await this.updateProgress(task!.task_id)
    // 更新状态
    await this.updateStep(task!.task_id)
  }

  /** 编辑异常继续保存提交 */
  async save() {
    this.loading = true
    this.importErrorCount = 1
    const list = _.map(this.errorList, (it) => {
      return {
        ..._.omit(it, [
          'type',
          'unit_id_from_user',
          'err',
          'err_str',
          'copyName',
        ]),
      }
    })

    const {
      response: { task },
    } = await ImportSpecialBasicPrice({
      customer_id: this.customerId!,
      file_url: '',
      special_basic_price_info: list,
    })

    // 获取进度
    await this.updateProgress(task!.task_id)
    // 更新状态
    await this.updateStep(task!.task_id)
  }

  async updateStep(task_id: string) {
    if (_.inRange(this.failureCount!, 1, 100) && this.importErrorCount < 1) {
      const {
        response: { err_list },
      } = await ListErrSpecialBasicPriceV2({
        task_id: task_id,
      })
      runInAction(() => {
        this.step = 1
        this.errorList =
          _.map(err_list, (it) => {
            return {
              ...it,
              sku_id: '0',
              unit_id: it.err === Status_Code.UNIT_DUPLICATE ? '' : it.unit_id,
              forced_create: it.err === Status_Code.SKU_NOT_EXISTS,
              unit_id_from_user: it.unit_id || '', // 备份用户输入的单位
              copyName: it.name! || '', // 备用
            }
          }) || []
      })
    } else {
      runInAction(() => {
        this.step = 2
      })
    }
  }

  async updateProgress(taskId: string): Promise<void> {
    // 1、创建任务后不能马上查询到；2、需要轮询间隔
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const res = await GetTask({ task_id: taskId })
    const task = res.response.task
    const data = res.response.task_data
    if (
      [
        Task_State.STATE_CANCELED,
        Task_State.STATE_FAULTED,
        Task_State.STATE_COMPLETED,
      ].includes(task.state!)
    ) {
      runInAction(() => {
        this.loading = false
        this.progress = 100
        this.successCount = 0
        this.failureCount = data?.failure_count?.total
        this.successCount = data?.success_count?.total
        this.failureAttachURL = data?.failure_attach_url
      })
      return
    }
    if (!data) return await this.updateProgress(taskId)
    runInAction(() => {
      this.failureAttachURL = data.failure_attach_url
      this.failureCount = data.failure_count?.total
      this.successCount = data.success_count?.total
      this.progress = (data.progress! / data.total!) * 100
      this.total = data.total!
    })
    if (data.progress !== data.total) await this.updateProgress(taskId)
  }

  /** 异常处理相关 */
  updateSelected(selected: string[]) {
    runInAction(() => {
      this.selected = selected
    })
  }

  updateCategory(cate: DataOption[]) {
    runInAction(() => {
      this.category = cate
    })
  }

  updateErrorList<T extends keyof ErrorListProps>(
    index: number,
    key: T,
    value: ErrorListProps[T],
  ) {
    runInAction(() => {
      this.errorList[index][key] = value
    })
  }

  del(index: number) {
    runInAction(() => {
      this.errorList.splice(index, 1)
    })
  }
}

export default new Store()
