import * as React from 'react'
import { observer } from 'mobx-react'
import { Input } from '@gm-pc/react'

import { ProductDetailProps } from '../../stores/details_store'
import { DetailStore } from '../../stores/index'

interface Props {
  data: ProductDetailProps
  index: number
}

const RemarkCell: React.FC<Props> = observer((props) => {
  const { index, data } = props
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    DetailStore.changeProductDetailsItem(index, {
      remark: value,
    })
  }

  return <Input type='text' value={data.remark} onChange={onChange} />
})

export default RemarkCell
