import React, { FC } from 'react'
import Add from '@/svg/selected_table_add.svg'
import styled from 'styled-components'

type Props = { className?: string }

const AddStyled = styled(Add)`
  color: var(--gm-color-primary);
  font-size: 16px;
  width: 25px;
  height: 25px;
  cursor: pointer;
`

const SelectedTableAdd: FC<Props> = (props) => {
  return <AddStyled {...props} />
}

export default SelectedTableAdd
