import React, { useEffect, useState, useRef, useMemo } from 'react'
import { t } from 'gm-i18n'
import { Input, Empty } from 'antd'
import _ from 'lodash'
import { Flex } from '@gm-pc/react'
import { observer } from 'mobx-react'
import SVGRules from '@/svg/rules_search.svg'
import classNames from 'classnames'
import store, { initClientTableFilter } from '../../store'
import { Customer } from 'gm_api/src/enterprise'
const ClientLeft = () => {
  const {
    clientList,
    clientCount,
    chooseClient,
    setChoose,
    getClientList,
    setPaging,
    more,
    clientListFilter,
    setClientListFilter,
    refreshPaging,
    setClientTableFilter,
  } = store

  const clientRef = useRef(
    _.throttle(
      ({ scrollTop, clientHeight, scrollHeight, count, length, more }) => {
        if (
          scrollTop + clientHeight === scrollHeight &&
          count > length &&
          more
        ) {
          setPaging('client')
          getClientList()
        }
      },
      500,
      {
        leading: true,
        trailing: true,
      },
    ),
  )

  const handleSearch = useMemo(() => {
    return _.debounce((value) => {
      refreshPaging('client')
      getClientList({ q: value })
    }, 500)
  }, [])

  // 点击
  const handleClick = (item: Customer) => {
    if (item.customer_id === chooseClient.customer_id) return
    setClientTableFilter(initClientTableFilter)
    setChoose({ type: 'client', item })
  }

  return (
    <>
      <div className='rules-list-left-filter'>
        <Input
          onChange={(e) => {
            const value = e.target.value
            setClientListFilter('q', value)
            handleSearch(value)
          }}
          allowClear
          value={clientListFilter.q}
          placeholder={t('输入客户名')}
          suffix={<SVGRules style={{ fontSize: '18px' }} />}
        />
      </div>
      <div
        onScroll={(e: any) => {
          const target = {
            scrollTop: e.target?.scrollTop,
            clientHeight: e.target.clientHeight,
            scrollHeight: e.target.scrollHeight,
            count: clientCount,
            length: clientList.length,
            more,
          }
          clientRef.current(target)
        }}
        className='rules-list-left-bottom'
      >
        {clientList.length > 0 ? (
          _.map(clientList, (item) => {
            return (
              <Flex
                onClick={() => handleClick(item)}
                alignCenter
                className={classNames(['bottom-item'], {
                  active: item.customer_id === chooseClient.customer_id,
                })}
                key={item.customer_id}
              >
                <span>{item.name}</span>
              </Flex>
            )
          })
        ) : (
          <Empty description={t('暂无客户')} />
        )}
      </div>
      <Flex
        alignCenter
        justifyCenter
        className='rules-list-left-filter-absolute'
      >
        {t(`已设置规则的客户,共计${clientCount}个`)}
      </Flex>
    </>
  )
}
export default observer(ClientLeft)
