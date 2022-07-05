import { useCallback, useMemo } from 'react'
import { Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
// import { Observer, observer } from 'mobx-react'
// import globalStore from '@/stores/global'
// import { toJS } from 'mobx'
import { useMap, usePrevious } from 'react-use'
import { UpdateSkuShelf } from 'gm_api/src/merchandise'
import _ from 'lodash'

export interface IuseSelectShelfArgs {
  onSearch: () => any
  sku_id: string
  selected: string[]
}

const useSelectShelf = (args: IuseSelectShelfArgs) => {
  const { onSearch, sku_id, selected } = args
  const onSearch_ = usePrevious(onSearch)

  const [table, { set: set_ }] = useMap<
    {
      [k in string]: {
        shelf_selected: string[]
      }
    }
  >()

  const getRow = useCallback((id: string) => table[id], [table])

  const set = useCallback(
    (
      id: string,
      payload: {
        shelf_selected: string[]
      },
    ) => {
      const row = getRow(id)
      set_(id, {
        ...row,
        ...payload,
      })
    },
    [getRow, set_],
  )

  const cancel = useCallback(
    (id: string) => {
      set(id, {
        shelf_selected: [],
      })
    },
    [set],
  )

  const save = useCallback(
    (sku_id: string) => {
      const sku = getRow(sku_id) ?? {}
      const shelf_selected = sku?.shelf_selected ?? []
      if (shelf_selected.length === 0) {
        Tip.danger(t('默认货位设置为空， 请重新设置'))
        return false
      }

      return UpdateSkuShelf({
        sku_id,
        shelf_id: _.last(shelf_selected),
      }).then(() => {
        // eslint-disable-next-line no-unused-expressions
        onSearch_?.()
      })
    },
    [getRow, onSearch_],
  )

  // const SelectShelf = useMemo(() => {
  //   return (
  //     <Observer>
  //       {() => (
  //         <LevelSelect
  //           onSelect={(selected) => {
  //             set(sku_id, { shelf_selected: selected })
  //           }}
  //           selected={selected}
  //           data={toJS(globalStore.shelfListTree)}
  //         />
  //       )}
  //     </Observer>
  //   )
  // }, [selected, set, sku_id])

  return useMemo(() => {
    return {
      save,
      cancel,
      set,
      getRow,
      table,
      // SelectShelf,
    }
  }, [cancel, getRow, save, set, table])
}

export default useSelectShelf
