import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import classNames from 'classnames'
import './style.less'
import { getSettingConfig } from '@/frame/navigation'
import { Menu } from 'antd'
import setting_system from '@/img/setting_system.png'
const { SubMenu } = Menu

const SystemMenu = () => {
  const { pathname } = useLocation()

  return (
    <div className='gm-system-setting-wrap'>
      <div className='gm-system-setting-menu'>
        <div className='gm-system-setting-title'>
          <img src={setting_system} />
          <span className='gm-system-setting-title-font'>系统设置</span>
        </div>
        <Menu
          defaultSelectedKeys={['/system/setting/enterprise_information']}
          defaultOpenKeys={getSettingConfig()[0].sub.map((i) => i.link)}
          mode='inline'
          theme='dark'
        >
          {getSettingConfig()[0].sub.map((item) => {
            return (
              <SubMenu
                key={item.link}
                icon={<img src={item.icon} />}
                title={item.name}
              >
                {item.sub.map((sub) => {
                  return (
                    <Menu.Item key={sub.link}>
                      {/* 为了UI设计实现, 自己实现 active */}
                      <span
                        className={classNames('gm-system-setting-item-title', {
                          active: pathname.indexOf(sub.link) > -1,
                        })}
                      >
                        <Link to={sub.link}>{sub.name}</Link>
                      </span>
                    </Menu.Item>
                  )
                })}
              </SubMenu>
            )
          })}
        </Menu>
      </div>
    </div>
  )
}

export default SystemMenu
