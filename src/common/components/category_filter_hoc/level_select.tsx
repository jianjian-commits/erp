import React, { FC, useEffect } from 'react'
import { observer } from 'mobx-react'
import { LevelSelect } from '@gm-pc/react'
import store from './store'
import getCategoryTree from './api'
import { toJS } from 'mobx'
import { CategoryLevelSelectOptions } from './types'

export const categoryLevelSelectHoc = (categoryApi: object) => {
  const CategoryPinLeiFilter: FC<CategoryLevelSelectOptions> = observer(
    ({ selected, onChange }) => {
      useEffect(() => {
        async function initData() {
          await store.init(categoryApi)
        }
        initData()

        return () => {
          store.clear()
        }
      }, [])

      const handleSelect = (selected: string[]) => {
        onChange(selected)
      }

      const { categories } = store

      if (!categories.length) return '-'
      return (
        <LevelSelect
          data={toJS(categories)}
          onSelect={handleSelect}
          selected={selected}
        />
      )
    },
  )

  return CategoryPinLeiFilter
}

export default categoryLevelSelectHoc(getCategoryTree)
