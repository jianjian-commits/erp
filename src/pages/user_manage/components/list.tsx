import React, { FC, useState, createContext } from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Button, BoxTableProps, Flex } from '@gm-pc/react'
import { gmHistory as history } from '@gm-common/router'
import { TableXUtil, Table } from '@gm-pc/table-x'
import store from '../store'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import { GroupUser } from 'gm_api/src/enterprise'
import { isAdmin } from '@/common/util'
import Distribution from './houseWare_details'
import SettingModal from './setting_modal'

export const ShowSettingContext = createContext<any>(null)

interface ListProps extends Pick<BoxTableProps, 'pagination'> {
  refresh: () => Promise<any>
}

const List: FC<ListProps> = ({ refresh, pagination }) => {
  const [showSetting, setShowSetting] = useState<boolean>(false)
  const handleDelete = (id: string) => {
    store.delGroupUser(id).then(() => refresh())
  }
  const handleSetting = () => {
    setShowSetting(true)
  }
  return (
    <div>
      <ShowSettingContext.Provider value={{ showSetting, setShowSetting }}>
        <SettingModal />
      </ShowSettingContext.Provider>
      <BoxTable
        pagination={pagination}
        action={
          <Flex>
            <Button onClick={handleSetting} className='gm-margin-left-10'>
              {t('安全设置')}
            </Button>
            <Button
              type='primary'
              onClick={() => history.push('/user_manage/detail')}
              className='gm-margin-left-10'
            >
              {t('新建用户')}
            </Button>
          </Flex>
        }
      >
        <Table<GroupUser>
          data={store.list}
          columns={[
            { Header: t('登录账号'), accessor: 'username' },
            {
              Header: t('所属角色'),
              id: 'roleName',
              hide: globalStore.isLite,
              Cell: (props) => {
                const {
                  original: { group_user_id },
                } = props
                const rns = store.getRoleNamesByGroupUserId(group_user_id)

                return rns.join(' ') || '-'
              },
            },
            { Header: t('姓名'), accessor: 'name' },
            { Header: t('电话'), accessor: 'phone' },
            { Header: t('邮箱'), accessor: 'email', hide: globalStore.isLite },
            {
              Header: t('用户状态'),
              id: 'user_state',
              hide: globalStore.isLite,
              Cell: (props) => {
                const {
                  original: { is_valid },
                } = props
                return store.translateUserState(is_valid)
              },
            },
            {
              Header: t('归属仓库'),
              id: 'warehouse_ids',
              show: !globalStore.isLite,
              Cell: (props: any) => {
                const { warehouse_ids } = props.original
                return <Distribution warehouseIds={warehouse_ids} />
              },
            },
            {
              Header: TableXUtil.OperationHeader,
              width: 80,
              id: 'op',
              Cell: (cellProps) => {
                const { group_user_id, type } = cellProps.original
                // if (isAdmin(type)) return null
                return (
                  <TableXUtil.OperationCell>
                    {!globalStore.isLite && (
                      <TableXUtil.OperationDetail
                        href={`#/user_manage/detail?group_user_id=${group_user_id}`}
                      />
                    )}
                    {isAdmin(type) ? null : (
                      <TableXUtil.OperationDelete
                        title={t('确认删除')}
                        onClick={handleDelete.bind(null, group_user_id)}
                      >
                        {t('是否要删除该客户？')}
                      </TableXUtil.OperationDelete>
                    )}
                  </TableXUtil.OperationCell>
                )
              },
            },
          ]}
        />
      </BoxTable>
    </div>
  )
}

export default observer(List)
