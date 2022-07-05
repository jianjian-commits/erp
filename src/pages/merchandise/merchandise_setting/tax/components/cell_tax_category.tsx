import React, { FC, useMemo } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import store from '../store'

interface Props {
  index: number
}

const TaxCategoryCell: FC<Props> = observer(({ index }) => {
  const item = store.skuList[index]
  const { finance_category_id } = item

  const parent = useMemo(
    () =>
      _.find(
        store.financeCategoryTree.slice(),
        (f) =>
          _.findIndex(
            f.children?.slice(),
            (c) => c.value === finance_category_id,
          ) !== -1,
      ),
    [finance_category_id],
  )

  const self = useMemo(
    () =>
      _.find(
        store.categories.slice(),
        (f) => f.finance_category_id === finance_category_id,
      ),
    [finance_category_id],
  )

  return (
    <div>
      {parent?.text || '-'}/{self?.name || '-'}
    </div>
  )
})

export default TaxCategoryCell
