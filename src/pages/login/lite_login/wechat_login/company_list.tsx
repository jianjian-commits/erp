import React, { FC } from 'react'
import { t } from 'gm-i18n'
import { Flex } from '@gm-pc/react'
import './style.less'
import { Group } from 'gm_api/src/enterprise'
import { UseGroup } from 'gm_api/src/oauth'
import { setAccessToken } from '@gm-common/x-request'
import { addGrayscale } from '@/common/util'

const Item: FC<{ group: Group }> = ({ group }) => {
  const handleClick = (group_id: string) => {
    UseGroup({ group_id }).then((res) => {
      const token = res.response.access_token
      if (token) {
        addGrayscale(group_id)
        setAccessToken(token)
      }
    })
  }
  return (
    <Flex
      alignCenter
      className='company-list-item gm-cursor'
      onClick={() => handleClick(group.group_id)}
    >
      <p>{group?.name || t('不知名企业')}</p>
    </Flex>
  )
}

const CompanyList: FC<{ data: Group[] }> = ({ data = [] }) => {
  return (
    <Flex column>
      <div className='company-list-title'>{t('选择企业进入')}</div>
      <Flex column className='company-list-container'>
        {data.map((group, index) => (
          <Item group={group} key={index} />
        ))}
      </Flex>
    </Flex>
  )
}

export default CompanyList
