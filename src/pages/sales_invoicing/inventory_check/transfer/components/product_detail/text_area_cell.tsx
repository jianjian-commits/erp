import React, { FC } from 'react'
import { observer } from 'mobx-react'

interface Props {
  data: any
  field: string
}

const TextAreaCell: FC<Props> = observer((props) => {
  const { data, field } = props
  let classText = data[field]

  if (field === 'category') {
    classText = data.category_name_2
      ? data.category_name_1 + '/' + data.category_name_2
      : '-'
  }

  return <span>{classText || '-'}</span>
})

export default TextAreaCell
