import React, { FC } from 'react'
import { observer } from 'mobx-react'
import store from '../../stores/detail_store'
import { Dialog, Flex } from '@gm-pc/react'
import { KCInput } from '@gm-pc/keyboard'

import { t } from 'gm-i18n'
import Big from 'big.js'

import PropTypes from 'prop-types'
import { TableXUtil } from '@gm-pc/table-x'

const { TABLE_X } = TableXUtil

interface Props {
  data: any
  index: number
}

const StdQuantityCell: FC<Props> = observer((props) => {
  const { index, data } = props
  const { remark } = data

  const handleQuantityChange = (value: string) => {
    const data = {
      remark: value,
    }
    store.changeProductDetailsItem(index, data)
  }

  return (
    <>
      <Flex alignCenter>
        <KCInput
          value={remark}
          maxLength={50}
          onChange={(e) => handleQuantityChange(e.target.value)}
          className='form-control input-sm'
          style={{ width: TABLE_X.WIDTH_NUMBER }}
        />
      </Flex>
    </>
  )
})

export default StdQuantityCell
