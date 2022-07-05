import React, { useEffect, forwardRef, useImperativeHandle } from 'react'
import { observer } from 'mobx-react'
import store from './store'
import { BatchActionDefault, TableXUtil } from '@gm-pc/table-x'
import { t } from 'gm-i18n'
import {
  BoxTable,
  BoxTableInfo,
  Button,
  Dialog,
  Flex,
  Price,
  Modal,
  LoadingChunk,
} from '@gm-pc/react'
import TableTotalText from '@/common/components/table_total_text'
import DayList from './components/day_list'
import UploadFile from './components/upload_file'
import SyncLatestRatio from './components/sync_latest_ratio'
interface QuotationDetailProps {
  quotation_id: string
  menu_from_time: string
  menu_to_time: string
  source: string
  valid_begin: string
  valid_end: string
  show_import?: boolean
}

interface QuotationDetailRef {
  fetchList(): void
}

const QuotationDetail = forwardRef<QuotationDetailRef, QuotationDetailProps>(
  (props, ref) => {
    const {
      quotation_id,
      menu_from_time,
      menu_to_time,
      source,
      valid_begin,
      valid_end,
      show_import,
    } = props
    const {
      quotation: { inner_name },
      menuPeriodGroups,
      summaryInfo: { count, total_price, total_cost },
      loading,
    } = store
    useImperativeHandle(ref, () => ({
      fetchList,
    }))

    useEffect(() => {
      store.setFilter(
        source,
        quotation_id,
        menu_from_time,
        menu_to_time,
        valid_begin,
        valid_end,
      )
    }, [
      quotation_id,
      source,
      valid_end,
      valid_begin,
      menu_from_time,
      menu_to_time,
    ])

    useEffect(() => {
      // 返回上一级，不需要请求数据
      if (!store.returnStep) {
        fetchList()
      }
      return () => {
        source !== 'order' && store.init()
      }
    }, [quotation_id])

    const fetchList = async () => {
      try {
        store.setLoading(true)
        await store.getQuotation(quotation_id)
        await store.getList()
      } catch (error) {
        return Promise.reject(error)
      } finally {
        store.setLoading(false)
      }
    }

    const handleSelectAll = () => {
      store.changeSelectedAll(true)
    }

    const ImportQuotation = () => {
      const handleImport = () => {
        Modal.render({
          style: {
            width: '400px',
          },
          title: t('批量导入菜谱'),
          children: <UploadFile quotation_id={quotation_id} />,
        })
      }
      return (
        <Button type='primary' onClick={handleImport}>
          {t('导入菜谱')}
        </Button>
      )
    }

    return (
      <BoxTable
        info={
          store.getSelectedCombineSsus.length ? (
            // @ts-ignore
            <TableXUtil.BatchActionBar
              pure
              onClose={handleSelectAll}
              batchActions={
                source !== 'order'
                  ? [
                      {
                        children: (
                          <BatchActionDefault>
                            {t('同步最新配比')}
                          </BatchActionDefault>
                        ),
                        onAction: () => {
                          Dialog.render({
                            title: t('提示'),
                            size: 'md',
                            children: <SyncLatestRatio />,
                          })
                        },
                      },
                    ]
                  : []
              }
              count={store.getSelectedCombineSsus?.length}
            />
          ) : (
            <BoxTableInfo>
              <TableTotalText
                data={[
                  {
                    label: (
                      <>
                        <span style={{ fontSize: '14px' }}>
                          {t(`${inner_name || ''}`)}
                        </span>
                        （ {t(' 商品总数')}
                      </>
                    ),
                    content: count,
                  },
                  {
                    label: t('总售价'),
                    content: <Price value={+total_price! || 0} />,
                  },
                  {
                    label: t('总成本'),
                    content: (
                      <>
                        <Price value={+total_cost! || 0} />

                        <span
                          style={{
                            color: 'rgba(0,0,0,.95)',
                            fontWeight: 'normal',
                            marginLeft: '2px',
                          }}
                        >
                          ）
                        </span>
                      </>
                    ),
                  },
                ]}
              />
            </BoxTableInfo>
          )
        }
        action={show_import ? <ImportQuotation /> : undefined}
      >
        <LoadingChunk
          className='tw-text-14'
          loading={loading}
          text='加载中...'
          size='100px'
        >
          {menuPeriodGroups.length ? (
            <DayList />
          ) : (
            <Flex alignCenter justifyCenter style={{ height: '160px' }}>
              <span style={{ lineHeight: '31px' }}>{t('暂未设置餐次，')}</span>
              <Button
                type='link'
                size='small'
                onClick={() => window.open('#/menu/menu_manage/list')}
              >
                {t('去设置')}
              </Button>
            </Flex>
          )}
        </LoadingChunk>
      </BoxTable>
    )
  },
)

export default observer(QuotationDetail)
