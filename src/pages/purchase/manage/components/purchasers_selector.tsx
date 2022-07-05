import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { MoreSelect } from '@gm-pc/react'
import { useAsync } from '@gm-common/hooks'
import _ from 'lodash'
import type { MoreSelectDataItem } from '@gm-pc/react'
import { GroupUser_Type, ListGroupUser, Role_Type } from 'gm_api/src/enterprise'

interface PurchasersSelectorProps {
  multiple?: boolean
  data?: MoreSelectDataItem<string>[]
  selected:
    | MoreSelectDataItem<string>[]
    | MoreSelectDataItem<string>
    | undefined
  onSelect(
    selected?: MoreSelectDataItem<string>[] | MoreSelectDataItem<string>,
  ): void
}
const PurchasersSelector: FC<PurchasersSelectorProps> = ({
  multiple = true,
  data,
  onSelect,
  selected,
}) => {
  const [purchasers, setpurchasers] = useState<MoreSelectDataItem<string>[]>([])

  function handleRequest() {
    return ListGroupUser({
      paging: { limit: 999 },
      need_roles: true,
    }).then((json) => {
      const relation = json.response.role_relation || {}
      const roles = json.response.roles || {}
      /**
       * @description 留下type=8管理员 type=9的是普通用户,取普通用户角色里是采购员的
       *
       * */
      const users = json.response.group_users.filter((user) => {
        if (user.type === GroupUser_Type.GROUP_ADMIN) {
          return true
        }
        if (user.type === GroupUser_Type.NORMAL) {
          const roleIds = relation[user.group_user_id]?.values || []
          for (const roleId of roleIds) {
            const role = roles[roleId]
            if (role.type === Role_Type.BUILT_IN_PURCHASER) {
              return true
            }
          }
        }
        return false
      })

      const purchaser_list = users.map((v) => ({
        ...v,
        value: v.group_user_id!,
        text: v.name!,
      }))
      purchaser_list.unshift({ value: '0', text: '无' } as any)
      setpurchasers(purchaser_list)
      return null
    })
  }
  const { run } = useAsync(() => handleRequest(), {
    cacheKey: 'purchasers',
  })

  useEffect(() => {
    if (!data) run()
  }, [])

  return (
    <MoreSelect
      multiple={multiple}
      data={data || purchasers}
      selected={selected}
      placeholder={t('选择采购员')}
      renderListFilterType='pinyin'
      onSelect={onSelect}
    />
  )
}

export default PurchasersSelector
