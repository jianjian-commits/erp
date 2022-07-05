import {
  Button,
  Form,
  FormButton,
  FormItem,
  MoreSelect,
  MoreSelectDataItem,
} from '@gm-pc/react'
import { Input } from 'antd'
import { t } from 'gm-i18n'
import { Attr } from 'gm_api/src/production'
import _ from 'lodash'
import { observer } from 'mobx-react'
import React, { FC, useEffect, useState } from 'react'
import { ProcessOfBom } from '../interface'
import store from '../store'

/**
 * 工序指导参数的属性
 */
interface Props {
  /** 工序的详情 */
  detail: ProcessOfBom
  /** 工序的编号 */
  processIndex: number
  /** 取消时执行的动作 */
  onCancel: () => void
}

/**
 * 工序指导参数的组件函数
 */
const ProcessDetail: FC<Props> = observer(
  ({ detail, processIndex, onCancel }) => {
    // 存储当前选择的工序所有信息 -- 选择修改属性用
    const [pDetail, setPDetail] = useState<Attr[]>([])
    // 存储当前选择的工序及其设置的属性信息
    const [pSelected, setPSelected] = useState<Attr[]>([])
    const { processList } = store

    useEffect(() => {
      const p_detail = _.find(
        processList,
        (p) => p.process_template_id === detail?.process_template_id,
      )
      setPDetail(p_detail?.attrs?.attrs!)
      // 详情中attr数组保存是的确定的value，为了统一，转成数组
      setPSelected(
        _.map(detail.attrs, (attr) => ({
          ...attr,
          values: attr.values || [],
        })),
      )
    }, [detail])

    /**
     * 处理提交的事件
     * 更新工序指导参数
     */
    const handleSubmit = () => {
      // 需要过滤掉pSelected中选择为空的数值。属性为空不展示，属性不为空有空格需要做处理
      const _new_attrs: Attr[] = _.filter(
        pSelected,
        (attr) => _.filter(attr?.values, (v) => v.trim() !== '').length !== 0,
      )
      const new_attrs: Attr[] = _.forEach(_new_attrs, (attr) => {
        attr.values = _.map(attr.values, (v) => v.trim())
      })

      store.updateBomProcess(processIndex, 'attrs', new_attrs)
      onCancel()
    }

    /**
     * 处理工序参数选择的事件
     * 更新选择的参数
     * @param {MoreSelectDataItem<string>} selected  选择的参数
     * @param {string}                     attrIndex 参数的编号
     * @param {string}                     attr_id   参数的ID
     */
    const handleSelectedAttrs = (
      selected: MoreSelectDataItem<string>,
      attrIndex: number,
      attr_id: string,
    ) => {
      // 通过attr_id来判断修改的是哪一个属性, 记录 attr_id所选中的value.
      // 这里工序属性id跟index是一致的，在工序那边由前端维护
      const attrs: Attr[] = pSelected.slice() || []
      const index: number = _.findIndex(attrs, (a) => a.attr_id === attr_id)

      if (index !== -1) {
        attrs[index] = selected?.text
          ? {
              ...attrs[index],
              values: [selected.text],
              // 详情不会带着名称信息
              name: (pDetail && pDetail?.[attrIndex].name) || '',
            }
          : {}
      } else {
        attrs.push({
          attr_id,
          values: [selected.text],
          name: (pDetail && pDetail?.[attrIndex].name) || '',
        })
      }

      setPSelected(attrs)
    }

    /**
     * 处理参数更改的事件
     * 更新选择的参数
     * @param {MoreSelectDataItem<string>} selected  选择的参数
     * @param {string}                     attrIndex 参数的编号
     * @param {string}                     attr_id   参数的ID
     */
    const handleChange = (
      value: string,
      attrIndex: number,
      attr_id: string,
    ) => {
      handleSelectedAttrs({ value: value, text: value }, attrIndex, attr_id)
    }

    return (
      <Form labelWidth='100px'>
        <FormItem label={t('工序名称')}>
          <div className='gm-margin-top-5'>
            {detail?.selectProcess?.text || ''}
          </div>
        </FormItem>
        {pDetail &&
          _.map(pDetail.slice(), (attr: Attr, i: number) => {
            const { name, type, attr_id } = attr
            // 找到当前所选择的属性, 根据attr_id查找
            const _attr: Attr = _.find(
              pSelected.slice(),
              (a) => a.attr_id === attr_id,
            ) || { values: [''] }

            const sAttr: string = _attr
              ? _attr?.values
                ? _attr?.values[0]
                : ''
              : ''

            const sIndex = sAttr
              ? _.findIndex(attr.values, (a) => a === sAttr)
              : -1

            const attrList = _.map(attr.values, (v, index) => ({
              value: `${index + (name || '')}`,
              text: v,
            }))

            return (
              <FormItem label={name}>
                {type === 2 ? (
                  <MoreSelect
                    data={attrList}
                    selected={
                      sIndex === -1 ? [] : { value: `${sIndex}`, text: sAttr }
                    }
                    renderListFilterType='pinyin'
                    onSelect={(selected: MoreSelectDataItem<string>) =>
                      handleSelectedAttrs(selected, i, attr_id!)
                    }
                    style={{ width: '300px' }}
                  />
                ) : (
                  <Input.TextArea
                    value={sAttr || ''}
                    maxLength={500}
                    rows={3}
                    allowClear
                    onChange={(e) => handleChange(e.target.value, i, attr_id!)}
                    style={{ width: '420px' }}
                  />
                )}
              </FormItem>
            )
          })}
        <FormButton>
          <Button
            className='gm-margin-right-5'
            htmlType='button'
            onClick={onCancel}
          >
            {t('取消')}
          </Button>
          <Button type='primary' onClick={handleSubmit}>
            {t('保存')}
          </Button>
        </FormButton>
      </Form>
    )
  },
)

export default ProcessDetail
