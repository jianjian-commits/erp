import _ from 'lodash'
import { useReducer, useCallback, useRef } from 'react'
import { AnyObject, ValueInObject } from '../interface'
interface SelectedItem<RowDataKey> {
  id: RowDataKey
  label: string
}

interface SelectedState<RawDataKey = string> {
  selectedMap: Map<RawDataKey, string>
  list: SelectedItem<RawDataKey>[]
}

type Action<
  RawData extends AnyObject,
  RawDataKey extends ValueInObject<RawData>,
> =
  | {
      readonly type: 'initSelected'
      readonly value: RawData[]
    }
  | {
      readonly type: 'addItem'
      readonly id: RawDataKey
      readonly label: string
    }
  | {
      readonly type: 'removeItem'
      readonly id: RawDataKey
    }
  | {
      readonly type: 'clear'
    }
  | {
      readonly type: 'setList'
      readonly value: SelectedItem<RawDataKey>[]
    }

function initial<RawDataKey>(): SelectedState<RawDataKey> {
  return { list: [], selectedMap: new Map<RawDataKey, string>() }
}

function toList<RowDataKey>(mapValue: Map<RowDataKey, string>) {
  const list: SelectedItem<RowDataKey>[] = []
  mapValue.forEach((label, id) => {
    list.push({ label, id })
  })
  return list
}

function useSelected<
  RawData extends AnyObject,
  RawDataKey extends ValueInObject<RawData>,
>(fieldKey: keyof RawData, labelKey: keyof RawData) {
  /** 数据是否被操作过 */
  const isDirty = useRef(false)

  const setDirty = () => {
    isDirty.current = true
  }

  const resetDirty = useCallback(() => {
    isDirty.current = false
  }, [])

  const [state, dispatch] = useReducer(
    (
      state: SelectedState<RawDataKey>,
      action: Action<RawData, RawDataKey>,
    ): SelectedState<RawDataKey> => {
      switch (action.type) {
        case 'initSelected': {
          resetDirty()
          const selectedMap = new Map<RawDataKey, string>()
          _.forEach(action.value, (item) => {
            if (!_.isPlainObject(item)) return
            const id = item[fieldKey] as RawDataKey
            const label = item[labelKey]
            selectedMap.set(id, `${label}`)
          })
          return { list: toList<RawDataKey>(selectedMap), selectedMap }
        }
        case 'setList': {
          setDirty()
          const selectedMap = new Map<RawDataKey, string>()
          _.forEach(action.value, (item) => {
            selectedMap.set(item.id, state.selectedMap.get(item.id)!)
          })
          return { list: action.value, selectedMap }
        }
        case 'addItem': {
          setDirty()
          const selectedMap = new Map(state.selectedMap)
          selectedMap.set(action.id, action.label)
          return { list: toList(selectedMap), selectedMap }
        }
        case 'removeItem': {
          if (!state.selectedMap.has(action.id)) return state
          setDirty()
          const selectedMap = new Map(state.selectedMap)
          selectedMap.delete(action.id)
          return { list: toList(selectedMap), selectedMap }
        }
        case 'clear': {
          if (_.isEmpty(state.list) && _.isEmpty(state.selectedMap))
            return state
          setDirty()
          return initial()
        }
        default: {
          return state
        }
      }
    },
    undefined,
    initial,
  )

  const { list, selectedMap } = state

  const onInit = useCallback((value: RawData[]) => {
    dispatch({ type: 'initSelected', value })
  }, [])

  const setChecked = useCallback((id: RawDataKey, label: string) => {
    dispatch({ type: 'addItem', id, label })
  }, [])

  const removeChecked = useCallback((id: RawDataKey) => {
    dispatch({ type: 'removeItem', id })
  }, [])

  const getCheckedState = useCallback(
    (id: RawDataKey) => {
      return selectedMap.has(id)
    },
    [selectedMap],
  )

  const clearChecked = useCallback(() => dispatch({ type: 'clear' }), [])

  const updateSelectedList = useCallback(
    (value: SelectedItem<RawDataKey>[]) => {
      dispatch({ type: 'setList', value })
    },
    [],
  )

  return {
    selectedList: list,
    selectedMap,
    isDirty,
    onInit,
    setChecked,
    removeChecked,
    getCheckedState,
    clearChecked,
    resetDirty,
    updateSelectedList,
  }
}

export default useSelected
