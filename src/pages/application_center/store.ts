import { makeAutoObservable } from 'mobx'
import {
  AppInstance,
  AppTemplate,
  AppTemplate_AppGroupType,
  ListAppInstance,
  ListAppTemplate,
  UpdateAppInstance,
} from 'gm_api/src/application'
import globalStore from '@/stores/global'

interface ApplicationListItem {
  title: string
  list: AppTemplate[]
}
class SyncStore {
  templatelist: ApplicationListItem[] = []
  appInstancelist: AppInstance[] = []
  /**
   * @class
   */
  constructor() {
    // 必须使用autoBind，否则usePagination无法获取this
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  getTemplateList() {
    ListAppTemplate({ paging: { limit: 999 } }).then(({ response }) => {
      const { app_templates } = response
      const list: ApplicationListItem[] = []
      // 平台对接
      const platform: AppTemplate[] = []
      // 系统扩展
      const systemExpand: AppTemplate[] = []
      // 高级功能
      const seniorFunction: AppTemplate[] = []
      // 客户端/小程序
      const clientAndApplet: AppTemplate[] = []

      app_templates.forEach((item) => {
        const { app_group_type } = item
        switch (app_group_type) {
          case AppTemplate_AppGroupType.APPGROUPTYPE_PLATFORM_DOCKING:
            platform.push(item)
            break
          case AppTemplate_AppGroupType.APPGROUPTYPE_SYSTEM_EXPANSION:
            systemExpand.push(item)
            break
          case AppTemplate_AppGroupType.APPGROUPTYPE_ADVANCED_FEATURES:
            seniorFunction.push(item)
            break
          case AppTemplate_AppGroupType.APPGROUPTYPE_CLIENT_APPLET:
            clientAndApplet.push(item)
            break
          default:
            break
        }
      })
      if (platform.length) {
        list.push({ title: '平台对接', list: platform })
      }
      if (systemExpand.length) {
        list.push({ title: '系统扩展', list: systemExpand })
      }
      if (seniorFunction.length) {
        list.push({ title: '高级功能', list: seniorFunction })
      }
      if (clientAndApplet.length) {
        list.push({ title: '客户端/小程序', list: clientAndApplet })
      }
      this.templatelist = list
    })
  }

  getAppInstanceList() {
    ListAppInstance({
      group_id: globalStore.groupId,
      paging: { limit: 999 },
    }).then(({ response }) => {
      const { app_instances } = response
      this.appInstancelist = app_instances
    })
  }

  updateAppInstance(app_instance: AppInstance) {
    return UpdateAppInstance({ app_instance })
  }
}

export default new SyncStore()
