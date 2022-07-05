import React, { useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { LoadingFullScreen } from '@gm-pc/react'
import { doBatchPrint } from 'gm-x-printer'
import _ from 'lodash'
import { setTitle } from '@gm-common/tool'
import { useGMLocation } from '@gm-common/router'
import { GetPrintingTemplate } from 'gm_api/src/preference'
import {
  ListTaskProductSheetByProcessor,
  ProduceType,
} from 'gm_api/src/production'
import {
  productionBasicsData,
  processMerge,
  templateConfigContentsColumnsChange,
} from '@/pages/system/template/print_template/production_template/util'
import {
  ClearFoodQuery,
  MergeType,
} from '@/pages/system/template/print_template/production_template/interface'
import clearFoodDataKey from '@/pages/system/template/print_template/production_template/config/data_to_key'

setTitle(i18next.t('打印'))

const CleanFoodPrinter = () => {
  const location = useGMLocation<ClearFoodQuery>()
  // printer需要的数据
  function getCleanFoodData() {
    const { printId, mergeType, filter, level } = location.query
    // const defaultConfig = templateConfigType[mergeType]
    const numberLevel = +level
    const jsonFilter = JSON.parse(filter)
    const produceType = jsonFilter.produce_types[0]
    const isClean = produceType === ProduceType.PRODUCE_TYPE_CLEANFOOD
    return Promise.all([
      // 获取净菜的数据 level是物料，小组，车间聚合
      ListTaskProductSheetByProcessor({
        filter: jsonFilter,
        level: numberLevel,
        need_boms: isClean,
        need_tasks: true,
      }).then((json) => json.response),
      // 获取模板的信息
      GetPrintingTemplate({ printing_template_id: printId }).then(
        (json) => json.response,
      ),
    ]).then((res) => {
      const [listTaskProductSheetByProcessorResPonse, config] = res
      // 将生产返回的数据合并相同的sign
      const listTaskProductSheetByProcessorData = productionBasicsData(
        produceType,
        listTaskProductSheetByProcessorResPonse,
      )

      return _.map(listTaskProductSheetByProcessorData, (taskProductSheet) => {
        // 获取配置模板
        const templateConfig = JSON.parse(
          config.printing_template.attrs?.layout || '',
        )
        taskProductSheet = processMerge(
          taskProductSheet,
          +mergeType === MergeType.TYPE_FINISH_PRODUCT
            ? MergeType.TYPE_PACK
            : mergeType,
          isClean,
        )
        // 工序聚合 将物料工序和组合工序的text修改为物料工序和组合工序
        Number(mergeType) === MergeType.TYPE_PROCESS &&
          templateConfigContentsColumnsChange(templateConfig)
        templateConfig.productionMergeType = mergeType
        return {
          data: clearFoodDataKey(taskProductSheet, numberLevel),
          config: templateConfig,
        }
      })
    })
  }

  async function handleStart() {
    LoadingFullScreen.render({
      size: '100px',
      text: i18next.t('正在加载数据，请耐心等待!'),
    })
    // 获取打印数据并整理
    const list = await getCleanFoodData()
    LoadingFullScreen.hide()
    doBatchPrint(list)
  }

  useEffect(() => {
    handleStart()
  }, [])

  return null
}

export default CleanFoodPrinter
