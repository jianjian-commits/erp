import { dateTMM, formatCascaderData, formatTreeData } from '@/common/util'
import { uploadImage } from '@gm-common/image'
import { qiniuUpload } from '@gm-common/qiniup'
import { gmHistory as history, withRouter } from '@gm-common/router'
import axios from 'axios'
import sha256 from 'crypto-js/sha256'
import {
  CloudType,
  FileType,
  GetPresignedURL,
  GetQiniuUploadToken,
} from 'gm_api/src/cloudapi'
import { Image, Image_Type } from 'gm_api/src/common'
import {
  Quotation_UpdateValidTime,
  GetCategoryTree,
} from 'gm_api/src/merchandise'
import _ from 'lodash'
import moment from 'moment'
import React, { ComponentType } from 'react'
import { matchPath } from 'react-router'
import { useBreadcrumbs } from './hooks'
import { DataNode, DataOption } from '@/common/interface'
import globalStore from '@/stores/global'

const sharePath: string[] = [
  '/share/purchase_bill_template_print', // 采购单分享
  '/share/delivery_template_print', // 配送单分享
]
// 全屏配置放在这里
const fullScreenPaths: string[] = [
  '/sorting/schedule/full_screen',
  '/login',
  '/report/production/production_schedule/full_screen', // 生产进度
  '/report/production/pack_schedule/full_screen', // 包装进度
  '/system/template/print_template/purchase_task_template/edit',
  '/system/template/print_template/salemenus_template/edit', // 报价单
  '/system/template/print_template/salemenus_template/print', // 报价单
  '/system/template/print_template/purchase_task_template/print',
  '/system/template/print_template/purchase_bill_template/edit',
  '/system/template/print_template/purchase_bill_template/print',
  '/system/template/print_template/inner_label_template/edit', // 内标模板编辑
  '/system/template/print_template/sorting_label_template/edit', // 分拣标签
  '/production/print/bills', // 生产相关打印
  '/system/template/print_template/delivery_template/edit', // 配送商户模版设置
  '/system/template/print_template/delivery_template/print', // 配送商户模版打印
  '/system/template/print_template/delivery_template/printForMiniProgram', // 配送商户模版打印小程序专用
  '/system/template/print_template/account_template/edit', // 配送账户模版设置
  '/system/template/print_template/account_template/print', // 配送账户模版打印
  '/system/template/print_template/delivery_template/mergeKid', // 配送模版打印
  '/system/template/print_template/stock_in_template/edit', // 入库单模版打印
  '/system/template/print_template/stock_in_template/print', // 入库单模版打印
  '/financial_manage/meals_settlement/meals_settlement/print', // 餐次对账单打印
  '/financial_manage/merchant_settlement/merchant_settlement/print', // 商户对账单打印
  '/production/production_tools/print_box_label/edit', // 箱签模板编辑
  '/production/production_tools/print_box_label/print', // 箱签打印预览
  '/system/template/print_template/stock_out_template/edit', // 出库单模版打印
  '/system/template/print_template/stock_out_template/print', // 出库单模版打印
  '/system/template/print_template/supplier_settle_template/edit', // 结款模版打印
  '/system/template/print_template/supplier_settle_template/print', // 结款模版打印
  '/system/template/print_template/cannibalize_template/print', // 调拨模版打印
  '/system/template/print_template/cannibalize_template/edit', // 调拨模版编辑
  '/system/template/print_template/production_template/edit', // 生产单据编辑 净菜
  '/system/template/print_template/production_template/print', // 生产单据打印 净菜
  '/system/template/print_template/material_requisition_template/edit', // 领料单据打印
  '/system/template/print_template/material_requisition_template/print', // 领料单据打印
  '/production/print_command/bills', // 生产任务打印
  '/iot/environment/temp_hum_monitor/projection', // 温湿度监控
  '/system/template/print_template/customer_bill_template/edit', // 客户账单打印模板
  '/system/template/print_template/customer_bill_template/print', // 客户账单打印
  ...sharePath,
]
const fullScreenCache: { [id: string]: boolean } = {}

export function isFullScreen(pathname: string) {
  if (fullScreenCache[pathname]) {
    return true
  }
  return !!_.find(fullScreenPaths, (v) => {
    if (matchPath(pathname, { path: v })) {
      fullScreenCache[pathname] = true
      return true
    }
    return false
  })
}

// 获取预签名url，通过url上传腾讯云
export const getTengXunPreSignedUrl = (
  file_type: FileType,
  filename: string,
) => {
  return GetPresignedURL({
    cloud_type: CloudType.CLOUD_TYPE_TENCENT,
    file_type,
    filename,
  }).then((json) => json)
}

const uploadFile = async (url: string, file: File) => {
  const res = await axios({
    method: 'put',
    url,
    data: file,
    headers: {
      Accept: 'application/json',
    },
  })
  return res
}

export const uploadTengXunFile = async (file_type: FileType, file: File) => {
  const res = await getTengXunPreSignedUrl(file_type, file.name)
  // presigned_url上传文件用，download_url后台下载文件用
  const { presigned_url, download_url } = res.response
  if (!presigned_url) {
    return null
  }

  return uploadFile(presigned_url, file).then((json) => {
    return {
      ...json,
      presigned_url,
      download_url,
      type: CloudType.CLOUD_TYPE_TENCENT,
    }
  })
}

export const getQiniuToken = (file_type: number) => {
  return GetQiniuUploadToken({ file_type }).then((json) => {
    const { expire_time, dir_path, upload_token } = json.response
    return {
      prefix: dir_path,
      token: upload_token,
      expire_time: `${new Date(+new Date() + +expire_time)}`,
    }
  })
}

export const uploadQiniuImage = (file_type: number, file: File) => {
  return uploadImage(file, {
    fileType: `IMAGE_TYPE_${file_type}`,
    getQiniuInfo: () => getQiniuToken(file_type),
  }).then(({ url, key }) => ({
    data: {
      url,
      type: Image_Type.TYPE_QINIU,
      path: `${key}`,
    },
  }))
}

export const uploadQiniuFile = (file_type: number, file: File) => {
  return qiniuUpload(file, {
    fileType: `FILE_TYPE_${file_type}`,
    getQiniuInfo: () => getQiniuToken(file_type),
  }).then(({ url, key }) => ({
    data: {
      url,
      type: CloudType.CLOUD_TYPE_QINIU,
      path: `${key}`,
    },
  }))
}

export const imageDomain = 'https://qncdn.guanmai.cn/'

export function processPassword(password: string): string {
  return sha256(password).toString()
}

export const getImages = (images: Image[]) =>
  _.map(images, (i) => ({ ...i, url: imageDomain + i.path }))

// 将列表展示缩小为60*60，参数解析请参考七牛云imageView2功能
export const getListImages = (images: Image[]) =>
  _.map(images, (i) => ({
    ...i,
    url: imageDomain + i.path + '?imageView2/3/w/60',
  }))

// 当 breadcrumbs 固定用此装饰 @withBreadcrumbs(['xxxx'])
export const withBreadcrumbs =
  (breadcrumbs: string[]) => (WrappedComponent: ComponentType) => {
    return (props: any) => {
      useBreadcrumbs(breadcrumbs)
      return <WrappedComponent {...props} />
    }
  }

const today = new Date()

export const getMondayAndSunday = (date: Date) => {
  const week = moment(date).day()
  return {
    monday:
      '' +
      moment(date)
        .subtract(week - 1, 'd')
        .startOf('day')
        .toDate(),
    sunday:
      '' +
      moment(date)
        .add(7 - week, 'd')
        .startOf('day')
        .toDate(),
  }
}

/**
 * 生效周期
 * 一个周期固定为周一 ~ 周日
 * 假设菜谱更新时间为周三12.00
 * 若今天为2020年11月18号12点前，周三，则生效时间为当前周期，2020年11月16号~2020年22号
 * 若今天为2020年11月19日，周四，则生效时间为上一个周期+当前周期，2020年11月16号 ~ 2020年11月29号
 * @param replace_time Menu_ReplaceTime
 */
export const getEffectiveCycle = (replace_time: Quotation_UpdateValidTime) => {
  const { start_time, start_day } = replace_time
  // 和后台设置的start_day 统一
  const week = moment(today).day() === 0 ? 7 : moment(today).day()
  const { sunday, monday } = getMondayAndSunday(today)
  let begin, end
  if (+week > +start_day!) {
    begin = monday
    end = getMondayAndSunday(moment().add(7, 'd').toDate()).sunday
  } else if (+week < +start_day!) {
    begin = monday
    end = sunday
  } else {
    // 判断小时
    const now_time = dateTMM(today)
    if (now_time > start_time!) {
      begin = monday
      end = getMondayAndSunday(moment().add(7, 'd').toDate()).sunday
    } else {
      begin = monday
      end = sunday
    }
  }
  return { begin, end }
}

/**
 * @description 获取分类数据 for ant-design
 */
export const fetchTreeData = () => {
  return GetCategoryTree().then((res) => {
    const {
      response: { categories = [] },
    } = res

    const lessLevelTreeList: DataNode[] = []
    const categoryList: DataNode[] = []
    categories.forEach((item) => {
      const { name, parent_id, category_id, level } = item
      if (level !== undefined && level <= 3) {
        const item = {
          value: category_id,
          key: category_id,
          title: name,
          parentId: parent_id,
          children: [],
        }
        categoryList.push(item)

        if (level <= 2) {
          if (globalStore.isLite) {
            // 轻巧版下父节点只取一级分类
            if (level === 1) lessLevelTreeList.push(item)
          } else {
            lessLevelTreeList.push(item)
          }
        }
      }
    })

    /** 三级分类树 用于分类筛选 */
    const categoryTreeData = formatTreeData(_.cloneDeep(categoryList))

    /** 二级分类树，用于新建分类 */
    const lessLevelCategoryTreeData = formatTreeData(
      _.cloneDeep(lessLevelTreeList),
    )

    const categoryMap = _.keyBy(categoryList, 'value')

    /**
     * @description 获取某一层级的分类
     * @param level 层级
     * @returns 分类数据
     */
    const getTreeListByLevel = (level: any): DataNode[] => {
      return categories
        .map((item) => {
          const { name, parent_id, category_id } = item
          if (item.level !== undefined && item.level === level) {
            return {
              value: category_id,
              key: category_id,
              title: name,
              parentId: parent_id,
              children: [],
              level,
            }
          }
          return null
        })
        .filter(Boolean) as DataNode[]
    }

    return {
      categoryTreeData,
      lessLevelCategoryTreeData,
      categoryMap,
      getTreeListByLevel,
      categories,
    }
  })
}

export { history, withRouter }
