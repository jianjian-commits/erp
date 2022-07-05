import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import { Flex, MoreSelect } from '@gm-pc/react'
import store from './store'
import _ from 'lodash'
import getCategoryTree from './api'
import { CategoryFilterOptions, SelectSingleOptions } from './types'
import type { MoreSelectDataItem } from '@gm-pc/react'

export const categoryFilterHoc = (categoryApi: object) => {
  const CategoryPinLeiFilter: FC<CategoryFilterOptions> = observer(
    ({
      selected = {
        category1_ids: [],
        category2_ids: [],
        pinlei_ids: [],
      },
      disableCategory1,
      disableCategory2,
      disablePinLei,
      onChange = _.noop,
      ...res
    }) => {
      useEffect(() => {
        async function initData() {
          await store.init(categoryApi)
        }
        initData()

        return () => {
          store.clear()
        }
      }, [])

      const handleSelect = (name: string, select: SelectSingleOptions[]) => {
        // 做个转换，组件如果没有选择则是null
        select = select || []

        let filter = selected
        if (name === 'category1_ids') {
          filter = Object.assign({}, filter, {
            category1_ids: select,
            category2_ids: [],
            pinlei_ids: [],
          })
        } else if (name === 'category2_ids') {
          filter = Object.assign({}, filter, {
            category2_ids: select,
            pinlei_ids: [],
          })
        } else if (name === 'pinlei_ids') {
          filter = Object.assign({}, filter, {
            pinlei_ids: select,
          })
        }

        onChange(filter)
      }

      const { categories } = store
      let { category1_ids, category2_ids, pinlei_ids } = selected
      category1_ids = category1_ids ? category1_ids.slice() : []
      category2_ids = category2_ids ? category2_ids.slice() : []
      pinlei_ids = pinlei_ids ? pinlei_ids.slice() : []

      const oneList: any[] = categories
      let twoList: any[] = []
      let pinLeiList: any[] = []
      if (category1_ids.length > 0) {
        _.each(category1_ids, (value) => {
          twoList = twoList.concat(value.children?.slice())
        })
      }
      // 如果隐藏category1，显示category2，则twoList为categories每一项的children
      if (disableCategory1 && !disableCategory2) {
        _.each(categories, (value) => {
          twoList = twoList.concat(value.children?.slice())
        })
      }
      if (category2_ids.length > 0) {
        _.each(category2_ids, (value) => {
          pinLeiList = pinLeiList.concat(value.children?.slice())
        })
      }
      const sty = { width: '100%' }
      return (
        <Flex {...res}>
          {!disableCategory1 && (
            <Flex flex>
              <MoreSelect
                style={sty}
                key='category1_ids'
                selected={category1_ids}
                data={_.sortBy(
                  oneList.slice(),
                  (v: { rank: string }) => -v.rank,
                )}
                onSelect={(value: MoreSelectDataItem[]) =>
                  handleSelect('category1_ids', value)
                }
                placeholder={(!category1_ids.length && t('全部一级分类')) || ''}
                className='gm-margin-right-10'
                multiple
              />
            </Flex>
          )}
          {!disableCategory2 && (
            <Flex flex>
              <MoreSelect
                style={sty}
                key='category2_ids'
                selected={category2_ids}
                data={_.sortBy(
                  twoList.slice(),
                  (v: { rank: string }) => -v.rank,
                )}
                onSelect={(value: MoreSelectDataItem[]) =>
                  handleSelect('category2_ids', value)
                }
                placeholder={(!category2_ids.length && t('全部二级分类')) || ''}
                className={classNames({
                  'gm-margin-right-10': !disablePinLei,
                })}
                multiple
              />
            </Flex>
          )}
          {!disablePinLei && (
            <Flex flex>
              <MoreSelect
                style={sty}
                key='pinlei_ids'
                selected={pinlei_ids}
                data={pinLeiList.slice()}
                onSelect={(value: MoreSelectDataItem[]) =>
                  handleSelect('pinlei_ids', value)
                }
                placeholder={(!pinlei_ids.length && t('全部品类')) || ''}
                multiple
              />
            </Flex>
          )}
        </Flex>
      )
    },
  )

  return CategoryPinLeiFilter
}

export default categoryFilterHoc(getCategoryTree)
