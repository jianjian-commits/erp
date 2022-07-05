import React, { FC, useState, useEffect } from 'react'
import { Flex, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { Button, Divider, Radio } from 'antd'

import _ from 'lodash'
import { LocalStorage } from '@gm-common/tool'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
  PrintingTemplate,
  PrintingTemplate_TemplateProductionType,
} from 'gm_api/src/preference'

interface ArrayType {
  value: number
  title: string
  tip: string
  [key: string]: any
}

const RadioMap = (data: {
  text: string
  array: ArrayType[]
  value: any
  setValue: (value: any) => void
}) => {
  const { text, value, setValue, array } = data
  return (
    <div className='gm-margin-bottom-20'>
      <div>{text}</div>
      <Radio.Group value={value} onChange={(e) => setValue(e.target.value)}>
        {_.map(array, ({ value, title, tip }) => (
          <Flex column className='gm-margin-bottom-5'>
            <Radio value={value}>{title}</Radio>
            <span className='gm-text-desc gm-text-12 gm-margin-left-20'>
              {tip}
            </span>
          </Flex>
        ))}
      </Radio.Group>
    </div>
  )
}

const DiyBatchPrint: FC<{
  /** 用于缓存用户所选操作 */
  id: string | number
  type: PrintingTemplate_Type
  onCancel: (e: React.MouseEvent) => void
  onOk: (data: {
    mergeData: number
    printData: number
    printId: string
  }) => void
  printTypeArray?: ArrayType[]
  defaultPrint?: number
  href?: (printing_template_id: string) => string
  // 只在生产单下使用
  mergeTypeArray?: ArrayType[]
  defaultMerge?: number
  printProduceType?: PrintingTemplate_TemplateProductionType // 生产里的包含三个模块
}> = ({
  type,
  printTypeArray,
  mergeTypeArray,
  printProduceType,
  onOk,
  onCancel,
  defaultPrint,
  defaultMerge,
  id,
  href,
}) => {
  // 聚合相关
  const mergeKey = id + '_MergeData'
  const printKey = id + '_PrintData'
  const printTemple = id + '_printTemple'

  // 模板相关
  const [mergeData, setMergeData] = useState<number>(
    LocalStorage.get(mergeKey) || defaultMerge,
  )
  const [printData, setPrintData] = useState<number>(
    LocalStorage.get(printKey) || defaultPrint,
  )
  const [templateList, setTemplateList] = useState<PrintingTemplate[]>([])
  const [printId, setPrintId] = useState('')

  const handleSave = () => {
    LocalStorage.set(mergeKey, mergeData)
    LocalStorage.set(printKey, printData)
    if (!printId) {
      Tip.danger(t('请选择一个模板'))
      return
    }
    LocalStorage.set(printTemple, printId)
    onOk({ mergeData, printData, printId: printId })
  }

  useEffect(() => {
    ListPrintingTemplate({
      type,
      paging: { limit: 999 },
    }).then((json) => {
      const templateData = printProduceType
        ? _.filter(json.response.printing_templates, {
            template_production_type: printProduceType,
          })
        : json.response.printing_templates
      const printTempleId = LocalStorage.get(printTemple)
      setTemplateList(templateData)
      // 存储上次选择的为被删除的模板 没有则选择默认
      setPrintId(
        printTempleId &&
          _.find(templateData, { printing_template_id: printTempleId })
          ? printTempleId
          : _.find(templateData, { is_default: true })?.printing_template_id,
      )
      return null
    })
  }, [])

  return (
    <div className='b-diy-batch'>
      <Flex className='b-batch-top'>
        {!!mergeTypeArray?.length && printTypeArray?.length && (
          <>
            <div className='gm-margin-tb-20 gm-margin-right-20 b-batch-chose'>
              {!!mergeTypeArray?.length &&
                RadioMap({
                  text: t('选择聚合方式：'),
                  value: mergeData,
                  setValue: setMergeData,
                  array: _.filter(mergeTypeArray, ({ showType }) =>
                    (
                      showType as PrintingTemplate_TemplateProductionType[]
                    ).includes(printProduceType!),
                  ),
                })}
              {printTypeArray?.length &&
                RadioMap({
                  text: t('选择打印类型：'),
                  value: printData,
                  setValue: setPrintData,
                  array: printTypeArray,
                })}
            </div>
            <span className='b-span-border' />
          </>
        )}
        <Flex
          flex={1}
          column
          className='gm-margin-tb-20 gm-margin-left-20 b-info-box'
        >
          {t('模板选择：')}
          <Radio.Group
            onChange={(e) => setPrintId(e.target.value)}
            className='b-batch-template'
            value={printId}
          >
            {_.map(
              templateList,
              ({
                name,
                is_default,
                printing_template_id,
                template_production_type,
              }) => {
                return (
                  <Flex column>
                    <Divider className='gm-margin-10' />
                    <Flex justifyBetween className=' gm-text-12 '>
                      <div>
                        <Radio value={printing_template_id} />
                        <span>{name + (is_default ? '(默认)' : '')}</span>
                      </div>
                      <a
                        href={
                          href
                            ? href(printing_template_id)
                            : `#/system/template/print_template/production_template/edit?template_production_type=${template_production_type}&template_id=${printing_template_id}`
                        }
                        target='_blank'
                        rel='noreferrer'
                      >
                        {t('设置模板')}
                      </a>
                    </Flex>
                  </Flex>
                )
              },
            )}
          </Radio.Group>
        </Flex>
      </Flex>
      <Divider className='gm-margin-top-0' />
      <Flex justifyBetween alignCenter>
        <a href='#/system/setting/production_setting' target='_blank'>
          {t('领料单打印设置')}
        </a>
        <div>
          <Button className='gm-margin-right-15' onClick={onCancel}>
            {t('取消')}
          </Button>
          <Button type='primary' onClick={handleSave}>
            {t('打印')}
          </Button>
        </div>
      </Flex>
    </div>
  )
}

export default DiyBatchPrint
