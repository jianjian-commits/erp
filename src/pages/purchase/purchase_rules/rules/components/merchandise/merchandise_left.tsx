import React, { useRef } from 'react'
import { Flex } from '@gm-pc/react'
import { Input, Form, Empty, Cascader } from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import SVGRules from '@/svg/rules_search.svg'
import classNames from 'classnames'
import store from '../../store'
import { MerchandiseFilter } from '../../interface'
import { Sku } from 'gm_api/src/merchandise'

const MerchandiseLeft = () => {
  const {
    merchandiseList,
    merchandiseCount,
    chooseSku,
    setChoose,
    categoryData,
    setPaging,
    getMerchandiseList,
    more,
    setMerchandiseListFilter,
    refreshPaging,
    initMerchandiseTabs,
  } = store

  // 下拉加载节流事件
  const merchandiseRef = useRef(
    _.throttle(
      ({ scrollTop, clientHeight, scrollHeight, count, length, more }) => {
        if (
          scrollTop + clientHeight === scrollHeight &&
          count > length &&
          more
        ) {
          setPaging('merchandise')
          getMerchandiseList()
        }
      },
      500,
      {
        leading: true,
        trailing: true,
      },
    ),
  )

  const handleClick = (item: Sku) => {
    if (item.sku_id === chooseSku?.sku_id) return
    initMerchandiseTabs()
    setChoose({ type: 'merchandise', item })
  }
  const handleChange = (__: any, all: MerchandiseFilter) => {
    setMerchandiseListFilter(all)
    refreshPaging('merchandise')
    getMerchandiseList()
  }

  return (
    <>
      <div className='rules-list-left-filter'>
        <Form
          onValuesChange={_.debounce(handleChange, 500)}
          labelCol={{ span: 0 }}
          wrapperCol={{ span: 24 }}
        >
          <Form.Item name='q' className='tw-mb-2'>
            <Input
              placeholder={t('输入商品名')}
              autoComplete='off'
              allowClear
              suffix={<SVGRules style={{ fontSize: '18px' }} />}
            />
          </Form.Item>
          <Form.Item name='category_id' style={{ marginBottom: '0px' }}>
            <Cascader
              placeholder={t('请选择所属分类')}
              options={categoryData}
              expandTrigger='hover'
              changeOnSelect
              showSearch
            />
          </Form.Item>
        </Form>
      </div>
      <div
        onScroll={(e: any) => {
          const target = {
            scrollTop: e.target?.scrollTop,
            clientHeight: e.target.clientHeight,
            scrollHeight: e.target.scrollHeight,
            count: merchandiseCount,
            length: merchandiseList.length,
            more,
          }
          merchandiseRef.current(target)
        }}
        style={{ height: 'calc(100% - 140px)' }}
        className='rules-list-left-bottom'
      >
        {merchandiseList.length > 0 ? (
          _.map(merchandiseList, (item) => {
            return (
              <Flex
                onClick={() => handleClick(item)}
                alignCenter
                className={classNames(['bottom-item'], {
                  active: item.sku_id === chooseSku?.sku_id,
                })}
                key={item.sku_id}
              >
                <span>{item.name}</span>
              </Flex>
            )
          })
        ) : (
          <Empty description={t('暂无商品')} />
        )}
      </div>
      <Flex
        alignCenter
        justifyCenter
        className='rules-list-left-filter-absolute'
      >
        {t(`已设置规则的商品，共计${merchandiseCount}个`)}
      </Flex>
    </>
  )
}
export default observer(MerchandiseLeft)
