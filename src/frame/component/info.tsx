import React, { useState, useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { Flex, SessionStorage } from '@gm-pc/react'
import { Modal, Dropdown, Menu } from 'antd'
import globalStore from '@/stores/global'
import { observer } from 'mobx-react'
import { gmHistory } from '@gm-common/router'
import { ListGroup, UseGroup } from 'gm_api/src/oauth'
import { addGrayscale, logout } from '@/common/util'
import { setAccessToken } from '@gm-common/x-request'
import triangle_down from '@/img/triangle_down.png'
import _ from 'lodash'
import classNames from 'classnames'
import SwitchModal from './switch_modal/switch_modal'
import './style.less'
interface MoreItem {
  text: string
  onClick(): void
}

interface GroupMoreItem {
  name: string
  groupId: string
  onClick(): void
}

const { confirm } = Modal

const Avatar = (props: { name: string; url: string }) => {
  const { name, url } = props

  // 首字母大写
  const firstLetter = name.slice(0, 1)[0] && name.slice(0, 1)[0].toUpperCase()

  return (
    <Flex alignCenter justifyCenter className='b-framework-info-avatar'>
      {url ? (
        <img src={url} className='tw-block tw-w-full tw-h-full' />
      ) : (
        firstLetter
      )}
    </Flex>
  )
}

const ComInfo = observer(() => {
  const [visible, setVisible] = useState(false)
  const [groupList, setGroupList] = useState<
    { name: string; groupId: string }[]
  >([])

  function initGroupList() {
    ListGroup().then((res) => {
      const groups = _.map(res.response.groups || [], (group) => {
        return {
          name: group.name || '',
          groupId: group.group_id,
          onClick: () => switchGroup(group.group_id),
        }
      })
      setGroupList(groups)
    })
  }

  useEffect(() => {
    if (globalStore.isLite) {
      initGroupList()
    }
  }, [])

  const { userInfo, stationInfo } = globalStore
  const name = userInfo.group_user?.name || ''
  const username = userInfo.group_user?.username || ''
  const stationName = stationInfo.name

  const goPersonalCenter = () => {
    gmHistory.push('/personal_center')
  }
  const actionItems = [
    {
      key: 'bell',
      label: '消息',
      path: '/sync',
      hide: globalStore.isLite,
    },
    {
      key: 'application',
      label: '应用',
      path: '/application_center',
      hide: globalStore.isLite,
    },
    {
      key: 'set',
      label: '设置',
      path: '/system/setting/enterprise_information',
    },
  ]
  const goSystemLog = () => {
    gmHistory.push('/log')
  }

  function handleLogout() {
    confirm({
      autoFocusButton: null,
      title: i18next.t('提示'),
      content: i18next.t('请确认是否退出系统 ？'),
      onOk() {
        logout()
      },
    })
  }

  const removeOptionListFromStorage = (group_id: string) => {
    SessionStorage.remove(`permission_option_list_${group_id}`)
  }

  function switchGroup(groupId: string) {
    UseGroup({ group_id: groupId }).then((res) => {
      const token = res.response.access_token
      if (token) {
        setAccessToken(token)
        removeOptionListFromStorage(globalStore.userInfo.group_id || '')
        addGrayscale(groupId)
        window.location.href = window.location.href.replace(
          window.location.hash,
          '',
        )
      } else {
        logout()
      }
    })
  }

  const handleOpenModal = () => {
    setVisible(true)
  }

  const more = _.without(
    [
      { text: i18next.t('个人中心'), onClick: goPersonalCenter },
      !globalStore.isLite && {
        text: i18next.t('系统日志'),
        onClick: goSystemLog,
      },
      globalStore.isLite && {
        text: i18next.t('切换企业'),
        onClick: handleOpenModal,
      },
      {
        text: i18next.t('退出'),
        onClick: handleLogout,
      },
    ],
    false,
  )
  const menu = (
    <Menu>
      {_.map(more, (item: MoreItem) => {
        return (
          <Menu.Item onClick={item.onClick} key={item.text}>
            {item.text}
          </Menu.Item>
        )
      })}
    </Menu>
  )

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Flex>
      {actionItems.map(({ label, path, hide, key }) => {
        if (hide) return null
        return (
          <div
            key={key}
            className='b-framework-info-title-action'
            onClick={() => gmHistory.push(path)}
          >
            <span className={`b-framework-info-title-action-icon-${key}`} />
            <span className='b-framework-info-title-action-font'>{label}</span>
          </div>
        )
      })}
      <Dropdown
        overlay={menu}
        placement='bottomCenter'
        arrow
        overlayClassName='gm-info-dropdown'
      >
        <Flex className={classNames('tw-h-6 tw-rounded-full')}>
          <Avatar name={name} url='' />
          <Flex flex column justifyCenter className='b-framework-info-name'>
            <span>{stationName}</span>
            <span>
              {username}
              {name && `（${name}）`}
            </span>
          </Flex>
          <span className='b-framework-info-down'>
            <img src={triangle_down} />
          </span>
        </Flex>
      </Dropdown>

      {/* 切换企业弹框 */}
      <SwitchModal title='切换企业' visible={visible} onCancel={handleClose}>
        <div className='gm-switch-business-wrap'>
          {_.map(groupList, (item: GroupMoreItem, index: number) => {
            // 当前企业置顶
            if (item.groupId === globalStore.userInfo.group_id) {
              groupList.unshift(groupList.splice(index, 1)[0])
            }
            return (
              <span
                onClick={item.onClick}
                key={item.groupId}
                className='gm-switch-business-item'
              >
                <span>{item.name}</span>
                {item.groupId === globalStore.userInfo.group_id && (
                  <span className='gm-switch-business-item-group'>
                    {i18next.t('当前')}
                  </span>
                )}
              </span>
            )
          })}
        </div>
      </SwitchModal>
    </Flex>
  )
})

const Com = () => {
  return (
    <Flex alignCenter>
      <ComInfo />
    </Flex>
  )
}

export default React.memo(Com)
