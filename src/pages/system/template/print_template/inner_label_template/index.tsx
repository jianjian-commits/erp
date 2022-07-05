import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { BoxTable, BoxTableInfo, Tip, Flex, Tooltip } from '@gm-pc/react'
import { Button } from 'antd'
import { Table, TableXUtil } from '@gm-pc/table-x'
import qs from 'query-string'
import { observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import moment from 'moment'
import store from './store'
import { history } from '@/common/service'
import { PrintingTemplate } from 'gm_api/src/preference'

const Action = () => (
  <div>
    <Button
      type='primary'
      onClick={() => {
        history.push(
          '/system/template/print_template/inner_label_template/edit',
        )
      }}
    >
      {t('新建模板')}
    </Button>
  </div>
)

const InnerLabelTemplate = () => {
  useEffect(() => {
    store.getTemplateList()
  }, [])

  const { list } = store

  const tableInfo = [{ label: '内标模板列表', content: list.length }]

  const handleCustomerSetting = (item: any) => {
    history.push({
      pathname: '/system/template/print_template/relation_config',
      query: {
        printing_template_id: item.printing_template_id,
      },
    })
  }

  const handleSetDefault = (printing_template: PrintingTemplate) => {
    store
      .updateTemplate({
        ...printing_template,
        is_default: true,
      })
      .then(() => {
        store.getTemplateList()
        return Tip.success(t('保存成功'))
      })
  }

  const handleDel = (printing_template_id: string) => {
    store.deleteTemplate(printing_template_id).then(() => {
      store.getTemplateList()
      return Tip.success(t('删除成功'))
    })
  }

  return (
    <BoxTable
      headerProps={{ style: { backgroundColor: '#fff' } }}
      info={
        <BoxTableInfo>
          <TableTotalText data={tableInfo} />
        </BoxTableInfo>
      }
      action={<Action />}
    >
      <Table<any>
        data={list.slice()}
        columns={[
          {
            Header: t('创建时间'),
            accessor: 'create_time',
            Cell: ({ original }) => {
              return moment(+original.create_time).format('YYYY-MM-DD HH:mm:ss')
            },
          },
          { Header: t('模板名称'), accessor: 'name' },
          {
            Header: t('打印规格'),
            accessor: 'paper_size',
          },
          {
            Header: t('商户配置'),
            id: 'customer_setting',
            accessor: (item) => (
              <a onClick={() => handleCustomerSetting(item)}>{t('点击设置')}</a>
            ),
          },
          {
            Header: (
              <Flex alignCenter>
                {t('默认模板')}
                <Tooltip
                  popup={
                    <div className='gm-padding-5'>
                      {t('新注册商家所属的默认模板')}
                    </div>
                  }
                />
              </Flex>
            ),
            id: 'is_default',
            Cell: ({ original }) => {
              const { is_default } = original

              if (is_default) {
                return t('默认')
              }

              return (
                <div>
                  <a onClick={() => handleSetDefault(original)}>
                    {t('设为默认')}
                  </a>
                </div>
              )
            },
          },
          { Header: t('创建人'), accessor: 'creator' },
          {
            width: 80,
            id: 'operation',
            Header: TableXUtil.OperationHeader,
            Cell: ({ original }) => (
              <TableXUtil.OperationCell>
                <TableXUtil.OperationDetail
                  open
                  href={`#/system/template/print_template/inner_label_template/edit?${qs.stringify(
                    { printing_template_id: original.printing_template_id },
                  )}`}
                />
                {!original.is_default && (
                  <TableXUtil.OperationDelete
                    title='警告'
                    onClick={() => handleDel(original.printing_template_id)}
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
  )
}

export default observer(InnerLabelTemplate)
