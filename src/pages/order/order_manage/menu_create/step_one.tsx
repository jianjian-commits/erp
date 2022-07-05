import React, { FC, useRef, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import {
  FormGroup,
  FormPanel,
  Form,
  FormItem,
  Flex,
  MoreSelect,
  LoadingChunk,
} from '@gm-pc/react'
import store from './store'
import { CustomerWithSelectDataItem, MenuWithSelectDataItem } from './interface'
import { MoreSelect_QuotationV2 } from '@/common/components'
import { Quotation_Status, Quotation_Type } from 'gm_api/src/merchandise'
import { observer } from 'mobx-react'
import { history } from '@/common/service'
import moment from 'moment'
import QuotationDetailTable from '@/common/components/quotation_detail'
import { Filters_Bool } from 'gm_api/src/common'

// 先恶心着来
import quotationStore from '@/common/components/quotation_detail/store'

const StepOne: FC<{ next: () => void }> = ({ next }) => {
  const [loading, setLoading] = useState<boolean>(false)
  const formRef = useRef<Form>(null)

  const { menu, customers } = store.field
  const { menuCustomers } = store

  useEffect(() => {
    store.fetchCustomers()
  }, [])

  function handleSave() {
    setLoading(true)
    setTimeout(() => {
      store.setSelected(quotationStore.getSelectedMeals).then((json) => {
        next()
        return json
      })
    }, 0)
  }

  function handleCancel(): void {
    history.goBack()
  }

  function getName(outer_name: string, inner_name: string): string {
    if (outer_name === inner_name) return inner_name
    return `${outer_name}(${inner_name})`
  }

  function handleMenuClick(select: MenuWithSelectDataItem) {
    quotationStore.init()
    quotationStore.returnStep = false
    store.updateField('menu', select)
  }

  return (
    <LoadingChunk
      loading={loading}
      text={t('拼命加载中')}
      style={{ marginTop: `${loading && '40vh'}` }}
    >
      {!loading && (
        <FormGroup
          formRefs={[formRef]}
          onSubmit={handleSave}
          disabled={!menu || !quotationStore.getSelectedMeals.length}
          onCancel={handleCancel}
          saveText={t('下一步')}
        >
          <FormPanel title={t('选择客户与菜谱')}>
            <Form
              onSubmit={handleSave}
              ref={formRef}
              labelWidth='200px'
              colWidth='600px'
              hasButtonInGroup
            >
              <FormItem label={t('选择需要创建的菜谱')} required>
                <MoreSelect_QuotationV2
                  params={{
                    paging: { limit: 999 },
                    filter_params: {
                      quotation_type: Quotation_Type.WITH_TIME,
                      quotation_status: Quotation_Status.STATUS_VALID,
                    },
                  }}
                  style={{ width: '300px' }}
                  selected={menu}
                  onSelect={handleMenuClick}
                  getName={(item: any) =>
                    getName(item.outer_name, item.inner_name)
                  }
                  placeholder={t('选择菜谱')}
                  renderListFilterType='pinyin'
                />
              </FormItem>
              <FormItem label={t('选择需要创建订单的客户')}>
                {/** 可选客户跟着菜谱变，只需要绑定该菜谱的商户 */}
                <MoreSelect
                  className='gm-inline-block'
                  style={{ width: '300px' }}
                  data={menuCustomers.slice()}
                  multiple
                  selected={customers}
                  onSelect={(select: CustomerWithSelectDataItem[]): void =>
                    store.updateField('customers', select)
                  }
                  renderListItem={(item): string =>
                    `${item.name}(${item.customized_code})`
                  }
                  placeholder={t(
                    '选择需要下单的客户，不选则表示给全部客户下单',
                  )}
                  renderListFilterType='pinyin'
                />
                {!menuCustomers.length && menu && (
                  <div className='gm-inline-block gm-text-red gm-text-14 gm-margin-left-5'>
                    {t('当前没有绑定该菜谱的客户')}
                  </div>
                )}
              </FormItem>
            </Form>
          </FormPanel>
          <FormPanel title={t('选择商品')}>
            {menu?.value && (
              <>
                <Flex
                  className='gm-padding-10 gm-padding-left-20 gm-bg-info'
                  alignCenter
                >{`选择需要下单的菜品和餐次完成下单。当前菜谱生效时间${moment(
                  menu?.original.valid_start,
                ).format('MM月DD日')}~${moment(menu?.original.valid_end).format(
                  'MM月DD日',
                )}`}</Flex>
                <QuotationDetailTable
                  source='order'
                  // ref={tableRef}
                  quotation_id={menu.value}
                  menu_from_time={menu?.original.valid_start}
                  menu_to_time={menu?.original.valid_end}
                  valid_end={menu?.original.valid_end}
                  valid_begin={menu?.original.valid_start}
                />
              </>
            )}
          </FormPanel>
        </FormGroup>
      )}
    </LoadingChunk>
  )
}

export default observer(StepOne)
