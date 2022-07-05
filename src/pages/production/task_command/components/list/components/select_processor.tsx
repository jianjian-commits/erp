import { CascaderAndSelectOptions } from '@/pages/production/task_command/interface'
import { KCSelect } from '@gm-pc/keyboard'
import { Flex } from '@gm-pc/react'
import { Cascader, Tag } from 'antd'
import { DefaultOptionType } from 'antd/lib/cascader'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { ValueType } from 'rc-cascader/lib/Cascader'
import React, { FC, ReactElement, useEffect, useState } from 'react'
import store from '../../../store'

interface ProcessorProps {
  /** 车间或小组的ID */
  processor: string
  /** 是否全键盘 */
  isKeyboard?: boolean
  /** 上级车间ID（适用于小组） */
  parentId?: string
  /** 改变时执行的动作 */
  onChange: (value: string) => void
}

const SelectProcessor: FC<ProcessorProps> = ({
  processor,
  isKeyboard,
  parentId,
  onChange,
}) => {
  const { factoryModalList } = store

  const [selected, setSelected] = useState<ValueType>()
  const [options, setOptions] = useState<CascaderAndSelectOptions<string>[]>([])

  useEffect(() => {
    store.getProcessor(
      processor,
      () => setSelected([processor]),
      (modal, group) => setSelected([modal.value, group.value]),
    )
  }, [])

  useEffect(() => {
    const options = _.reduce(
      _.cloneDeep(factoryModalList),
      (options, modal) => {
        if (!modal.children?.length) {
          modal.label = (
            <Flex alignCenter>
              <div>{modal.text}</div>
              <Tag color='red' style={{ marginLeft: 4 }}>
                {t('未关联小组')}
              </Tag>
            </Flex>
          )
        }
        return [...options, modal]
      },
      [] as CascaderAndSelectOptions<string>[],
    )
    setOptions(options)
  }, [factoryModalList])

  const displayRender = (
    labels: (ReactElement | string)[],
    selectedOptions?: DefaultOptionType[],
  ) => {
    // 因为未关联小组的车间选项增加了标签，所以这里只提取文字部分展示
    if (selectedOptions?.length === 1 && !selectedOptions[0].children) {
      return (labels[0] as ReactElement)?.props?.children[0]
    }
    return labels.join('/')
  }

  const handleProcessorChange = (value: any) => {
    if (value.length) {
      setSelected(value)
      onChange(value[value.length - 1])
    } else {
      setSelected([processor || '-'])
    }
  }

  return (
    <>
      {isKeyboard ? (
        <KCSelect
          data={factoryModalList.reduce((modalList, modal) => {
            if (modalList.length === 0) {
              if (modal.processor_id === parentId) {
                modalList.push(...(modal.children || []))
              } else {
                const group = modal.children?.find(
                  (child) => child.processor_id === parentId,
                )
                if (group) {
                  modalList.push(group)
                }
              }
            }

            return modalList
          }, [] as CascaderAndSelectOptions<string>[])}
          value={processor}
          onChange={onChange}
        />
      ) : (
        <Cascader
          options={options}
          value={selected}
          expandTrigger='hover'
          changeOnSelect
          style={{ width: 200 }}
          displayRender={displayRender}
          onChange={handleProcessorChange}
        />
      )}
    </>
  )
}

export default SelectProcessor
