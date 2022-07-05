import React, { useEffect, useState, FC } from 'react'
import { t } from 'gm-i18n'
import { Select } from '@gm-pc/react'
import { Role_Type, ListGroupUser } from 'gm_api/src/enterprise'

interface PurchaserProps {
  selected: string
  onSelect: (selected: string) => void
}

const Purchaser: FC<PurchaserProps> = (props) => {
  function handleSelect(selected: string) {
    props.onSelect(selected)
  }
  const [purchasers, setPurchasers] = useState<any[]>([])

  useEffect(() => {
    ListGroupUser({
      role_types: [Role_Type.BUILT_IN_PURCHASER as number],
      paging: { limit: 999 },
    }).then((json) => {
      setPurchasers(
        (json.response?.group_users || []).map((v) => ({
          ...v,
          value: v.group_user_id,
          text: v.name,
        })),
      )
      return null
    })
  }, [])

  return (
    <Select
      data={[{ value: '', text: t('全部采购员') }, ...purchasers]}
      value={props.selected}
      onChange={handleSelect}
      placeholder={t('请选择采购员')}
    />
  )
}

export default Purchaser
