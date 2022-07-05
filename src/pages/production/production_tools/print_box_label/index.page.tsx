import React, { useEffect } from 'react'
import { t } from 'gm-i18n'
import { BoxTable, BoxTableInfo, Tip, Button, Flex, Modal } from '@gm-pc/react'
import { Table, TableXUtil } from '@gm-pc/table-x'
import qs from 'query-string'
import { observer } from 'mobx-react'
import TableTotalText from '@/common/components/table_total_text'
import moment from 'moment'
import store from './store'
import { history } from '@/common/service'
import PrintBoxLabelModal from './components/print_box_label_modal'
import { PrintingTemplate } from 'gm_api/src/preference'

const Action = () => (
  <div>
    <Button
      type='primary'
      onClick={() => {
        history.push('/production/production_tools/print_box_label/edit')
      }}
    >
      {t('新建模板')}
    </Button>
  </div>
)

const PrintBoxLabel = () => {
  useEffect(() => {
    store.getTemplateList()
  }, [])

  const tableInfo = [
    { label: '箱签列表', content: store.printing_templete_list.length },
  ]

  const handleDel = (printing_template_id: string) => {
    store.deleteTemplate(printing_template_id).then(() => {
      store.getTemplateList()
      return Tip.success(t('删除成功'))
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

  const handlePrint = (type: 'table' | 'text', id: string) => {
    Modal.render({
      title: type === 'text' ? t('按文本打印') : t('按表格打印'),
      children: <PrintBoxLabelModal tpl_id={id} type={type} />,
      onHide: Modal.hide,
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
        data={store.printing_templete_list.slice()}
        columns={[
          {
            Header: t('创建时间'),
            accessor: 'create_time',
            Cell: ({ value }: any) => {
              return moment(+value).format('YYYY-MM-DD HH:mm:ss')
            },
          },
          { Header: t('模板名称'), accessor: 'name' },
          {
            Header: t('打印规格'),
            accessor: 'paper_size',
          },
          {
            width: 300,
            Header: t('打印'),
            id: 'print',
            Cell: ({ original }) => (
              <Flex>
                <Button
                  onClick={() =>
                    handlePrint('table', original.printing_template_id)
                  }
                >
                  {t('按表格打印')}
                </Button>
                <Button
                  className='gm-margin-left-5'
                  onClick={() =>
                    handlePrint('text', original.printing_template_id)
                  }
                >
                  {t('按文本打印')}
                </Button>
              </Flex>
            ),
          },
          {
            Header: <Flex alignCenter>{t('默认模板')}</Flex>,
            id: 'is_default',
            Cell: ({ row: { original } }: any) => {
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
          {
            width: 80,
            id: 'operation',
            Header: TableXUtil.OperationHeader,
            Cell: ({ original }) => (
              <TableXUtil.OperationCell>
                <TableXUtil.OperationDetail
                  open
                  href={`#/production/production_tools/print_box_label/edit?${qs.stringify(
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

export default observer(PrintBoxLabel)
