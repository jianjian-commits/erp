import React from 'react'
import styled from 'styled-components'
import { t } from 'gm-i18n'

const DelStyled = styled.div`
  background-color: #df4545;
  color: white;
  min-width: 45px;
  height: 18px;
  text-align: center;
  line-height: 18px;
  margin-right: 5px;
  border-radius: 5px;
  font-size: 12px;
`

const SupplierDeletedSign = () => {
  return <DelStyled>{t('已删除')}</DelStyled>
}

export default SupplierDeletedSign
