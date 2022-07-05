import _ from 'lodash'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Fields, AnyObject, ValueInObject } from '../interface'
import useSelected from './use_selected'

export interface DataShape<RawData extends AnyObject> {
  list: Fields<RawData>[]
  selected: RawData[]
}

interface FetcherOptions<RawData extends AnyObject> {
  fieldKey: keyof RawData
  labelKey: keyof RawData
  fetcher: () => Promise<DataShape<RawData>>
}

function tree2Map<
  RawData extends AnyObject,
  RawDataKey extends ValueInObject<RawData>,
>(fieldKey: keyof RawData, value: Fields<RawData>[]) {
  const result = new Map<RawDataKey, RawData>()
  if (!_.isPlainObject) return result
  _.forEach(value, (item) => {
    _.forEach(item.children, (field) => {
      result.set(field[fieldKey] as RawDataKey, field)
    })
  })
  return result
}

function useFetcher<
  RawData extends AnyObject,
  RawDataKey extends ValueInObject<RawData>,
>(options: FetcherOptions<RawData>) {
  const { fieldKey, labelKey, fetcher } = options
  // 记录原始数据，id 为 key，数据为 value
  const data = useRef<Map<RawDataKey, RawData>>()

  const [list, setList] = useState<Fields<RawData>[]>()

  const {
    isDirty,
    resetDirty,
    selectedList,
    onInit,
    setChecked,
    removeChecked,
    getCheckedState,
    clearChecked,
    updateSelectedList,
  } = useSelected<RawData, RawDataKey>(fieldKey, labelKey)

  useEffect(() => {
    // 该值的作用是为了处理竞态请求而存在
    // 请求被重复执行时，则以最后一次请求的数据为准
    let isDiscarded = false
    fetcher().then((res) => {
      if (isDiscarded) return
      data.current = tree2Map<RawData, RawDataKey>(fieldKey, res.list)
      onInit(res.selected)
      setList(res.list)
    })
    return () => {
      isDiscarded = true
    }
  }, [fetcher, fieldKey, onInit])

  /** 已选字段列表（原数据） */
  const selectedFields = useMemo(() => {
    const result: RawData[] = []
    _.forEach(selectedList, (item) => {
      if (data.current?.has(item.id)) {
        result.push(data.current.get(item.id)!)
      }
    })
    return result
  }, [selectedList])

  /** 通过数据 key 值设置勾选状态，支持数组 */
  const handleChecked = useCallback(
    (key: RawDataKey | RawDataKey[]) => {
      const keyList = Array.isArray(key) ? key : [key]
      keyList.forEach((k) => {
        if (data.current?.has(k)) {
          const target = data.current?.get(k)!
          setChecked(k, `${target[labelKey]}`)
        } else {
          console.warn(`${k} 不存在`)
        }
      })
    },
    [labelKey, setChecked],
  )

  /** 切换勾选状态 */
  const toggleChecked = useCallback(
    (key: RawDataKey) => {
      if (getCheckedState(key)) {
        removeChecked(key)
      } else {
        handleChecked(key)
      }
    },
    [getCheckedState, handleChecked, removeChecked],
  )

  return {
    selectedList,
    list,
    setChecked: handleChecked,
    removeChecked,
    getCheckedState,
    toggleChecked,
    updateSelectedList,
    clearChecked,
    isDirty,
    resetDirty,
    selectedFields,
  }
}

export default useFetcher
