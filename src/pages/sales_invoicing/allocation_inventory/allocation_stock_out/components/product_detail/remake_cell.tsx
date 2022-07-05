import { Input } from '@gm-pc/react'
import { observer } from 'mobx-react'
import * as React from 'react'
import store, { PDetail } from '../../stores/receipt_store'

interface Props {
  data: PDetail
  index: number
}

const RemarkCell: React.FC<Props> = observer((props) => {
  const { index, data } = props
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    store.changeProductDetailsItem(index, {
      remark: value,
    })
  }

  return (
    <Input maxLength={50} type='text' value={data.remark} onChange={onChange} />
  )
})

export default RemarkCell