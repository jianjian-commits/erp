import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { MoreSelect, Flex, MoreSelectNormalDataOptions } from '@gm-pc/react'
import { Store } from './store'
import { sortBy } from 'lodash'
import getCategoryTree from './api'
import { toJS } from 'mobx'
import { CategoryFilterSingleOptions, SelectSingleOptions } from './types'

const store = new Store()

export const categoryFilterSingleHoc = (categoryApi: object) => {
  const CategoryPinLeiFilter: FC<CategoryFilterSingleOptions> = observer(
    ({ disablePinLei, selected, onChange }) => {
      useEffect(() => {
        async function initData() {
          await store.init(categoryApi)
        }
        initData()

        return () => {
          store.clear()
        }
      }, [])

      const handleSelect = (name: string, select: SelectSingleOptions) => {
        // 做个转换，组件如果没有选择则是null
        select = select || null

        let filter = selected
        switch (name) {
          case 'category1':
            filter = Object.assign({}, filter, {
              category1: select
                ? {
                    id: select.value,
                    name: select.text,
                    children: toJS(select.children),
                  }
                : null,
              category2: null,
              pinlei: null,
            })
            break
          case 'category2':
            filter = Object.assign({}, filter, {
              category2: select
                ? {
                    id: select.value,
                    name: select.text,
                    children: toJS(select.children),
                  }
                : null,
              pinlei: null,
            })
            break
          case 'pinlei':
            filter = Object.assign({}, filter, {
              pinlei: select
                ? {
                    id: select.value,
                    name: select.text,
                    children: toJS(select.children),
                  }
                : null,
            })
            break
        }
        onChange(filter)
      }

      const { categories } = store
      const { category1, category2, pinlei } = selected
      const oneList: any[] = categories
      let twoList: any[] = []
      let pinLeiList: any[] = []
      if (category1) {
        twoList = twoList.concat(category1.children?.slice())
      }
      if (category2) {
        pinLeiList = pinLeiList.concat(category2.children?.slice())
      }

      return (
        <div className='b-merchandise-common-filter'>
          <Flex>
            <MoreSelect
              data={sortBy(oneList.slice(), (v: { rank: string }) => v.rank)}
              selected={category1}
              onSelect={(value: MoreSelectNormalDataOptions<any>) =>
                handleSelect('category1', value)
              }
              placeholder={t('选择一级分类')}
              renderListFilterType='pinyin'
              className='gm-margin-right-10'
              style={{ flex: 1 }}
            />
            <MoreSelect
              data={sortBy(twoList.slice(), (v: { rank: string }) => v.rank)}
              selected={category2}
              onSelect={(value: MoreSelectNormalDataOptions<any>) =>
                handleSelect('category2', value)
              }
              placeholder={t('选择二级分类')}
              renderListFilterType='pinyin'
              className={classNames({
                'gm-margin-right-10': !disablePinLei,
              })}
              style={{ flex: 1 }}
            />
            {!disablePinLei && (
              <MoreSelect
                data={sortBy(
                  pinLeiList.slice(),
                  (v: { rank: string }) => v.rank,
                )}
                selected={pinlei}
                onSelect={(value: MoreSelectNormalDataOptions<any>) =>
                  handleSelect('pinlei', value)
                }
                placeholder={t('选择品类')}
                renderListFilterType='pinyin'
                className='gm-margin-right-10'
                style={{ flex: 1 }}
              />
            )}
          </Flex>
        </div>
      )
    },
  )

  return CategoryPinLeiFilter
}

export default categoryFilterSingleHoc(getCategoryTree)
