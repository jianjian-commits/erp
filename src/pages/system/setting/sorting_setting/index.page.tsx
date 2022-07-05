import { t } from 'gm-i18n'
import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Radio,
  RadioGroup,
  Switch,
  Confirm,
  Tip,
  Select,
  Flex,
} from '@gm-pc/react'
import store from './store'
import {
  SortingSettings_SortingLockType,
  SortingSettings_SortingNumMethod,
} from 'gm_api/src/preference'

const lockPrintSort = [
  {
    text: '配送中',
    value: SortingSettings_SortingLockType.SORTINGLOCKTYPE_DELIVERYING,
  },
  {
    text: '已签收',
    value: SortingSettings_SortingLockType.SORTINGLOCKTYPE_RECEIVABLE,
  },
]

const SortingSetting = observer(() => {
  const {
    sorting_num_method,

    sorting_lock,
  } = store.sortingData

  const formRef = useRef(null)

  useEffect(() => {
    store.getSortingSettings()
  }, [])

  const handleChangeSortRule = (value: SortingSettings_SortingNumMethod) => {
    Confirm({
      title: t('提示'),
      children: (
        <div>
          <div>
            {t(
              '修改分拣序号规则后，新进入“分拣中”的订单将按新规则生成序号。是否确认修改？',
            )}
          </div>
          <div className='gm-text-red'>
            {t(
              '注意：如当前周期内已有订单按老规则生成序号，建议等当前周期作业结束后再更改',
            )}
          </div>
        </div>
      ),
    }).then(() => {
      return store.changeDataItem('sorting_num_method', value)
    })
  }

  const handleSave = () => {
    store.updateSortingSettings().then(() => {
      Tip.success(t('保存成功'))
      return store.getSortingSettings()
    })
  }

  return (
    <FormGroup formRefs={[formRef]} onSubmit={handleSave}>
      <FormPanel title={t('分拣设置')}>
        <Form
          onSubmit={handleSave}
          ref={formRef}
          labelWidth='166px'
          hasButtonInGroup
          disabledCol
        >
          <FormItem label={t('分拣序号生成规则')}>
            <RadioGroup
              name='sorting_num_method'
              value={sorting_num_method}
              onChange={(value) => handleChangeSortRule(value)}
            >
              <Radio
                value={SortingSettings_SortingNumMethod.SORTINGNUM_METHOD_ORDER}
              >
                {t('按订单生成分拣序号')}
              </Radio>
              <Radio
                value={SortingSettings_SortingNumMethod.SORTINGNUM_METHOD_ROUTE}
              >
                {t('按线路生成分拣序号')}
              </Radio>
            </RadioGroup>
            <div className='gm-text-desc gm-margin-top-5'>
              <p className='gm-margin-bottom-5'>
                {t(
                  '1. 选择按订单生成分拣序号，分拣序号从1开始递增，依次展现为1，2，3……',
                )}
              </p>
              <p>
                {t(
                  '2. 选择按路线生成分拣序号，在各条线路内，独立生成分拣序号，各线路不影响如：线路A-1、无线路-1',
                )}
              </p>
            </div>
          </FormItem>

          {/* <FormItem label={t('分拣任务信息展现')}>
            <RadioGroup
              name='show_res_custom_code'
              value={show_res_custom_code}
              onChange={(v) => store.changeDataItem('show_res_custom_code', v)}
            >
              <Radio value={0}>{t('优先商户名')}</Radio>
              <Radio value={1}>{t('优先商户自定义编码')}</Radio>
            </RadioGroup>
            <div className='gm-text-desc gm-margin-top-5'>
              <p className='gm-margin-bottom-5'>
                {t(
                  '优先商户名：站点内所有账号登录分拣软件，相应位置优先展示「商户名」，不展示「商户自定义编码」',
                )}
              </p>
              <p>
                {t(
                  '优先商户自定义编码：站点内所有账号登录分拣软件，相应位置优先展示「商户自定义编码」，如未设置自定义编码，则展示原商户名',
                )}
              </p>
            </div>
          </FormItem> */}
          <FormItem label={t('锁定分拣')}>
            <Switch
              type='primary'
              checked={!!sorting_lock}
              on={t('开启')}
              off={t('关闭')}
              onChange={(bool) => {
                let value =
                  SortingSettings_SortingLockType.SORTINGLOCKTYPE_UNSPECIFIED
                if (bool === false) {
                  value =
                    SortingSettings_SortingLockType.SORTINGLOCKTYPE_UNSPECIFIED
                } else {
                  value =
                    SortingSettings_SortingLockType.SORTINGLOCKTYPE_DELIVERYING
                }
                store.changeDataItem('sorting_lock', value)
              }}
            />
            <div className='gm-text-desc gm-margin-top-5 gm-margin-bottom-5'>
              <p>
                {t(
                  '开启后，订单状态为“配送中”或“已签收”后，订单中的商品称重信息不会被分拣软件修改',
                )}
              </p>
            </div>
            {sorting_lock !== 0 && (
              <Flex row alignCenter>
                <span>{t('订单进入')}</span>
                <Select
                  onChange={(value) =>
                    store.changeDataItem('sorting_lock', value)
                  }
                  data={lockPrintSort}
                  value={sorting_lock}
                  style={{ width: '80px' }}
                />
                <span>
                  {t('状态后，订单中的商品称重信息不会被分拣软件修改')}
                </span>
              </Flex>
            )}
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})

export default SortingSetting
