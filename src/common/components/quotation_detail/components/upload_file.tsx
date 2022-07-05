import React, { useState, FC } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import {
  Button,
  Form,
  FormButton,
  FormItem,
  RadioGroup,
  Radio,
  Uploader,
  UploaderFile,
  Modal,
  Tip,
} from '@gm-pc/react'
import { importType } from '../enum'
import { ImportMenuDetail } from 'gm_api/src/merchandise'
import { uploadTengXunFile } from '@/common/service'
import { FileType } from 'gm_api/src/cloudapi'
import '../style.less'
import globalStore from '@/stores/global'

interface Props {
  quotation_id: string
}

const UploadFile: FC<Props> = (props) => {
  const { quotation_id } = props
  const [file, setFile] = useState<UploaderFile>()
  const [type, setType] = useState('1')
  const handleChoseFile = (files: UploaderFile[]) => {
    setFile(files[0])
  }
  const handleDownload = () => {
    window.open(
      'https://file.guanmai.cn/merchandise/import-template/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E8%8F%9C%E8%B0%B1%E6%A8%A1%E6%9D%BF.xlsx',
    )
  }

  const handleChoseRadio = (value: string) => {
    setType(value)
    setFile(undefined)
  }

  const handleCancel = () => {
    Modal.hide()
  }

  const handleSave = () => {
    if (!type) {
      Tip.danger(t('请先选择导入类型'))
      return
    }
    if (!file) {
      Tip.danger(t('请上传文件'))
      return
    }
    Modal.hide()

    return uploadTengXunFile(
      FileType.FILE_TYPE_MERCHANDISE_MENU_DETAIL_IMPORT,
      file,
    )
      .then((json) => {
        if (json && json.download_url) {
          return ImportMenuDetail({
            file_url: json.download_url,
            quotation_id: quotation_id,
          })
        }
        return null
      })
      .then((json) => {
        if (json) {
          globalStore.showTaskPanel('1')
        } else {
          Tip.danger(t('文件处理失败，请重新上传'))
        }

        return json
      })
  }
  return (
    <Form
      btnPosition='right'
      labelWidth='100px'
      onSubmit={handleSave}
      className='down_form'
    >
      {/* <FormItem label={t('1.选择导入类型')}>
        <RadioGroup value={type} onChange={handleChoseRadio}>
          {_.map(importType, ({ value, text }) => {
            return (
              <Radio key={value} value={value}>
                {text}
              </Radio>
            )
          })}
        </RadioGroup>
      </FormItem> */}
      {type === '1' && (
        // <FormItem label={t('2.下载模板')}>
        <FormItem label={t('1.下载模板')}>
          <span onClick={handleDownload} className='down_span'>
            {t('下载新建模板')}
          </span>
        </FormItem>
      )}
      {/* <FormItem label={t(`${type === '2' ? 2 : 3}.上传文件`)}> */}
      <FormItem label={t(`${type === '2' ? 2 : 2}.上传文件`)}>
        <Uploader onUpload={handleChoseFile} accept='.xlsx'>
          <Button>{file ? t('重新上传') : t('上传')}</Button>
        </Uploader>
        {file ? <p className='gm-text-desc '>{file.name}</p> : null}
        {type === '2' && (
          <div className='gm-margin-top-5 gm-text-desc'>
            {t('导出菜谱信息，修改菜谱信息后上传文件，完成导入')}
          </div>
        )}
      </FormItem>
      <FormButton>
        <Button onClick={handleCancel}>{t('取消')}</Button>
        <Button type='primary' className='gm-margin-left-10' htmlType='submit'>
          {t('确认')}
        </Button>
      </FormButton>
    </Form>
  )
}

export default UploadFile
