import {
  useEffect,
  useState,
  useRef,
  RefObject,
  useMemo,
  EffectCallback,
  DependencyList,
  useReducer,
  useCallback,
} from 'react'
import _ from 'lodash'
import { BASE_TABLE_REF_VALUE } from '@gm-pc/table-x'
import globalStore from '@/stores/global'
import { TableListInstance } from '@gm-pc/business'
import { LoadingFullScreen } from '@gm-pc/react'
import { t } from 'gm-i18n'
import { setTitle } from '@gm-common/tool'
import { doBatchPrint } from 'gm-x-printer'
import { useGMLocation } from '@gm-common/router'
import { setAccessToken, getAccessToken } from '@/common/util'

export const useBreadcrumbs = (breadcrumbs: string[]) => {
  useEffect(() => {
    const pre = globalStore.breadcrumbs.slice()

    globalStore.setBreadcrumbs(breadcrumbs)

    return () => {
      globalStore.setBreadcrumbs(pre)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export interface UseTableModalSelectedOptions<T> {
  selectKey: keyof T
  defaultSelectedData: string[]
  adapterDataFunc?: (data: T[]) => T[]
}

export interface UseTableModalSelectedResult<T> {
  selectedData: T[]
  unSelectedData: T[]
  onAdd: (data: T) => { selected: T[]; unSelected: T[] }
  onDel: (id: string | number) => { selected: T[]; unSelected: T[] }
  onChangeValue: (id: string, name: string, value: any) => void
}

interface ObjectKeyString {
  [key: string]: any
}

// 请保证data中含有defaultSelectedData的对应数据
export const useTableModalSelected = <T extends ObjectKeyString>(
  data: T[],
  selectOptions: UseTableModalSelectedOptions<T>,
): UseTableModalSelectedResult<T> => {
  const { defaultSelectedData, selectKey } = selectOptions

  const [selectedData, setSelectedData] = useState<T[]>([])
  const [unSelectedData, setUnSelectedData] = useState<T[]>([])

  const selectedFieldListRef = useRef<(number | string)[]>(defaultSelectedData)
  const keyRef = useRef(selectKey)
  const dataRef = useRef(data)
  const selectedRef = useRef(selectedData)

  keyRef.current = selectKey

  useEffect(() => {
    selectedRef.current = selectedData
  }, [selectedData])

  useEffect(() => {
    dataRef.current = _.cloneDeep(data)
    const { unSelected, selected } = getProcessData()
    setUnSelectedData(unSelected)
    setSelectedData(selected)
  }, [data])

  const getProcessData = () => {
    const unSelected: T[] = []
    const selected: T[] = []

    _.each(dataRef.current, (item) => {
      if (!selectedFieldListRef.current.includes(item[keyRef.current])) {
        unSelected.push({ ...item })
      } else {
        selected.push({ ...item })
      }
    })

    return { unSelected, selected }
  }

  const onAdd = (data: T) => {
    selectedFieldListRef.current.push(data[keyRef.current])

    const { unSelected, selected } = getProcessData()

    setSelectedData(selected)
    setUnSelectedData(unSelected)
    return { selected, unSelected }
  }

  const onDel = (id: string | number) => {
    selectedFieldListRef.current.splice(
      _.findIndex(selectedFieldListRef.current, (item) => id === item),
      1,
    )

    const { unSelected, selected } = getProcessData()
    setSelectedData(selected)

    setUnSelectedData(unSelected)
    return { selected, unSelected }
  }

  const onChangeValue = (id: string, name: keyof T, value: any) => {
    let find = false

    _.each(dataRef.current, (item) => {
      if (item[keyRef.current] === id) {
        item[name] = value
      }
    })

    setSelectedData((preSelected) => {
      _.each(preSelected, (item) => {
        if (item[keyRef.current] === id) {
          find = true
          item[name] = value
        }
      })

      return [...preSelected]
    })

    if (!find) {
      setUnSelectedData((preUnSelected) => {
        _.each(preUnSelected, (item) => {
          if (item[keyRef.current] === id) {
            find = true
            item[name] = value
          }
        })
        return [...preUnSelected]
      })
    }
  }

  return { selectedData, unSelectedData, onAdd, onDel, onChangeValue }
}

/**
 *  监听滚动自动加载，需要动态设置 ref 为最后一个item。
 *  原理是，监听最后的item，是否可见，可见时，触发loading
 *  tip: 默认初始化会自动请求一次
 * @param callBack 加载回调事件
 * @param ref 监听的元素
 */
export const useLoad = <T>(callBack: () => void, ref: RefObject<T>) => {
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    callBack()
  }, [])

  useEffect(() => {
    if (!ref.current) {
      return _.noop
    }

    const node: any = ref.current

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (loading) {
            callBack()
            setLoading(false)
          }
          observer.unobserve(node)
        } else {
          setLoading(true)
        }
      })
    })
    if (node != null) {
      observer.observe(node)
    }

    return () => {
      observer.disconnect()
    }
  }, [ref])
}

export interface UseGetLevelSelectedById<DataType> {
  data: DataType[]
  // 选中的叶子节点id
  selectedId?: string
  // DataType中作为id的key
  idKey: keyof DataType
  // DataType中作为parent_id的key
  parentIdKey: keyof DataType
  // 根节点id的标志 比如parent_id = '0' 代表根节点
  rootIdMark?: string
}
/**
 * @description: 由叶子节点找到取所有父节点
 * @return {string[]} 叶子节点到根节点的所有父节点id
 */
export const useGetLevelSelectedById = <DataType = ObjectKeyString>(
  props: UseGetLevelSelectedById<DataType>,
): string[] => {
  const { data, idKey, parentIdKey, selectedId, rootIdMark } = props
  const cacheMapIdToObject = useMemo(getMapIdToObject, [data])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ids = useMemo(
    () => getIds(selectedId),
    [selectedId, cacheMapIdToObject],
  )
  /**
   * @description: 获取叶子节点到根节点的所有父节点id，如selectedId为空，则返回空数组
   */
  function getIds(id?: string): string[] {
    // 如id为空或者字符串'0'（后端规定没有数据就是'0'），则返回空数组
    if (!id || id === '0') {
      return []
    }
    // 放入数组中
    const res = [id]
    // 找到id对应的DataType
    const target = cacheMapIdToObject[id]
    // 如果找到
    if (target) {
      // 获取其父id
      const targetParentId = target[parentIdKey] as unknown as string
      // 如果父id不是 根节点id的标志
      if (targetParentId !== rootIdMark) {
        // 将父id从左侧放入数组
        res.unshift(...getIds(targetParentId))
      }
    } else {
      return []
    }
    return res
  }
  /**
   * @description: 获取每个DataType的id到DataType的映射
   */
  function getMapIdToObject() {
    const mapIdToObject: { [k: string]: DataType } = {}
    data.forEach((item) => {
      const cacheKey = item[idKey] as unknown as string
      mapIdToObject[cacheKey] = item
    })
    return mapIdToObject
  }
  return ids
}

export function useBoolean(defaultValue?: boolean) {
  const [state, setstate] = useState(defaultValue || false)

  function setTrue(): void {
    setstate(true)
  }
  function setFalse(): void {
    setstate(false)
  }

  function toggle(): void {
    setstate((oldState) => !oldState)
  }

  return {
    state,
    toggle,
    setTrue,
    setFalse,
  }
}

export const useMount = () => {
  const isMountRef = useRef(false)

  if (!isMountRef.current) {
    isMountRef.current = true
    return false
  }
  return isMountRef.current
}
/**
 * @description: didMount后才执行的effect，加入isUpdateEffect作为开关控制
 */
export const useUpdateEffect = (
  effect: EffectCallback,
  dep?: DependencyList,
  isUpdateEffect = true,
) => {
  let isMount = useMount()
  if (!isUpdateEffect) {
    isMount = true
  }
  useEffect(() => {
    if (isMount) {
      return effect()
    }
  }, dep)
}

export const useTableListRef = () => {
  const tableListRef = useRef<TableListInstance>({
    ...BASE_TABLE_REF_VALUE,
    refresh: _.noop,
  } as unknown as TableListInstance)
  return tableListRef
}

// 分享打印start
interface Query {
  token: string
  authorization: string
}
/**
 * @description: 分享打印的公共hook
 * @param {*} 获取列表的请求方法，会回传一个token给接口
 */
export const useSharePrint = <T>(shareFn: (token: string) => Promise<T[]>) => {
  const location = useGMLocation<Query>()

  async function printData() {
    LoadingFullScreen.render({
      size: '100px',
      text: t('正在加载数据，请耐心等待!'),
    })
    const { token, authorization } = location.query
    // 获取原来的token
    const originToken = getAccessToken()
    // 换为url带过来的分享token
    setAccessToken(authorization)
    // 获取unit
    await globalStore.fetchUnitList()
    // 调用接单，会回传token
    shareFn(token)
      .then((list) => {
        // 方法必须return一个用于打印的列表
        doBatchPrint(list)
      })
      .finally(() => {
        // 最后关闭loading
        LoadingFullScreen.hide()
        // 还原为原来的token
        setAccessToken(originToken)
      })
  }

  async function run() {
    await printData()
  }
  useEffect(() => {
    setTitle(t('打印'))
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
// 分享打印end

// 针对依赖单个筛选值，只在首次加载请求一次，不随着筛选值得变动而变动
export const useEffectOnce = <T>(run: Function | null, value: T) => {
  const [isFirst, setIsFirst] = useState(true)

  useEffect(() => {
    if (!!value && isFirst) {
      run && run()
      setIsFirst(false)
    }
  }, [value, isFirst])
}

export interface ControllableValueOptions<T> {
  defaultValue?: T
  defaultValuePropName?: string
  valuePropName?: string
  trigger?: string
}

export function useControllableValue<T>(
  props: Record<string, any>,
  options?: ControllableValueOptions<T>,
) {
  const {
    defaultValue,
    defaultValuePropName = 'defaultValue',
    valuePropName = 'value',
    trigger = 'onChange',
  } = options || {}

  const value = props[valuePropName] as T
  const isControlled = valuePropName in props

  const initialValue = useMemo(() => {
    if (isControlled) {
      return value
    }
    if (defaultValuePropName in props) {
      return props[defaultValuePropName]
    }
    return defaultValue
  }, [])

  const stateRef = useRef<T>(initialValue as T)
  if (isControlled) {
    stateRef.current = value
  }

  const [, forceUpdate] = useReducer((x) => x + 1, 0)

  const handle = useRef<(...args: unknown[]) => void>(props[trigger])
  handle.current = props[trigger]

  const setState = useCallback(
    (v: T, ...args: unknown[]) => {
      if (!isControlled) {
        stateRef.current = v
        forceUpdate()
      }
      if (typeof handle.current === 'function') {
        handle.current(v, ...args)
      }
    },
    [isControlled],
  )
  return [stateRef.current, setState] as const
}
