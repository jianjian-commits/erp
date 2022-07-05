import { t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { BoxTable, BoxTableInfo, Tip, Flex, Tooltip } from '@gm-pc/react'
import { Button } from 'antd'
import { Table, TableXUtil } from '@gm-pc/table-x'
import qs from 'query-string'
import _ from 'lodash'
import { observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import moment from 'moment'
import { GroupUser, Permission } from 'gm_api/src/enterprise'
import {
  ListPrintingTemplate,
  DeletePrintingTemplate,
  UpdatePrintingTemplate,
  PrintingTemplate,
  PrintingTemplate_Type,
  map_PrintingTemplate_TemplateProductionType,
  map_PrintingTemplate_TemplateDeliveryType,
} from 'gm_api/src/preference'
import PermissionJudge from '@/common/components/permission_judge'
import globalStore from '@/stores/global'
import NewCreateTemplate from './new_create_template'
import { templateTypObj } from './enum'
import { useMount } from 'react-use'

interface TemplateList {
  setSupplierTemplate?: boolean // 是否有供应商模板
  /** 模版type */
  type: PrintingTemplate_Type
  /** 新建url，详情url */
  url: string //
  /** xx模版列表 */
  panelTitle: string //
  /** 设置商户的回调 */
  handleCustomerSetting?: (item) => void
  /** 是否显示设置模版列 */
  setDefaultTemplate?: boolean
  /** 模板了类型的提示 */
  templateTypeTip?: string
  /** 新建模板的类型 */
  templateList?: Record<'value' | 'text', number | string>[]
  /** url副本 新建模板的下拉框 */
  urlTranscript?: Record<string, string>
}

const TemplateList: FC<TemplateList> = observer(
  ({
    handleCustomerSetting,
    type,
    url,
    panelTitle,
    setDefaultTemplate,
    setSupplierTemplate,
    templateTypeTip,
    templateList,
    urlTranscript,
  }) => {
    const [list, setList] = useState<PrintingTemplate[]>([])
    const [groupUsers, setGroupUsers] = useState<{ [key: string]: GroupUser }>()
    const fetchList = () => {
      const req = { type, paging: { limit: 999 }, need_group_users: true }
      ListPrintingTemplate(req).then((json) => {
        setList(json.response.printing_templates)
        setGroupUsers(json.response.group_users!)
        return null
      })
    }

    const handleDel = (id: string) => {
      DeletePrintingTemplate({ printing_template_id: id }).then(() => {
        fetchList()
        Tip.success(t('删除成功'))
        return null
      })
    }
    const handleSetDefault = (index: number) => {
      const req = { printing_template: { ...list[index], is_default: true } }
      UpdatePrintingTemplate(req).then(() => fetchList())
    }

    const handleSetSupplierDefault = (index: number) => {
      const req = {
        printing_template: { ...list[index], is_supplier_default: true },
      }
      UpdatePrintingTemplate(req).then(() => fetchList())
    }

    useMount(fetchList)

    const getRealUrl = (
      template_delivery_type: number | undefined,
      template_production_type: number | undefined,
      template_id: string,
    ) => {
      const tempID = qs.stringify({
        template_id: template_id,
      })
      if (type === PrintingTemplate_Type.TYPE_DELIVERY) {
        // 配送单下面有商户配送单 和 账户配送单，意味着两个url
        return urlTranscript?.[template_delivery_type ?? 1] + `?${tempID}`
      }
      if (type === PrintingTemplate_Type.TYPE_PRODUCTION) {
        // 生产单据
        return urlTranscript?.[template_production_type ?? 1] + `&${tempID}`
      }
      return url + `?${tempID}`
    }

    const tableInfo = [{ label: panelTitle, content: list.length }]
    return (
      <>
        <BoxTable
          headerProps={{ style: { backgroundColor: '#fff' } }}
          info={
            <BoxTableInfo>
              <TableTotalText data={tableInfo} />
            </BoxTableInfo>
          }
          action={
            <PermissionJudge
              permission={
                Permission.PERMISSION_PREFERENCE_CREATE_PRINTING_TEMPLATE
              }
            >
              {/* 新建模板旁边的下拉框 */}
              {urlTranscript && templateList ? (
                <NewCreateTemplate
                  url={url}
                  templateList={templateList}
                  urlTranscript={urlTranscript}
                />
              ) : (
                <Button
                  type='primary'
                  onClick={() => {
                    window.location.href = url
                  }}
                >
                  {t('新建模板')}
                </Button>
              )}
            </PermissionJudge>
          }
        >
          <Table<PrintingTemplate>
            data={list.slice()}
            columns={[
              {
                Header: t('创建时间'),
                accessor: 'create_time',
                Cell: ({ original }) => {
                  return moment(+original.create_time!).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )
                },
              },
              {
                Header: t('模板名称'),
                accessor: 'name',
              },
              {
                Header: (
                  <Flex alignCenter>
                    {t('模板类型')}
                    {templateTypeTip && (
                      <Tooltip
                        popup={
                          <div className='gm-padding-5'>{templateTypeTip}</div>
                        }
                      />
                    )}
                  </Flex>
                ),
                show:
                  type === PrintingTemplate_Type.TYPE_DELIVERY ||
                  type === PrintingTemplate_Type.TYPE_PRODUCTION,
                accessor: 'is_default',
                Cell: (cellProps) => {
                  const {
                    original: {
                      template_delivery_type,
                      template_production_type,
                    },
                  } = cellProps

                  return type === PrintingTemplate_Type.TYPE_PRODUCTION
                    ? map_PrintingTemplate_TemplateProductionType[
                        template_production_type!
                      ]
                    : templateTypObj[type][+template_delivery_type! - 1] || '-'
                },
              },
              {
                Header: t('打印规格'),
                accessor: 'paper_size',
              },
              {
                Header: t('客户配置'),
                show:
                  _.isFunction(handleCustomerSetting) &&
                  type === PrintingTemplate_Type.TYPE_DELIVERY,
                accessor: (item) => (
                  <a
                    onClick={() =>
                      handleCustomerSetting && handleCustomerSetting(item)
                    }
                  >
                    {t('点击配置')}
                  </a>
                ),
              },
              {
                Header: t('商户配置'),
                id: 'customer_setting',
                show:
                  _.isFunction(handleCustomerSetting) &&
                  type === PrintingTemplate_Type.TYPE_SORTING,
                accessor: (item) => (
                  <a
                    onClick={() =>
                      handleCustomerSetting && handleCustomerSetting(item)
                    }
                  >
                    {t('点击设置')}
                  </a>
                ),
              },
              {
                Header: t('默认模板'),
                show: setDefaultTemplate,
                id: 'is_default',
                Cell: (cellProps) => {
                  const {
                    is_default,
                    template_delivery_type,
                    template_production_type,
                  } = cellProps.original

                  if (is_default) {
                    let typTitle = ''
                    switch (type) {
                      case PrintingTemplate_Type.TYPE_PRODUCTION:
                        typTitle =
                          map_PrintingTemplate_TemplateProductionType[
                            template_production_type!
                          ]
                        break
                      case PrintingTemplate_Type.TYPE_DELIVERY:
                        typTitle =
                          map_PrintingTemplate_TemplateDeliveryType[
                            template_delivery_type!
                          ]
                        break
                    }

                    return typTitle
                      ? `${t('默认') + '（' + typTitle + '）'}`
                      : t('默认')
                  }

                  return (
                    <div className='b-order-printer-hover-wrap'>
                      <a
                        onClick={() => handleSetDefault(cellProps.index)}
                        className='b-order-printer-hover-col'
                      >
                        {t('设为默认')}
                      </a>
                    </div>
                  )
                },
              },
              {
                Header: t('供应商模板'),
                show: Boolean(setSupplierTemplate),
                hide: globalStore.isLite,
                id: 'is_supplier_default',
                Cell: (cellProps) => {
                  const { is_supplier_default } = cellProps.original
                  if (is_supplier_default) {
                    return t('默认')
                  }

                  return (
                    <div className='b-order-printer-hover-wrap'>
                      <a
                        onClick={() =>
                          handleSetSupplierDefault(cellProps.index)
                        }
                        className='b-order-printer-hover-col'
                      >
                        {t('设为默认')}
                      </a>
                    </div>
                  )
                },
              },
              {
                Header: t('创建人'),
                id: 'creator_group_user_id',
                accessor: (item) =>
                  (groupUsers &&
                    groupUsers[item.creator_group_user_id!]?.name) ||
                  '',
              },
              {
                width: 80,
                id: 'operation',
                Header: TableXUtil.OperationHeader,
                Cell: (props) => (
                  <TableXUtil.OperationCell>
                    <TableXUtil.OperationDetail
                      href={getRealUrl(
                        props.original?.template_delivery_type,
                        props.original?.template_production_type,
                        props.original.printing_template_id,
                      )}
                    />
                    {!props.original.is_default && (
                      <TableXUtil.OperationDelete
                        disabled={
                          !globalStore.hasPermission(
                            Permission.PERMISSION_PREFERENCE_DELETE_PRINTING_TEMPLATE,
                          )
                        }
                        title='警告'
                        onClick={handleDel.bind(
                          null,
                          props.original.printing_template_id,
                        )}
                      >
                        {t('确定删除模板吗？')}
                      </TableXUtil.OperationDelete>
                    )}
                  </TableXUtil.OperationCell>
                ),
              },
            ]}
          />
        </BoxTable>
      </>
    )
  },
)

export default TemplateList
