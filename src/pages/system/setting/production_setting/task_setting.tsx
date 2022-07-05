import { t } from 'gm-i18n'
import React from 'react'
import {
  InputNumber,
  FormPanel,
  Form,
  FormItem,
  Select,
  Flex,
} from '@gm-pc/react'
import { Observer } from 'mobx-react'
import styled from 'styled-components'

import store from './store'
import { DEFAULT_ALGORITHM_SETTING } from './enum'
import RadioInputGroup from './radio_input_group'
import { ProcessData } from './interface'

const PercentageStyled = styled.div`
  width: 35px;
  height: 30px;
  padding: 6px;
  background-color: #eeeeee;
`

const TaskSetting = () => {
  const { is_algorithm_open } = store.productionConfig

  const handleChange = <T extends keyof ProcessData>(
    name: T,
    value: ProcessData[T],
  ) => {
    store.updateProcessData(name, value)
  }

  return (
    <FormPanel title={t('预生产/包装计划设置')}>
      <Form hasButtonInGroup labelWidth='130px' colWidth='850px'>
        <FormItem label={t('建议生产/包装数')}>
          <Observer>
            {() => {
              return (
                <Flex column>
                  <Select
                    data={DEFAULT_ALGORITHM_SETTING}
                    value={is_algorithm_open}
                    onChange={(value) =>
                      store.updateProcessData('is_algorithm_open', value)
                    }
                  />
                  <div className='gm-text-desc gm-margin-top-5'>
                    {t(
                      '设置公式后，在新建预生产/包装计划添加商品时，建议生产/包装数和计划生产/包装数将根据公式默认展示',
                    )}
                  </div>
                </Flex>
              )
            }}
          </Observer>
        </FormItem>
        {is_algorithm_open === 1 && (
          <FormItem label={t('1.算法说明')}>
            <div className='gm-text-bold gm-text-14 gm-padding-top-5'>
              {t('建议生产/包装数 = 日均下单数 x 调整比例 x 预计备货天数')}
            </div>
          </FormItem>
        )}
        {is_algorithm_open === 1 && (
          <FormItem label={t('公式说明')}>
            <div className='gm-padding-top-5'>
              {t(
                '基于填写的近xx日均下单数乘以调整比例，再乘以预计备货天数计算得出在当前备货天数下的建议计划生产数；',
              )}
            </div>
          </FormItem>
        )}
        {is_algorithm_open === 1 && (
          <FormItem label={t('示例')}>
            <div className='gm-padding-top-5'>
              {t(
                '如选择近3天的A商品的日均下单数为100斤，调整比例为80%，预计备5天的货，则计算出来的建议生产/包装数为100*80%*5=400斤。',
              )}
            </div>
          </FormItem>
        )}
        {is_algorithm_open === 1 && (
          <FormItem label={t('2.算法设置')}>
            <span> </span>
          </FormItem>
        )}
        {is_algorithm_open === 1 && (
          <FormItem label={t('日均下单数设置')}>
            <Observer>
              {() => {
                const {
                  avg_order_amount_setting,
                  avg_order_days,
                } = store.productionConfig

                return (
                  <RadioInputGroup
                    texts={[
                      {
                        value: 1,
                        text: t(
                          '人工填写天数，以此天数计算近期所有商品日均下单数',
                        ),
                        needInput: true,
                        inputOptions: {
                          inputMax: 365,
                          inputMin: 1,
                          inputValue: avg_order_days,
                          inputLabel: t('近'),
                        },
                      },
                      {
                        value: 2,
                        text: t('以各个商品的保质天数来计算各个商品日均下单数'),
                      },
                    ]}
                    currentValue={avg_order_amount_setting}
                    onRadioChange={(value) =>
                      handleChange('avg_order_amount_setting', value)
                    }
                    onInputChange={(value) =>
                      handleChange('avg_order_days', value)
                    }
                    info={t(
                      '根据填写的数值，系统自动拉取近xx日的下单商品数据，如选择人工填写天数则需要填写一个实际天数，如选择“以各个商品的保质天数来计算各个商品日均下单数”则无需填写天数，系统将自动根据商品的保质天数拉取下单商品数据，最长可查近365天的订单数据',
                    )}
                  />
                )
              }}
            </Observer>
          </FormItem>
        )}
        {is_algorithm_open === 1 && (
          <FormItem label={t('调整比例')} style={{ width: '280px' }}>
            <Observer>
              {() => {
                const { adjust_ratio } = store.productionConfig
                return (
                  <Flex>
                    <InputNumber
                      value={adjust_ratio}
                      min={1}
                      precision={0}
                      onChange={(value: number) => {
                        handleChange('adjust_ratio', value)
                      }}
                      name='adjust_ratio'
                      className='form-control'
                    />
                    <PercentageStyled>%</PercentageStyled>
                  </Flex>
                )
              }}
            </Observer>
          </FormItem>
        )}
        {is_algorithm_open === 1 && (
          <FormItem label={t('预计备货天数')}>
            <Observer>
              {() => {
                const { stock_up_type, stock_up_days } = store.productionConfig

                return (
                  <RadioInputGroup
                    texts={[
                      {
                        value: 1,
                        text: t('人工填写天数，以此天数作为预计备货天数'),
                        needInput: true,
                        inputOptions: {
                          inputMax: 999,
                          inputMin: 1,
                          inputValue: stock_up_days,
                        },
                      },
                      {
                        value: 2,
                        text: t('以各个商品的保质天数来作为备货天数'),
                      },
                    ]}
                    currentValue={stock_up_type}
                    onRadioChange={(value) =>
                      handleChange('stock_up_type', value)
                    }
                    onInputChange={(value) =>
                      handleChange('stock_up_days', value)
                    }
                    info={t(
                      '如选择人工填写天数则需要填写一个实际天数，如选择“以各个商品的保质天数来作为备货天数”则无需填写天数，系统将自动根据商品的保质天数作为其备货天数',
                    )}
                  />
                )
              }}
            </Observer>
          </FormItem>
        )}
        {/** 目前库存存在问题，数据不准确，先不做 */}
        {/* <FormItem label={t('是否扣减库存')}>
        <Observer>
          {() => {
            const { is_deduct_stock } = store.productionConfig
            return (
              <>
                <Switch
                  type='primary'
                  checked={!!is_deduct_stock}
                  on={t('扣减')}
                  off={t('不扣减')}
                  onChange={() =>
                    handleChange('is_deduct_stock', !is_deduct_stock)
                  }
                />
                <div className='gm-text-desc gm-margin-top-5'>
                  {t(
                    '如扣减成品库存后建议计划生产数小于0时，建议计划生产数展示为0',
                  )}
                </div>
              </>
            )
          }}
        </Observer>
      </FormItem> */}
      </Form>
    </FormPanel>
  )
}

export default TaskSetting
