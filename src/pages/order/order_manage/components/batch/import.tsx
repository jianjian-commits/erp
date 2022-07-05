import React, { useState, FC, useEffect, ChangeEvent } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import timezone from 'moment-timezone'
import {
  Flex,
  Uploader,
  Button,
  Modal,
  MoreSelect,
  UploaderFile,
  Tip,
} from '@gm-pc/react'
import { doExport } from 'gm-excel'
import { gmHistory as history, gmHistory } from '@gm-common/router'
import { ListServicePeriod, ServicePeriod } from 'gm_api/src/enterprise'
import ReceiveTime from './receive_time'
import { getReceiveTime } from '../detail/util'
import { isValidOrderTime } from '../../../util'
import {
  OrderImportTemplete,
  ListOrderTemplete,
  UploadOrderTemplete,
} from 'gm_api/src/orderlogic'
import { uploadQiniuFile } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import batchStore from './store'
import { getExcelData } from './util'
import Big from 'big.js'
import { Unit } from 'gm_api/src/merchandise/types'
import { getBaseRateFromBaseUnit, toFixedOrder } from '@/common/util'
import importDataHandle from './import_data_handle'

type Base = {
  value: string
  text: string
}
type SP = ServicePeriod & Base

type OrderIT = OrderImportTemplete & Base

const BatchImport: FC = () => {
  function _handleCancel() {
    Modal.hide()
  }
  function handleChange(value: OrderIT) {
    setTemplate(value)
  }
  function handleServicePeriodChange(value: SP) {
    setServicePeriod(value)
    // 当前为不可下单时间
    if (value && !isValidOrderTime(value)) {
      setReceiveTime(undefined)
      return
    }
    const { receiveTime } = getReceiveTime(value)
    setReceiveTime(value ? receiveTime : undefined)
  }
  function handleDateChange(date: Date) {
    setReceiveTime(date ? `${+date}` : undefined)
  }

  function handleDownload() {
    if (!template) {
      Tip.danger(t('请选择预设模板'))
      return
    }
    doExport([getExcelData(template)], {
      fileName: `模板_${template.order_import_templete_id}.xlsx`,
      columns: [],
    })
  }

  const getIngredientsQuantity = (
    ratio: string,
    use_unit_id: string,
    unit: Unit,
    parentQuantity: number,
  ): number => {
    const rate = getBaseRateFromBaseUnit(use_unit_id, unit.parent_id)
    return +toFixedOrder(
      Big(ratio).times(parentQuantity).times(rate).div(unit.rate),
    )
  }

  function handleUploadFileChoosen(
    files: UploaderFile[],
    e: ChangeEvent<HTMLInputElement>,
  ) {
    setFile(files[0])
    e.target.value = ''
  }
  function handleCancel() {
    _handleCancel()
  }
  function handleSubmit() {
    if (!file) {
      Tip.danger(t('请上传文件'))
      return Promise.reject(new Error(''))
    }
    if (!servicePeriod) {
      Tip.danger(t('请选择运营时间'))
      return Promise.reject(new Error(''))
    }
    if (!receiveTime) {
      Tip.danger(t('请选择收货时间'))
      return Promise.reject(new Error(''))
    }
    if (!template) {
      Tip.danger(t('请选择预设模板'))
      return Promise.reject(new Error(''))
    }
    // _handleSubmit(file, { receiveTime, servicePeriod, template })
    return uploadQiniuFile(
      FileType.FILE_TYPE_ENTERPRISE_CUSTOMER_IMPORT,
      file,
    ).then(async (json) => {
      const res = await UploadOrderTemplete({
        order_import_templete_id: template.order_import_templete_id,
        service_period_id: servicePeriod.service_period_id,
        receive_time: receiveTime!,
        time_zone: timezone.tz.guess(),
        file_url: json.data.url,
      })
      const list = await importDataHandle(res.response)
      if (!list.length) {
        Tip.danger(t('没有解析到数据'))
        throw new Error('no data')
      }
      batchStore.setBatchOrders(list, servicePeriod)
      gmHistory.push('/order/order_manage/batch')
      _handleCancel()
      return null
    })
  }

  function handleToOrderTemplate() {
    history.push('/system/template/order_template')
    Modal.hide()
  }
  const [file, setFile] = useState<UploaderFile>()
  const [receiveTime, setReceiveTime] = useState<string>()
  const [servicePeriod, setServicePeriod] = useState<SP>()
  const [servicePeriods, setServicePeriods] = useState<SP[]>([])
  const [templates, setTemplates] = useState<OrderIT[]>([])
  const [template, setTemplate] = useState<OrderIT>()

  useEffect(() => {
    ListServicePeriod({ paging: { limit: 999 } }).then((json) => {
      setServicePeriods(
        _.map(json.response.service_periods, (item: ServicePeriod) => {
          return {
            ...item,
            value: item.service_period_id || '',
            text: item.name || '',
          }
        }),
      )
      return null
    })
    ListOrderTemplete({ paging: { limit: 999 } }).then((json) => {
      setTemplates(
        (json.response?.order_templetes || []).map((v) => ({
          ...v,
          value: v.order_import_templete_id!,
          text: v.name!,
        })),
      )
      return null
    })
  }, [])
  const disabled = servicePeriod && !isValidOrderTime(servicePeriod)
  return (
    <Flex column className='gm-padding-5'>
      <div className='gm-padding-lr-10'>
        <div className='gm-text-14'>{t('选择运营时间和收货时间')}</div>
        <div className='gm-padding-tb-10 gm-padding-lr-15 '>
          <Flex className='gm-margin-top-5'>
            <Flex alignCenter>{t('运营时间')}：</Flex>
            <Flex flex alignCenter className='gm-margin-right-5'>
              <MoreSelect
                style={{ minWidth: 175 }}
                selected={servicePeriod}
                placeholder={t('选择运营时间')}
                data={servicePeriods || []}
                onSelect={handleServicePeriodChange}
              />
              {disabled && (
                <div className='gm-padding-left-5 gm-text-danger'>
                  当前运营时间无法下单
                </div>
              )}
            </Flex>
          </Flex>
          <Flex className='gm-margin-top-5'>
            <Flex alignCenter>{t('收货时间')}：</Flex>
            <Flex flex alignCenter className='gm-margin-right-5'>
              <ReceiveTime
                value={receiveTime ? new Date(+receiveTime) : undefined}
                servicePeriod={servicePeriod! || {}}
                disabled={!servicePeriod || disabled}
                onChange={handleDateChange}
              />
            </Flex>
          </Flex>
        </div>
      </div>
      <div className='gm-padding-lr-10'>
        <div className='gm-text-14'>{t('选择导入的预设模板')}</div>
        <Flex alignCenter className='gm-padding-tb-10 gm-padding-lr-15 '>
          <MoreSelect
            style={{ minWidth: 175 }}
            selected={template}
            placeholder={t('选择预设模板')}
            data={templates}
            onSelect={handleChange}
          />
          <Flex className='gm-margin-left-10'>
            <a
              href='javascript:;'
              onClick={handleDownload}
              rel='noopener noreferrer'
            >
              {t('下载xlsx模板')}
            </a>
          </Flex>
          <Flex flex justifyEnd alignCenter>
            <a onClick={handleToOrderTemplate} className='gm-cursor'>
              {t('模板设置')} &gt;
            </a>
          </Flex>
        </Flex>
      </div>
      <div className='gm-padding-lr-10'>
        <div className='gm-text-14'>{t('上传xlsx文件')}</div>
        <div className='gm-padding-tb-10 gm-padding-lr-15 '>
          <Uploader onUpload={handleUploadFileChoosen} accept='.xlsx'>
            <Button>{file ? t('重新上传') : t('上传')}</Button>
          </Uploader>
          {file ? (
            <span className='gm-text-desc gm-margin-left-5'>{file.name}</span>
          ) : null}
        </div>
        <div className='gm-padding-lr-15 gm-text-desc'>
          {t('如有预设模板可直接上传，无需下载系统空模板')}
        </div>
      </div>
      <div className='gm-text-right gm-padding-top-10'>
        <Button className='gm-margin-right-10' onClick={handleCancel}>
          {t('取消')}
        </Button>
        <Button type='primary' htmlType='submit' onClick={handleSubmit}>
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
}

export default BatchImport
