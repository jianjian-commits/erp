import React from 'react'
import { TableList, TableListColumn } from '@gm-pc/business'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import { Space, Button, Tag, Modal, message, Popover } from 'antd'
import { t } from 'gm-i18n'
import store from '../store'
import _ from 'lodash'
import { Menu } from 'gm_api/src/merchandise'
import { Filters_Bool } from 'gm_api/src/common'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

const { confirm } = Modal
const ListV2 = observer(() => {
  const { menu_list, fetchMenuList, selected, setSelected, filter } = store
  const columns: TableListColumn<Menu>[] = [
    {
      Header: t('菜谱名称'),
      id: 'inner_name',
      accessor: 'inner_name',
      minWidth: 90,
      headerSort: true,
      Cell: (cellProps) => {
        // 缺id
        const { inner_name, is_default, menu_id } = cellProps.original
        return (
          <a
            href={`#/production/menu_manage/menu_list/menu_detail_student?menu_id=${menu_id}`}
          >
            {is_default === Filters_Bool.TRUE && (
              <Tag color='#108ee9'>{t('默认')}</Tag>
            )}
            {inner_name}
          </a>
        )
      },
    },
    {
      Header: t('菜谱ID'),
      id: 'serial_no',
      accessor: 'serial_no',
      headerSort: true,
      minWidth: 120,
    },
    {
      Header: t('对外简称'),
      id: 'outer_name',
      minWidth: 90,
      Cell: (cellProps) => {
        const { outer_name } = cellProps.original
        return (
          <Popover
            content={outer_name || '-'}
            placement='bottom'
            overlayStyle={{ width: '200px' }}
          >
            <span className='b-input-out-name'>{outer_name}</span>
          </Popover>
        )
      },
    },
    {
      Header: t('班级数'),
      id: 'class_count',
      accessor: 'class_count',
      minWidth: 90,
      headerSort: true,
      Cell: (cellProps) => {
        const { class_count } = cellProps.original
        return <>{class_count || '-'}</>
      },
    },
    {
      Header: t('天数'),
      id: 'day_count',
      accessor: 'day_count',
      minWidth: 90,
      headerSort: true,
      Cell: (cellProps) => {
        const { day_count } = cellProps.original
        return <>{day_count || '-'}</>
      },
    },
    {
      Header: t('描述'),
      id: 'description',
      minWidth: 90,
      Cell: (cellProps) => {
        const { description } = cellProps.original
        return (
          <Popover
            content={description || '-'}
            placement='bottom'
            overlayStyle={{ width: '200px' }}
          >
            <span className='b-input-out-name'>{description || '-'}</span>
          </Popover>
        )
      },
    },
    {
      Header: t('状态'),
      id: 'is_active',
      minWidth: 90,
      headerSort: true,
      Cell: (cellProps) => {
        const { is_active } = cellProps.original
        return (
          <>
            {is_active === Filters_Bool.TRUE ? (
              <Tag style={{ width: '50px', textAlign: 'center' }} color='green'>
                {t('启用')}
              </Tag>
            ) : (
              <Tag style={{ width: '50px', textAlign: 'center' }} color='#ccc'>
                {t('禁用')}
              </Tag>
            )}
          </>
        )
      },
    },
    {
      Header: t('操作'),
      id: 'action',
      minWidth: 90,
      Cell: (cellProps) => {
        const { is_active, is_default, menu_id } = cellProps.original
        return (
          <Space size='middle'>
            <a
              onClick={() =>
                window.open(
                  `#/production/menu_manage/menu_list/create_menu?menu_id=${menu_id}&__is_default=${is_default}`,
                )
              }
            >
              {t('编辑')}
            </a>
            {globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_MENU_ENABLE_DISABLE,
            ) && (
              <a onClick={() => changeState(menu_id, is_active!)}>
                {is_active === Filters_Bool.TRUE ? t('禁用') : t('启用')}
              </a>
            )}
            <a onClick={() => handleDetele(menu_id)}>{t('删除')}</a>
          </Space>
        )
      },
    },
  ]

  const handleDetele = (menu_id: string) => {
    confirm({
      title: t('删除'),
      icon: <ExclamationCircleOutlined />,
      content: t('确定删除此菜谱吗？'),
      onOk() {
        store.deleteMenu(menu_id).then(() => {
          message.success(t('删除成功'))
          store.updateFilter(store.filter)
        })
      },
    })
  }

  const changeState = (menu_id: string, is_active: Filters_Bool) => {
    confirm({
      title: is_active === Filters_Bool.TRUE ? t('禁用') : t('启用'),
      icon: <ExclamationCircleOutlined />,
      content: t(
        `确定${
          is_active === Filters_Bool.TRUE ? t('禁用') : t('启用')
        }此菜谱吗？`,
      ),
      onOk() {
        const active =
          is_active === Filters_Bool.TRUE
            ? Filters_Bool.FALSE
            : Filters_Bool.TRUE
        store.changeStateMenu(menu_id, active).then(() => {
          message.success(t('修改成功'))
          store.updateFilter(store.filter)
        })
      },
    })
  }

  const handleSaleStatus = () => {
    confirm({
      title: t('启用'),
      icon: <ExclamationCircleOutlined />,
      content: t('确定启用这些菜谱吗？'),
      onOk() {
        store.changeStateMoreMenu(Filters_Bool.TRUE).then(() => {
          message.success(t('启用成功'))
          setSelected([])
          store.updateFilter(store.filter)
        })
      },
    })
  }

  const handleForbiddenStatus = () => {
    confirm({
      title: t('禁用'),
      icon: <ExclamationCircleOutlined />,
      content: t('确定禁用这些菜谱吗？'),
      onOk() {
        store.changeStateMoreMenu(Filters_Bool.FALSE).then(() => {
          message.success(t('禁用成功'))
          setSelected([])
          store.updateFilter(store.filter)
        })
      },
    })
  }

  const handleMoreDelete = () => {
    confirm({
      title: t('删除'),
      icon: <ExclamationCircleOutlined />,
      content: t('确定删除这些菜谱吗？'),
      onOk() {
        store.deleteMoreMenu().then(() => {
          message.success(t('删除成功'))
          store.updateFilter(store.filter)
          setSelected([])
        })
      },
    })
  }

  const handleSelect = (selected: string[]) => {
    setSelected(selected)
  }

  return (
    <div className='menu-list-warp gm-site-card-border-less-wrapper-106'>
      <TableList
        className='category-table'
        id='menu_list'
        columns={columns}
        isUpdateEffect={false}
        service={fetchMenuList}
        data={menu_list}
        filter={filter}
        isDiy
        isSelect
        isHeaderSort
        paginationOptions={{
          paginationKey: 'menu_list',
          defaultPaging: { need_count: true },
        }}
        onSelect={handleSelect}
        selected={selected}
        keyField='menu_id'
        batchActionBar={
          <Flex>
            {globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_MENU_ENABLE_DISABLE,
            ) && (
              <Button
                disabled={selected.length === 0}
                onClick={handleSaleStatus}
                style={{ width: '80px' }}
              >
                {t('启用')}
              </Button>
            )}
            {globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_MENU_ENABLE_DISABLE,
            ) && (
              <Button
                disabled={selected.length === 0}
                onClick={handleForbiddenStatus}
                style={{ width: '80px', marginLeft: '20px' }}
              >
                {t('禁用')}
              </Button>
            )}

            {globalStore.hasPermission(
              Permission.PERMISSION_MERCHANDISE_DELETE_MENU,
            ) && (
              <Button
                disabled={selected.length === 0}
                onClick={handleMoreDelete}
                style={{ width: '80px', marginLeft: '20px' }}
              >
                {t('删除')}
              </Button>
            )}
          </Flex>
        }
      />
    </div>
  )
})
export default ListV2
