import React, { FC } from 'react'
import Del from '@/svg/selected_table_del.svg'
import styled from 'styled-components'

const DelStyled = styled(Del)`
  color: var(--gm-color-danger);
  font-size: 16px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const SelectedTableDel: FC = () => {
  return <DelStyled />
}

export default SelectedTableDel
