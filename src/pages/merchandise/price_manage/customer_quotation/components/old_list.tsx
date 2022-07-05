import React, { FC, useEffect } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { observer } from 'mobx-react'
import store from '../store'
import {
  BoxTable,
  Flex,
  Button,
  BoxTableInfo,
  Tip,
  Dialog,
  Card,
} from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import { CardRow } from './sale_card'
import { groupByWithIndex } from '@/common/util'
import { QuotationProps } from '../types'
import { gmHistory as history } from '@gm-common/router'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'
import globalStore from '@/stores/global'

const CardList: FC = observer(() => {
  const { list } = store

  useEffect(() => {
    return () => store.initStore()
  }, [])

  const addEmptyContent = (cards: QuotationProps[]) => {
    const result = []
    if (cards && cards.length !== 0 && cards.length % 4 !== 0) {
      const addLength = 4 - (cards.length % 4)
      for (let i = 0; i < addLength; i++) {
        result.push(
          <Flex
            flex
            className='gm-padding-right-20 gm-padding-bottom-20'
            key={`empty${i}`}
          />,
        )
      }
    }
    return result
  }

  const handleButtonClick = (quotation_id: string) => {
    history.push(
      `/merchandise/price_manage/customer_quotation/list?quotation_id=${quotation_id}`,
    )
  }

  const handleSettingClick = (quotation_id: string) => {
    history.push(
      `/merchandise/price_manage/customer_quotation/menu?viewType=detail&quotation_id=${quotation_id}`,
    )
  }

  const handleDelete = (quotation_id: string) => {
    Dialog.render({
      title: t('删除报价单'),
      buttons: [
        {
          text: t('取消'),
          onClick: Dialog.hide,
        },
        {
          text: t('确定'),
          onClick: () => {
            store.deleteQuotation(quotation_id).then((json) => {
              Tip.success(t('删除成功'))
              store.getSaleList()
              Dialog.hide()
              return json
            })
          },
          btnType: 'primary',
        },
      ],
      children: t('确认删除？'),
    })
  }

  const templates = _.map(list, (v) => {
    return (
      <Flex
        key={`saleCard${v.quotation_id}`}
        className='gm-padding-right-20 gm-padding-bottom-20'
        style={{ width: '25%' }}
      >
        <Card
          key={v.quotation_id}
          className='b-menu-card gm-margin-right-20 b-salemenu-card'
          title={v.inner_name || ''}
          inactive={!v.is_active}
          topLabelText={v.is_active ? t('已激活') : t('未激活')}
          actions={_.without(
            [
              globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_UPDATE_QUOTATION,
              ) && {
                text: t('设置'),
                onClick: () => handleSettingClick(v.quotation_id),
              },
              globalStore.hasPermission(
                Permission.PERMISSION_MERCHANDISE_DELETE_QUOTATION,
              ) && {
                text: t('删除'),
                onClick: () => handleDelete(v.quotation_id),
              },
            ],
            false,
          )}
          onClick={() => handleButtonClick(v.quotation_id)}
        >
          <div className='b-card-ul'>
            <CardRow name={t('报价单ID')} content={v.serial_no || '-'} />
            <CardRow
              name={t('报价单简称（对外）')}
              content={v.outer_name || ''}
            />
            <CardRow name={t('在售商品数')} content={v.ssu_num || '-'} />
            <CardRow name={t('描述')} content={v.description || '-'} />
          </div>
        </Card>
      </Flex>
    )
  })

  const emptyTemplates = addEmptyContent(list)

  if (emptyTemplates.length > 0) {
    // @ts-ignore
    templates.push(emptyTemplates)
  }

  return (
    <BoxTable
      info={
        <BoxTableInfo>
          <TableTotalText
            data={[
              {
                label: t('报价单'),
                content: list.length,
              },
            ]}
          />
        </BoxTableInfo>
      }
      action={
        <PermissionJudge
          permission={Permission.PERMISSION_MERCHANDISE_CREATE_QUOTATION}
        >
          <Flex>
            <Button
              type='primary'
              onClick={() => {
                history.push(
                  '/merchandise/price_manage/customer_quotation/menu?viewType=create',
                )
              }}
            >
              {t('新建报价单')}
            </Button>
          </Flex>
        </PermissionJudge>
      }
    >
      <Flex
        column
        className='gm-padding-left-20 gm-padding-top-20 b-cards-border'
      >
        {list.length ? (
          _.map(
            groupByWithIndex(templates, (_value: any, i: number) =>
              parseInt(String(i / 4), 10),
            ),
            (value, i) => {
              return (
                <Flex flex={1} key={i}>
                  {value}
                </Flex>
              )
            },
          )
        ) : (
          <div className='gm-text-helper gm-margin-15'>
            {t('当前无相关报价单数据，请重新搜索')}
          </div>
        )}
      </Flex>
    </BoxTable>
  )
})

export default CardList
