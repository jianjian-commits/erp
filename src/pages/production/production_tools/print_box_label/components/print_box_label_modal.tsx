import React, { FC, useState } from 'react'
import { t } from 'gm-i18n'
import { doImport } from 'gm-excel'
import {
  Flex,
  Uploader,
  UploaderFile,
  Button,
  InputNumber,
  Tip,
  Modal,
} from '@gm-pc/react'
import _ from 'lodash'
import { getBoxPrintData } from '../utils'
import { PrintBoxDataProps } from '../edit/config/data_to_key'
import qs from 'query-string'
interface PrintBoxLabelModalProps {
  type: 'table' | 'text'
  tpl_id: string
}

const PrintBoxLabelModal: FC<PrintBoxLabelModalProps> = ({ type, tpl_id }) => {
  const [file, setFile] = useState<File>()
  const [printDatas, setData] = useState<PrintBoxDataProps[] | undefined>()
  const [loading, setLoading] = useState(type === 'table')
  const [count, setCount] = useState<number | null>(1)

  const handleDownload = () => {
    window.open(
      'https://gmfiles-1251112841.file.myqcloud.com/asynctask/box_print_template/template.xlsx',
    )
  }

  const handleUpload = async (files: UploaderFile[]) => {
    setFile(files[0])
    try {
      setLoading(true)
      await doImport(files[0]).then((json) => {
        const sheetData = _.values(json[0])[0]
        const datas = getBoxPrintData(sheetData)
        setData(datas)
        setLoading(false)
        return null
      })
    } catch (err) {
      console.warn(err)
      Tip.danger(t('Excel文件解析异常，请重新编辑，保存后重试！'))
    }
  }

  const handleInputChange = (value: number | null) => {
    setCount(value)
    if (!value) {
      setLoading(true)
    } else if (value && loading) {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    Modal.hide()
  }

  const handleConfirm = () => {
    window.open(
      `#/production/production_tools/print_box_label/print?${qs.stringify({
        datas: JSON.stringify(printDatas || []),
        id: tpl_id,
        type,
        times: count,
      })}`,
    )
  }

  return (
    <div>
      <div className='gm-text-red gm-margin-bottom-15'>
        {type === 'text'
          ? t('提示：直接按模板内容进行打印')
          : t('提示：按表格导入内容进行打印')}
      </div>

      {type === 'table' && (
        <div className='gm-margin-bottom-15'>
          <span>
            {t('下载模板')}：{' '}
            <a
              href='javascript:;'
              onClick={handleDownload}
              rel='noopener noreferrer'
            >
              {t('下载 xlsx 模板')}
            </a>
          </span>
        </div>
      )}

      {type === 'table' ? (
        <Flex alignCenter>
          <div>{t('导入表格')}：</div>
          <Uploader onUpload={(files) => handleUpload(files)} accept='.xlsx'>
            <Button plain>{file ? t('重新上传') : t('上传文件')}</Button>
          </Uploader>
        </Flex>
      ) : (
        <Flex alignCenter>
          <div>{t('输入打印数量')}：</div>
          <InputNumber
            precision={0}
            min={1}
            style={{ width: '200px' }}
            onChange={handleInputChange}
            value={count}
          />
        </Flex>
      )}

      <Flex className='gm-margin-top-15' justifyEnd>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <span className='gm-gap-15' />
        <Button disabled={loading} type='primary' onClick={handleConfirm}>
          {t('确定')}
        </Button>
      </Flex>
    </div>
  )
}

export default PrintBoxLabelModal
