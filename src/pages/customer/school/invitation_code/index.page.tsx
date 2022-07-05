import React, { FC } from 'react'
import { observer } from 'mobx-react'
import Filter from './components/filter'
import Codes from './components/codes'

const InvitationCode: FC = observer(() => {
  return (
    <>
      <Filter />
      <Codes />
    </>
  )
})

export default InvitationCode
