import React, { FC, ChangeEvent } from 'react'
import { t } from 'gm-i18n'
import {
  Input,
  Switch,
  Form,
  FormItem,
  RadioGroup,
  InputNumber,
  Radio,
  Flex,
} from '@gm-pc/react'
import styled from 'styled-components'
import { observer, Observer } from 'mobx-react'

import { AlgorithmFilter } from '../../interface'
import store from '../../store'

const PercentageStyled = styled.div`
  width: 35px;
  height: 30px;
  padding: 6px;
  background-color: #eeeeee;
`

interface AlgorithmSettingProps {
  showProductShowType?: boolean // 是否显示商品展示设置
}

const AlgorithmSetting: FC<AlgorithmSettingProps> = observer(
  ({ showProductShowType }) => {
    const { algorithmFilter } = store

    const handleFilterChange = <T extends keyof AlgorithmFilter>(
      key: T,
      value: AlgorithmFilter[T],
    ): void => {
      store.changeAlgorithmSetting(key, value)
    }

    return (
      <Form className='gm-margin-top-20' labelWidth='160px' disabledCol>
        <FormItem label={t('生产对象')}>
          <Observer>
            {() => {
              const { production_object } = algorithmFilter
              return (
                <Input
                  value={production_object}
                  placeholder={t('请输入商户名或账号名、账号KID查找')}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    handleFilterChange('production_object', e.target.value)
                  }
                  name='production_object'
                  style={{ width: '310px' }}
                />
              )
            }}
          </Observer>
        </FormItem>
        <FormItem label={t('日均下单数设置')}>
          <Observer>
            {() => {
              const { query_order_type, query_order_days } = algorithmFilter
              return (
                <RadioGroup
                  value={query_order_type}
                  onChange={(value) =>
                    handleFilterChange('query_order_type', value)
                  }
                  style={{ marginTop: query_order_type === 1 ? '0px' : '6px' }}
                >
                  <Radio value={1} className='gm-block'>
                    {t('人工填写天数，以此天数计算近期所有商品日均下单数')}
                    {query_order_type === 1 && (
                      <span className='gm-margin-left-20'>
                        {t('近')}
                        <InputNumber
                          min={1}
                          precision={0}
                          max={365}
                          value={query_order_days}
                          onChange={(value: number) =>
                            handleFilterChange('query_order_days', value)
                          }
                          name='query_order_days'
                          style={{ width: '150px', height: '30px' }}
                        />
                        {t('天')}
                      </span>
                    )}
                  </Radio>

                  <Radio value={2} className='gm-margin-top-5'>
                    {t('以各个商品的保质天数来计算各个商品日均下单数')}
                  </Radio>
                  <div className='gm-text-desc gm-margin-top-5'>
                    {t(
                      '根据填写的数值，系统自动拉取近xx日的下单商品数据，如选择人工填写天数则需要填写一个实际天数，如选择“以各个商品的保质天数来计算各个商品日均下单数”则无需填写天数，系统将自动根据商品的保质天数拉取下单商品数据，最长可查近365天的订单数据',
                    )}
                  </div>
                </RadioGroup>
              )
            }}
          </Observer>
        </FormItem>
        <FormItem label={t('调整比例')} style={{ width: '280px' }}>
          <Observer>
            {() => {
              const { adjust_ratio } = algorithmFilter
              return (
                <Flex>
                  <InputNumber
                    value={adjust_ratio}
                    min={1}
                    precision={0}
                    onChange={(value: number) =>
                      handleFilterChange('adjust_ratio', value)
                    }
                  />
                  <PercentageStyled>%</PercentageStyled>
                </Flex>
              )
            }}
          </Observer>
        </FormItem>
        <FormItem label={t('预计备货天数')}>
          <Observer>
            {() => {
              const { stock_up_type, stock_up_days } = algorithmFilter
              return (
                <RadioGroup
                  value={stock_up_type}
                  onChange={(value) =>
                    handleFilterChange('stock_up_type', value)
                  }
                  style={{ marginTop: stock_up_type === 1 ? '0px' : '6px' }}
                >
                  <Radio value={1} className='gm-block'>
                    {t('人工填写天数，以此天数作为预计备货天数')}
                    {stock_up_type === 1 && (
                      <span className='gm-margin-left-20'>
                        <InputNumber
                          value={stock_up_days}
                          min={1}
                          max={999}
                          onChange={(value: number) =>
                            handleFilterChange('stock_up_days', value)
                          }
                          style={{ width: '150px', height: '30px' }}
                        />
                        {t('天')}
                      </span>
                    )}
                  </Radio>

                  <Radio value={2} className='gm-margin-top-5'>
                    {t('以各个商品的保质天数来作为备货天数')}
                  </Radio>
                </RadioGroup>
              )
            }}
          </Observer>
          <div className='gm-text-desc gm-margin-top-5'>
            {t(
              '如选择人工填写天数则需要填写一个实际天数，如选择“以各个商品的保质天数来作为备货天数”则无需填写天数，系统将自动根据商品的保质天数作为其备货天数',
            )}
          </div>
        </FormItem>
        <FormItem label={t('是否扣减库存')}>
          <Observer>
            {() => {
              const { is_deduct_stock } = algorithmFilter
              return (
                <Switch
                  type='primary'
                  checked={!!is_deduct_stock}
                  on={t('扣减')}
                  off={t('不扣减')}
                  onChange={(value: boolean) =>
                    handleFilterChange('is_deduct_stock', value)
                  }
                />
              )
            }}
          </Observer>
          <div className='gm-text-desc gm-margin-top-5'>
            {t('如扣减成品库存后建议计划生产数小于0时，建议计划生产数展示为0')}
          </div>
        </FormItem>
        {showProductShowType && (
          <FormItem label={t('商品展示设置')}>
            <Observer>
              {() => {
                const { product_show_type } = algorithmFilter
                return (
                  <RadioGroup
                    value={product_show_type}
                    onChange={(value: number) =>
                      handleFilterChange('product_show_type', value)
                    }
                  >
                    <Radio value={1} className='gm-block'>
                      {t('仅展示建议计划生产数大于0的智能推荐商品')}
                    </Radio>
                    <Radio value={2}>{t('展示全部智能推荐商品')}</Radio>
                  </RadioGroup>
                )
              }}
            </Observer>
            <div className='gm-text-desc gm-margin-top-5'>
              {t(
                '若展示全部智能推荐商品，当扣减成品库存后建议计划生产数小于0，则建议计划生产数展示为0',
              )}
            </div>
          </FormItem>
        )}
      </Form>
    )
  },
)

export default AlgorithmSetting
