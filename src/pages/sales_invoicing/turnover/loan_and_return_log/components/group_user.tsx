import React, { FC } from 'react'
import { observer } from 'mobx-react'
import { Role_Type } from 'gm_api/src/enterprise'
import { Select_GroupUser } from 'gm_api/src/enterprise/pc'
import { StockSheetInfo } from '../../interface'

interface Props {
  index: number
  updateSheetInfo: <T extends keyof StockSheetInfo>(
    index: number,
    key: T,
    value: StockSheetInfo[T],
  ) => any
  data: StockSheetInfo
}

const SheetStatus: FC<Props> = (props) => {
  const {
    index,
    updateSheetInfo,
    data: { driver_id, groupUserInfo, edit },
  } = props
  return (
    <>
      {edit ? (
        <Select_GroupUser
          value={driver_id!}
          params={{ role_types: [Role_Type.BUILT_IN_DRIVER] }}
          onChange={(value: string) =>
            updateSheetInfo(index, 'driver_id', value)
          }
        />
      ) : (
        groupUserInfo?.name || '-'
      )}
    </>
  )
}

export default observer(SheetStatus)
