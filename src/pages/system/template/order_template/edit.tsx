import { t } from 'gm-i18n'
import React, { useEffect, useState } from 'react'
import {
  Form,
  FormItem,
  FormPanel,
  FormGroup,
  Flex,
  Select,
  Tooltip,
  Uploader,
  Tip,
  InputNumber,
  Loading,
  Button,
  Input,
} from '@gm-pc/react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { gmHistory as history, useGMLocation } from '@gm-common/router'
import { doImport } from 'gm-excel'
import RelationList from './relation_list'
import { ORDER_IMPORT_TYPE } from './enum'
import { OrderImportTemplete_Type } from 'gm_api/src/orderlogic'

import store from './store'
import globalStore from '@/stores/global'
import { Permission } from 'gm_api/src/enterprise'

export default observer(() => {
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File>()
  const location = useGMLocation<{ id: string }>()
  const { id } = location.query
  const handleBack = () => {
    history.goBack()
  }

  const handleSave = async () => {
    await store.validate().catch((err) => {
      Tip.danger(err.message)
      throw new Error(err)
    })
    await store.save(id)
    Tip.success(t('保存成功'))
    id ? store.getDetail(id) : handleBack()
    return null
  }

  const getRelationColumns = (sheetData: any[][]) => {
    store.operateNewRelationColumns(sheetData).catch((err) => {
      Tip.danger(err.message)
    })
  }

  const handleUpload = async (files: File[]) => {
    setFile(files[0])
    try {
      await doImport(files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        getRelationColumns(sheetData)
        return null
      })
    } catch (err) {
      console.warn(err)
      Tip.danger(t('Excel文件解析异常，请重新编辑，保存后重试！'))
    }
  }
  const { detail, validateExcel } = store
  const { name, type, row_title, row_address, cycle_start, cycle_col } = detail
  const addPermission = true
  const editPermission = globalStore.hasPermission(
    Permission.PERMISSION_PREFERENCE_UPDATE_IMPORT_TEMPLATE,
  )

  useEffect(() => {
    if (id) {
      setLoading(true)
      store.getDetail(id).then(() => {
        setLoading(false)
        return null
      })
    } else {
      store.initDetail()
    }
    return () => {
      store.reset()
    }
  }, [])

  if (loading) {
    return (
      <Flex justifyCenter style={{ paddingTop: '120px' }}>
        <Loading />
      </Flex>
    )
  }

  return (
    <FormGroup
      onSubmit={handleSave}
      onCancel={handleBack}
      formRefs={[]}
      disabled={(id && !editPermission) || (!id && !addPermission)}
    >
      <FormPanel title={t('模板信息')}>
        <Form className='gm-margin-15' labelWidth='160px'>
          <FormItem label={t('模板名称')} required>
            <Flex alignCenter>
              <Input
                value={name}
                style={{ width: '300px' }}
                onChange={(e) => {
                  store.detailChange('name', e.target.value)
                }}
                placeholder={t('请输入模板名称（20字以内）')}
              />
            </Flex>
          </FormItem>
          <FormItem label={t('模板类型')}>
            <Select
              value={type}
              style={{ minWidth: '120px' }}
              onChange={(value) => {
                store.detailChange('type', value)
                setFile(undefined)
              }}
              data={ORDER_IMPORT_TYPE}
            />
          </FormItem>
          <FormItem label={t('标题所在行')} required>
            <Flex alignCenter>
              <InputNumber
                value={row_title}
                style={{ width: '120px' }}
                min={0}
                max={99999}
                onChange={(value: number) => {
                  store.detailChange('row_title', value)
                }}
                placeholder={t('输入标题所在行')}
              />
              <Tooltip
                popup={
                  <div className='gm-padding-10 gm-bg'>
                    {t('表格内订单表头信息所在行')}
                  </div>
                }
                className='gm-text-14 gm-padding-lr-5'
              />
            </Flex>
          </FormItem>
          {type === OrderImportTemplete_Type.TYPE_CUSTOMIZE ? (
            <FormItem label={t('商户所在行')} required>
              <Flex alignCenter>
                <InputNumber
                  value={row_address}
                  style={{ width: '120px' }}
                  onChange={(v: number) => {
                    store.detailChange('row_address', v)
                  }}
                  placeholder={t('输入商户所在行')}
                />
                <Tooltip
                  popup={
                    <div className='gm-padding-10 gm-bg'>
                      {t(
                        '商户需独立一行存在，不可出现其他信息否则将无法成功导入订单',
                      )}
                    </div>
                  }
                  className='gm-text-14 gm-padding-lr-5'
                />
              </Flex>
            </FormItem>
          ) : null}
          {type === OrderImportTemplete_Type.TYPE_CUSTOMIZE ? (
            <FormItem label={t('开始循环列')} required>
              <Flex alignCenter>
                <InputNumber
                  value={cycle_start}
                  style={{ width: '120px' }}
                  onChange={(value: number) => {
                    store.detailChange('cycle_start', value)
                  }}
                  placeholder={t('输入开始循环列')}
                />
                <Tooltip
                  popup={
                    <div className='gm-padding-10 gm-bg'>
                      {t('表头信息出现重复内容的第一列')}
                    </div>
                  }
                  className='gm-text-14 gm-padding-lr-5'
                />
              </Flex>
            </FormItem>
          ) : null}
          {type === OrderImportTemplete_Type.TYPE_CUSTOMIZE ? (
            <FormItem label={t('循环间隔列数')} required>
              <Flex alignCenter>
                <InputNumber
                  value={cycle_col}
                  style={{ width: '120px' }}
                  onChange={(value: number) => {
                    store.detailChange('cycle_col', value)
                  }}
                  placeholder={t('循环间隔列数')}
                />
                <Tooltip
                  popup={
                    <div className='gm-padding-10 gm-bg'>
                      {t(
                        '重复信息最小单元覆盖的列数，如单个商户下单信息覆盖的列数',
                      )}
                    </div>
                  }
                  className='gm-text-14 gm-padding-lr-5'
                />
              </Flex>
            </FormItem>
          ) : null}
          <FormItem label={t('导入表格')}>
            <Flex alignCenter>
              <Uploader onUpload={handleUpload} accept='.xlsx'>
                <Button plain disabled={validateExcel}>
                  {file ? t('重新上传') : t('上传文件')}
                </Button>
              </Uploader>
              <span className='gm-padding-lr-5'>{file && file?.name}</span>
            </Flex>
          </FormItem>
          <FormItem label={t('对应关系')} required>
            <RelationList />
          </FormItem>
        </Form>
      </FormPanel>
    </FormGroup>
  )
})
