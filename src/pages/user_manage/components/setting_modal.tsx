import React, { FC, useEffect, useState, useContext, useMemo } from 'react'
import { Modal, Switch } from 'antd'
import { Flex, ListDataItem, Select, Tip } from '@gm-pc/react'
import { t } from 'gm-i18n'
import globalStore from '@/stores/global'
import { SetFlag_Bool } from 'gm_api/src/common'
import { UpdateGroup, GetGroup, Group } from 'gm_api/src/enterprise'
import { ShowSettingContext } from './list'

const SettingModal: FC = () => {
  const [multiLogin, setMultiLogin] = useState<boolean>(false)
  const { showSetting, setShowSetting } = useContext(ShowSettingContext)
  const [group, setGroup] = useState<Group | null>(null)
  const [expiration, setExpiration] = useState<string>('0')

  useEffect(() => {
    if (showSetting) {
      const group_id = globalStore.userInfo.group_id
      GetGroup({ group_id }).then((res) => {
        const group = res.response.group
        setGroup(group)
        setExpiration(group.settings?.expiration || '0')
        const multi = group.settings?.multipoint_login
        if (multi === SetFlag_Bool.TRUE) {
          setMultiLogin(true)
        }
      })
    }
  }, [showSetting])

  const expirationList = useMemo<ListDataItem<string>[]>(
    () => [
      {
        value: '0',
        text: t('永不退出'),
      },
      {
        value: '30',
        text: t('30分钟'),
      },
      {
        value: '60',
        text: t('60分钟'),
      },
      {
        value: '90',
        text: t('90分钟'),
      },
      {
        value: '120',
        text: t('120分钟'),
      },
    ],
    [],
  )

  const handleOk = () => {
    if (group) {
      const result = multiLogin ? SetFlag_Bool.TRUE : SetFlag_Bool.FALSE
      group.settings = {
        ...group.settings,
        multipoint_login: result,
        expiration: expiration,
      }
      UpdateGroup({ group }).then(() => {
        Tip.success(t('保存成功'))
        setShowSetting(false)
      })
    }
  }
  return (
    <Modal
      visible={showSetting}
      onOk={handleOk}
      onCancel={() => setShowSetting(false)}
      okText={t('保存')}
      width={800}
    >
      <Flex column>
        <Flex justifyStart>
          <div style={{ width: 126 }}>{t('同一账号多处登录：')}</div>
          <div>
            <Switch
              checked={multiLogin}
              onChange={(e: boolean) => setMultiLogin(e)}
            />
            <div>{t('开启后，同一账号支持在多处登录，多处均支持操作；')}</div>
            <div>
              {t(
                '关闭后，同一账号不支持在多处登录，新登录的账号将会踢出之前登录的账号；',
              )}
            </div>
            <div>
              {t(
                '此设置仅针对PC电脑端，工位屏、司机APP、供应商小程序、采购小程序不受此影响。',
              )}
            </div>
          </div>
        </Flex>
        <Flex justifyStart className='gm-margin-top-15'>
          <div style={{ width: 126 }}>{t('无操作自动退出：')}</div>
          <div>
            <Select
              data={expirationList}
              value={expiration}
              onChange={(value) => {
                setExpiration(value)
              }}
            />
            <div>
              {t('选择永不退出，表示即使系统无任何操作也不会自动退出登录；')}
            </div>
            <div>
              {t('选择时间选项，表示在规定的时间无任何操作会自动退出登录。')}
            </div>
          </div>
        </Flex>
      </Flex>
    </Modal>
  )
}

export default SettingModal
