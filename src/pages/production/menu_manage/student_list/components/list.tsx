import React from 'react'
import { t } from 'gm-i18n'
import {
  BoxTable,
  Input,
  Flex,
  BoxTableInfo,
  Delete,
  Modal,
} from '@gm-pc/react'
import { TableXUtil, Column } from '@gm-pc/table-x'
import { TableList } from '@gm-pc/business'
import _ from 'lodash'
import { Button } from 'antd'
import { observer, Observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import store from '../store'
import Action from './action'
import CreateMealTimes from './create'
import { Menu_Period } from '../interface'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'
import EditMenu from './edit_menu'
// import { MToDate, dateTMM } from '@/common/util'
// import HeaderTip from '@/common/components/header_tip'

const { TABLE_X } = TableXUtil

const List = () => {
  const { menu_period } = store

  const handleUpdateListColumn = <T extends keyof Menu_Period>(
    index: number,
    key: T,
    value: Menu_Period[T],
  ) => {
    store.updateListColumn(index, key, value)
  }

  const handleCancel = (index: number) => {
    const { name, icon } = store.menu_period[index]
    handleUpdateListColumn(index, 'name', name)
    handleUpdateListColumn(index, 'icon', icon)
    Modal.hide()
  }

  const columns: Column[] = [
    {
      Header: t('序号'),
      id: 'index',
      width: TABLE_X.WIDTH_NO,
      Cell: (cellProps) => cellProps.index + 1,
    },
    {
      Header: t('餐次'),
      accessor: 'name',
      minWidth: 100,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const { name, isEditing, icon } = cellProps.original
              const index = cellProps.index
              if (!isEditing) {
                return (
                  <Flex alignCenter>
                    <img src={icon?.url} className='b_icon_size' />
                    <span className='gm-margin-left-5'>{name}</span>
                  </Flex>
                )
              }
              return (
                <div className='b-list-detail'>
                  <img src={icon?.url} className='b-list-icon b_icon_size' />
                  <Input
                    className='b-list-input'
                    value={name}
                    onClick={() => {
                      Modal.render({
                        title: t('餐次编辑'),
                        size: 'md',
                        children: (
                          <EditMenu
                            index={index}
                            onChange={handleUpdateListColumn}
                            onCancel={handleCancel}
                          />
                        ),
                        onHide: () => handleCancel(index),
                      })
                    }}
                  />
                </div>
              )
            }}
          </Observer>
        )
      },
    },

    {
      Header: t('操作'),
      accessor: 'operation',
      width: TABLE_X.WIDTH_SELECT,
      Cell: (cellProps) => {
        return (
          <Observer>
            {() => {
              const {
                index,
                original: { isEditing },
              } = cellProps

              return <Action index={index} isEditing={isEditing} />
            }}
          </Observer>
        )
      },
    },
  ]

  // 批量删除
  const handleDeleteMeal = () => {
    Delete({
      title: t('批量删除餐次'),
      children: (
        <>
          <div>{t('确定要删除所选餐次吗？')}</div>
          <div className='gm-text-red gm-padding-top-10'>
            <div>{t('1.如餐次在菜谱中应用,将无法删除！')}</div>
            <div>{t('2.删除后菜谱中引用的该餐次将不显示')}</div>
            <div>{t('3.删除后餐次相关数据将无法恢复，请谨慎操作')}</div>
          </div>
        </>
      ),
      read: true,
    }).then(() => {
      return store.batchDeleteMealTimes()
    })
  }
  const handleSelect = (selected: string[]) => {
    store.setSelected(selected)
  }

  return (
    <TableList
      className='category-table'
      service={store.fetchMealList}
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('餐次总数'),
                content: store.count,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={<CreateMealTimes />}
      paginationOptions={{
        paginationKey: 'meal_times_list',
        defaultPaging: { need_count: true },
      }}
      filter={store.create_or_batch_data}
      id='meal_times_list'
      keyField='menu_period_group_id'
      data={menu_period}
      isUpdateEffect={false}
      columns={columns}
      selected={store.selected}
      isSelect
      onSelect={handleSelect}
      batchActionBar={
        store.selected.length > 0 && (
          <Button style={{ width: '100px' }} onClick={handleDeleteMeal}>
            {t('删除餐次')}
          </Button>
        )
      }
    />
  )
}

export default observer(List)
