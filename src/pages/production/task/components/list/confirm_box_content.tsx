import { MaterialListTypeTip } from '@/pages/production/enum'
import { LocalStorage } from '@gm-common/tool'
import { Flex, RadioGroup, Tooltip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import {
  Bom,
  ListTaskRequest_MaterialListType,
  list_ListTaskRequest_MaterialListType,
} from 'gm_api/src/production'
import _ from 'lodash'
import React, { FC, useState } from 'react'

interface ConfirmBoxContentProps {
  context: {
    text: string
    style?: string | undefined
  }[]
  isPack: boolean
  /** 是否是下达计划 */
  isRelease: boolean
  /** 最近24小时内改变过的BOM，适用于下达计划 */
  changedBoms: Bom[]
}

const ConfirmBoxContent: FC<ConfirmBoxContentProps> = ({
  context,
  isPack,
  isRelease,
  changedBoms,
}) => {
  const [autoGenerate, setAutoGenerate] = useState<boolean>(
    LocalStorage.get('autoGenerate') || false,
  )

  const [listType, setListType] = useState<number>(
    LocalStorage.get('listType') ||
      ListTaskRequest_MaterialListType.MATERIALLISTTYPE_CATEGORY,
  )

  const handleAutoGenerateChange = (toggle: boolean) => {
    LocalStorage.set('autoGenerate', toggle)
    setAutoGenerate(toggle)
    handleListTypeChange(
      ListTaskRequest_MaterialListType.MATERIALLISTTYPE_CATEGORY,
    )
  }

  const handleListTypeChange = (selected: number) => {
    LocalStorage.set('listType', selected)
    setListType(selected)
  }

  return (
    <Flex column className='gm-padding-10'>
      {_.map(context, (item) => (
        <div key={item.text} className='gm-margin-bottom-5'>
          {item.text}
        </div>
      ))}
      {isRelease && (
        <div>
          <div className='gm-text-bold gm-margin-tb-10'>{t('请确认：')}</div>
          <Flex
            alignCenter
            style={{ margin: '4px 0' }}
            className='gm-margin-bottom-10'
          >
            <div>{t('自动生成领料单：')}</div>
            <div style={{ padding: '0 4px' }}>
              <RadioGroup
                value={autoGenerate}
                onChange={handleAutoGenerateChange}
                options={[
                  {
                    value: true,
                    children: <span className='b-radio-margin'>{t('是')}</span>,
                  },
                  {
                    value: false,
                    children: <span>{t('否')}</span>,
                  },
                ]}
              />
            </div>
          </Flex>
          {autoGenerate && (
            <Flex alignCenter style={{ margin: '4px 0' }}>
              <div>{t('生成领料单类型：')}</div>
              <div style={{ padding: '0 4px' }}>
                <RadioGroup
                  value={listType}
                  onChange={handleListTypeChange}
                  // 产品说要调循序。。
                  options={_.map(
                    _.reverse(
                      _.cloneDeep(list_ListTaskRequest_MaterialListType),
                    ),
                    ({ value, text }) => ({
                      value,
                      children: <span>{text}</span>,
                    }),
                  )}
                />
              </div>
              <div style={{ padding: '0' }}>
                <Tooltip
                  popup={
                    <div className='gm-padding-5'>
                      {_.map(MaterialListTypeTip, (v) => {
                        return <div className='gm-margin-bottom-5'>{v}</div>
                      })}
                    </div>
                  }
                  style={{ margin: '0 4px' }}
                />
              </div>
            </Flex>
          )}
          {changedBoms.length > 0 && (
            <div style={{ color: 'red' }}>
              警告：计划中的BOM：
              {changedBoms
                .map((bom, index) => {
                  if (index === changedBoms.length - 1) {
                    return `“${bom.name}”`
                  }
                  return `“${bom.name}”`
                })
                .join(',')}
              24小时内被编辑过，请确认BOM信息准确一致
            </div>
          )}
        </div>
      )}
    </Flex>
  )
}

export default ConfirmBoxContent
