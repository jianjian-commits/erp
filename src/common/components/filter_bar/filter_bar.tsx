/*
 * @Description: 表头筛选
 */
import React, {
  useRef,
  ReactNode,
  ReactElement,
  FC,
  useImperativeHandle,
} from 'react'
import { t } from 'gm-i18n'
import {
  BoxForm,
  BoxFormMore,
  FormBlock,
  FormButton,
  Button,
  ControlledFormProps,
  ControlFormItemProps,
  ControlledFormItem,
  RenderProps,
  List,
  Popover,
  ListProps,
  useControlFormRef,
} from '@gm-pc/react'

import SVGDownTriangle from '@/svg/down_triangle.svg'
import { Map_Component } from './map_component'
import globalStore from '@/stores/global'

/* 表单配置 */
export interface FormConfig<T = any> extends Partial<ControlFormItemProps<T>> {
  /* 表单组件类型 */
  type?: keyof typeof Map_Component
  /* 自定义FormItem中的组件 */
  component?: ReactNode
  /* 是否要包裹在FormItem里 */
  inFormItem?: boolean
  /* 当设置type时组件要额外添加props */
  componentProps?: RenderProps
}
export interface FilterBarProps<T = any> extends ControlledFormProps<T> {
  tabKey: string
  /* 基础表单配置 */
  basicForms: FormConfig<T>[]
  /* 高级筛选表单配置 */
  moreForms?: FormConfig<T>[]
  /* 如果有多余的导出可加这个，参照订单 */
  popListData?: ListProps<number>['data']
  /* exportType: 导出有可能有多种格式，默认导出的exportType为undefined，其他为popListData每项对应的value */
  onExport?(exportType?: number): Promise<any>
}
function FilterBar<T = any>(props: FilterBarProps<T>) {
  const { basicForms, moreForms, popListData, onExport, form, ...res } = props

  const popoverRef = useRef<Popover>(null)
  const formRef = useControlFormRef()
  /**
   * @description: 导出
   * @param {number} exportType 导出类型
   */
  const handleExport = (exportType?: number) => {
    popoverRef.current && popoverRef.current.apiDoSetActive(false)
    if (onExport) {
      /* 默认导出为第一个tab，如果要弹出批量的tab，then的时候return { tabKey: '1' } */
      onExport(exportType).then(({ tabKey }) =>
        globalStore.showTaskPanel(tabKey),
      )
    }
  }
  /**
   * @description: 渲染表单项
   * @param {FormConfig} formItems
   */
  const renderFormItem = (formItems: FormConfig[]) => {
    return formItems.map((item, index) => {
      let {
        type,
        component,
        inFormItem = true,
        componentProps = {},
        ...res
      } = item
      // 如果配置了不在FormItem里面，则直接返回
      if (!inFormItem) {
        return component
      }
      // 如果没自定义组件且配置了type组件类型
      if (!component && type) {
        // 根据类型获取组件
        const Component = Map_Component[type] as unknown as FC
        // 将额外的props注入
        component = <Component {...componentProps} />
      }
      // 如果有传label，取label作为key，否则取index
      const key =
        typeof item.label === 'string' && item.label ? item.label : `${index}`
      return (
        <ControlledFormItem {...res} key={key}>
          {component as ReactElement}
        </ControlledFormItem>
      )
    })
  }
  useImperativeHandle(
    form,
    () => ({
      ...formRef.current,
    }),
    [formRef],
  )
  /**
   * @description: 重置表单
   */
  const onReset = () => {
    formRef.current.resetFields()
  }
  return (
    <BoxForm<T>
      labelWidth='100px'
      colWidth='385px'
      {...res}
      isControl
      form={formRef}
    >
      {/*  基础表单渲染start  */}
      <FormBlock col={3}>{renderFormItem(basicForms)}</FormBlock>
      {/*  基础表单渲染end  */}
      {/*  高级筛选表单渲染start  */}
      {moreForms && (
        <BoxFormMore>
          <FormBlock col={3}>{renderFormItem(moreForms)}</FormBlock>
        </BoxFormMore>
      )}
      {/*  高级筛选表单渲染end  */}
      <FormButton>
        <Button type='primary' htmlType='submit'>
          {t('搜索')}
        </Button>
        {/* 如果高级筛选，自动渲染重置按钮 */}
        {moreForms && (
          <BoxFormMore>
            <Button className='gm-margin-left-10' onClick={onReset}>
              {t('重置')}
            </Button>
          </BoxFormMore>
        )}
        {/*  如果有导出，则渲染导出按钮  */}
        {onExport && (
          <>
            <Button
              type='default'
              onClick={handleExport.bind(null, undefined)}
              className='gm-margin-left-10'
            >
              {t('导出')}
            </Button>
            {/*  如果有更多导出类型  */}
            {popListData && (
              <Popover
                ref={popoverRef}
                type='click'
                popup={
                  <List
                    data={popListData}
                    onSelect={handleExport}
                    className='gm-border-0'
                    style={{ minWidth: '30px' }}
                  />
                }
              >
                <Button>
                  <SVGDownTriangle />
                </Button>
              </Popover>
            )}
          </>
        )}
      </FormButton>
    </BoxForm>
  )
}

export default FilterBar
