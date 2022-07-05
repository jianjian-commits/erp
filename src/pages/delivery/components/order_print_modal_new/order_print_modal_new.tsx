import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { TypeGroupRadio } from './groupItem'
import './../../style.less'
import {
  ListPrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import {
  Flex,
  Button,
  CheckboxGroup,
  Checkbox,
  Switch,
  Tip,
} from '@gm-pc/react'
import store from './store'
import { CustomerDeliveryOrder } from './customer_delivery_order'
import {
  orderTypeListsOrdinary,
  orderTypeLists,
  orderTemplateTypeLists,
  childType,
} from './enum'
import { ContentItem } from '@/pages/delivery/interface'

type PrintModalProps = {
  onHide(): void
  query?: string
  isConfig?: boolean // 是否为打印配置
  hasDriverPrintAuth?: boolean // 是否司机任务列表
  sortBy?: any // 字段排序方式
}

const OrderPrintModalNew: FC<PrintModalProps> = ({
  onHide,
  query,
  sortBy,
  isConfig,
  hasDriverPrintAuth,
}) => {
  const {
    templateList,
    modalTitle,
    printModalOptions: {
      orderType,
      deliveryType,
      printType,
      templateId,
      needPopUp,
      childTypeValue,
      showRise,
    },
    savePrintOptions,
    handleChangeParams,
  } = store

  const printTypeData: ContentItem[] = [
    { value: '1', label: t('整单打印'), disabled: false },
    {
      value: '2',
      label: t('拆单打印'),
      disabled: false,
      childRadios: [
        {
          value: childType.skuType,
          label: t('按商品类型拆分'),
        },
      ],
      sameLevel: (
        <Flex alignCenter className='gm-margin-top-5'>
          <span className='gm-margin-right-5 '>
            {t('单据抬头展示拆分类别名')}
          </span>
          <Switch
            checked={showRise}
            onChange={(e) => savePrintOptions('showRise', e)}
          />
        </Flex>
      ),
    },
  ]

  // 工具函数，用于判断是否是司机任务列表，返回打印单据选项
  function handleUtils() {
    if (!hasDriverPrintAuth) return orderTypeListsOrdinary
    return orderTypeLists
  }

  function fetchList() {
    const req = {
      type: PrintingTemplate_Type.TYPE_DELIVERY,
      paging: { limit: 999 },
      need_group_users: true,
    }
    // get 模板列表
    ListPrintingTemplate(req).then((json) => {
      const templateList = json.response.printing_templates
      const {
        printModalOptions: { templateId, deliveryType },
        savePrintOptions,
      } = store
      const defaultTemplate = templateList.find(
        (item) => item.printing_template_id === templateId,
      )
      if (!defaultTemplate) {
        const defaultTemplate_id =
          deliveryType === '3' ? 'company_config' : 'customer_config'
        savePrintOptions('templateId', defaultTemplate_id)
      }
      handleChangeParams('templateList', templateList)
      return null
    })
  }

  // 修改title
  const onChangeModalTitle = () => {
    const titleArr: string[] = []
    _.forEach(handleUtils(), (orderTypeItem) => {
      if (orderType.includes(orderTypeItem.value)) {
        titleArr.push(orderTypeItem.label)
      }
    })
    handleChangeParams('modalTitle', titleArr.join('、'))
  }

  useEffect(() => {
    onChangeModalTitle()
  }, [orderType])

  useEffect(() => {
    fetchList()
  }, [])

  // 去打印
  const goToPrint = () => {
    store.goToPrint(query, sortBy)
    onHide()
  }

  const onCHangeDeliveryType = (value: string) => {
    if (value === '1') {
      savePrintOptions('templateId', 'customer_config')
    } else if (value === '3') {
      savePrintOptions('templateId', 'company_config')
    }
    savePrintOptions('deliveryType', value)
  }

  // 点击打印 校验数据
  function handlePrint() {
    if (orderType.length === 0) {
      Tip.danger(t('请选择首列单据类型'))
      return
    }
    if (!templateId && deliveryType !== '2') {
      Tip.danger(t('请选择模板'))
      return
    }
    goToPrint()
  }

  // 渲染第三列内容
  function renderLevel3(deliveryType: string) {
    if (deliveryType !== '2') {
      // 商户打印或者账户打印，选择整单打印，列出对应模板
      return (
        <CustomerDeliveryOrder
          deliveryType={deliveryType}
          templateId={templateId}
          templateList={templateList}
          savePrintOptions={savePrintOptions}
        />
      )
    }
    return (
      <>
        <div className='gm-border-bottom gm-padding-bottom-5'>
          {t('商户明细模板(商户数据按单列展示)')}
        </div>
        <div className='gm-margin-top-15'>
          {t(
            '选择打印该模板，将不会同时打印商户配送单据。如有需要请分两次打印)',
          )}
        </div>
      </>
    )
  }

  return (
    <>
      <div
        style={{ display: 'flex', alignItems: 'center' }}
        className='gm-modal-title-wrap'
      >
        <div className='gm-modal-title'>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className='gm-text-16'>{t('打印模板配置')}</span>
            {modalTitle ? (
              <p style={{ margin: 0 }} className='gm-text-14 gm-margin-left-5'>
                {t(`已选单据类型: ${modalTitle}`)}
              </p>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
      <Flex column style={{ height: '480px', paddingBottom: '40px' }}>
        <Flex flex style={{ height: '100%' }}>
          <div className='order-modal-first-level gm-padding-15 gm-text-14 overflowY'>
            <CheckboxGroup
              name='orderType'
              className='gm-margin-top-5'
              value={orderType}
              onChange={(value) => {
                savePrintOptions('orderType', value)
              }}
            >
              {/* 立即执行函数 */}
              {(() => {
                const checkboxGuoupList = handleUtils()
                return _.map(checkboxGuoupList, (orderType) => (
                  <div className='gm-margin-bottom-20' key={orderType.value}>
                    <Checkbox value={orderType.value}>
                      {orderType.label}
                    </Checkbox>
                  </div>
                ))
              })()}
            </CheckboxGroup>
          </div>
          <div className='order-modal-second-level gm-padding-15 gm-text-14 gm-border-left overflowY'>
            <TypeGroupRadio
              title={t('单据类型')}
              name='delivery_type'
              value={deliveryType}
              contentList={orderTemplateTypeLists}
              onChange={onCHangeDeliveryType}
            />
            <TypeGroupRadio
              title={t('打印类型')}
              name='print_type'
              value={printType}
              childTypeValue={childTypeValue}
              contentList={printTypeData}
              onChange={(value) => {
                savePrintOptions('printType', value)
                savePrintOptions('showRise', false)
              }}
              onChildChange={(value) => {
                savePrintOptions('childTypeValue', value)
              }}
            />
          </div>
          <Flex
            flex
            column
            className='order-modal-third-level gm-padding-15 gm-text-14 gm-border-left gm-margin-top-5 overflowY'
          >
            {renderLevel3(deliveryType)}
          </Flex>
        </Flex>
        <Flex
          justifyBetween
          alignCenter
          className='gm-padding-left-15 gm-padding-right-15 gm-padding-top-5 gm-padding-bottom-5 gm-border-top gm-bg-white'
          style={{ position: 'absolute', bottom: '0', width: '100%' }}
        >
          {!isConfig ? (
            <Flex alignCenter>
              <Checkbox
                checked={needPopUp}
                onChange={() => {
                  savePrintOptions('needPopUp', !needPopUp)
                }}
              >
                {t('不再弹出该窗口')}&nbsp;&nbsp;
              </Checkbox>
              <p style={{ color: '#777777', margin: 0 }}>
                {t(
                  '下次按已保存的选择方式快捷打印 (可在列表[打印配置]中重新打开)',
                )}
              </p>
            </Flex>
          ) : (
            <div />
          )}
          <div>
            <Button className='gm-margin-right-15' onClick={onHide}>
              {t('取消')}
            </Button>
            <Button type='primary' onClick={!isConfig ? handlePrint : onHide}>
              {!isConfig ? t('保存并打印') : t('保存')}
            </Button>
          </div>
        </Flex>
      </Flex>
    </>
  )
}

export default observer(OrderPrintModalNew)
