import { t } from 'gm-i18n'
import React from 'react'
import styled from 'styled-components'
import { Flex } from '@gm-pc/react'

const Flag = styled(Flex)`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: solid 1px red;
  color: red;
`

const ByProductFlag = () => {
  return (
    <Flag alignCenter justifyCenter>
      {t('副')}
    </Flag>
  )
}

export default ByProductFlag
