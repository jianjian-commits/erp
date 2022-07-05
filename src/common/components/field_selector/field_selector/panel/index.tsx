import React, {
  useCallback,
  ReactElement,
  ReactNode,
  CSSProperties,
  useImperativeHandle,
  Ref,
} from 'react'
import { Col, Row, Checkbox } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { DraggableSortList } from '@/common/components/draggable_sort_list'
import useFetcher from '../hooks/use_fetcher'
import { useUnmount } from 'react-use'
import { SelectedFieldsRef, FetcherFn } from './interface'
import { AnyObject, ValueInObject, Fields } from '../interface'

import './index.less'

export interface FieldSelectorPanelProps<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
> {
  /**
   * tab id
   *
   * 虽然此处要求传递 id，但是这个 id 仅仅作为 tab 的唯一标识，
   * tab 激活所使用的是 name。
   */
  id: TabId
  /** tab 名称 */
  name: string
  /** 通过 ref 向外暴露内部 api */
  instanceRef?: Ref<SelectedFieldsRef<RawData, TabId, RawDataKey>>
  /** 数据源中唯一值，同时也是 React 需要的 key */
  fieldKey: keyof RawData
  /** 数据源中表示 label 字段 */
  labelKey: keyof RawData
  /** 设置容器样式（将直接作用于左右两个元素） */
  containerStyle?: CSSProperties
  /** 自定义渲染分组标题 */
  renderGroupTitle?: (group: Fields<RawData>) => ReactNode
  /**
   * Tab 激活时，用于获取字段数据。
   *
   * 注意，该值将会在 useEffect 中调用，请尽可能让其不可变。
   */
  fetcher: FetcherFn<RawData, TabId>
  /** 组件销毁时调用 */
  onBeforeDestroy?: (tabId: TabId) => void
}

/**
 * 编辑导出字段面板
 * 此组件左右结构：左侧是可选的字段，右侧是已选择的字段
 */
function FieldSelectorPanel<
  RawData extends AnyObject,
  TabId,
  RawDataKey extends ValueInObject<RawData>,
>(props: FieldSelectorPanelProps<RawData, TabId, RawDataKey>): ReactElement {
  const {
    name,
    id,
    fieldKey,
    labelKey,
    containerStyle,
    fetcher,
    onBeforeDestroy,
    renderGroupTitle,
    instanceRef,
  } = props

  const onFetchData = useCallback(() => {
    return fetcher({ id, name })
  }, [name, id, fetcher])

  const {
    isDirty,
    list,
    selectedList,
    selectedFields,
    setChecked,
    clearChecked,
    removeChecked,
    getCheckedState,
    toggleChecked,
    updateSelectedList,
    resetDirty,
  } = useFetcher<RawData, RawDataKey>({
    fieldKey,
    labelKey,
    fetcher: onFetchData,
  })

  const renderGroupHeader = (field: Fields<RawData>) => {
    if (typeof renderGroupTitle === 'function') {
      return renderGroupTitle(field)
    }
    return <p className='tw-mb-1 tw-font-bold'>{field.label}</p>
  }

  useImperativeHandle<
    SelectedFieldsRef<RawData, TabId, RawDataKey>,
    SelectedFieldsRef<RawData, TabId, RawDataKey>
  >(
    instanceRef,
    () => ({
      resetDirty,
      setChecked,
      removeChecked,
      clearChecked,
      original: {
        name,
        id,
        fields: selectedFields || [],
        get isDirty() {
          return isDirty.current
        },
      },
    }),
    [
      id,
      isDirty,
      name,
      resetDirty,
      selectedFields,
      setChecked,
      removeChecked,
      clearChecked,
    ],
  )

  useUnmount(() => {
    onBeforeDestroy && onBeforeDestroy(id)
  })

  return (
    <Row className='field-selector-panel'>
      <Col className='pt-6 px-24 divider-r' style={containerStyle} span={18}>
        {_.map(list, (field) => {
          return (
            <div key={field.label} className='tw-mb-4'>
              {renderGroupHeader(field)}
              <Row>
                {_.map(field.children, (item) => {
                  const key = item[fieldKey] as RawDataKey
                  const label = item[labelKey] as ReactNode
                  return (
                    <Col key={`${key}_${label}`} span={6}>
                      <Checkbox
                        checked={getCheckedState(key)}
                        onChange={() => toggleChecked(key)}
                      >
                        {label}
                      </Checkbox>
                    </Col>
                  )
                })}
              </Row>
            </div>
          )
        })}
      </Col>
      <Col style={containerStyle} span={6}>
        <header className='tw-flex headline'>
          {t('当前选定的字段')}
          <button
            className='tw-ml-auto clear-btn'
            type='button'
            onClick={clearChecked}
          >
            {t('清空已选')}
          </button>
        </header>
        <DraggableSortList
          className='tw-p-0'
          itemClassName='py-6 px-16'
          fieldKey='id'
          labelKey='label'
          list={selectedList}
          onRemove={removeChecked}
          onSortEnd={updateSelectedList}
        />
      </Col>
    </Row>
  )
}

export type { SelectedFieldsRef }
export default FieldSelectorPanel
