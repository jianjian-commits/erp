import React, { useState, FC, useEffect } from 'react'
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
  Flex,
  Tip,
} from '@gm-pc/react'
import { ImportCombineSsu, BulkUpdateCombineSsu } from 'gm_api/src/merchandise'
import { uploadTengXunFile } from '@/common/service'
import PermissionJudge from '@/common/components/permission_judge'
import { FileType } from 'gm_api/src/cloudapi'
import { Permission } from 'gm_api/src/enterprise'
import '@/common/components/quotation_detail/style.less'
import globalStore from '@/stores/global'
const UploadFile: FC = () => {
  const [file, setFile] = useState<UploaderFile>()
  const [type, setType] = useState('1')
  const handleChoseFile = (files: UploaderFile[]) => {
    setFile(files[0])
  }
  // 根据权限判断 如果没有创建的权限 那么打开就是第二个，如果有创建，默认就是第一个开始，下面的逻辑基本不变，在这里增加了判断
  useEffect(() => {
    globalStore.hasPermission(
      Permission.PERMISSION_PRODUCTION_CREATE_COMBINE_SSU,
    )
      ? setType('1')
      : setType('2')
  }, [])
  const handleDownload = () => {
    window.open(
      'https://gmfiles-1251112841.cos.ap-guangzhou.myqcloud.com/merchandise/import-template/%E6%89%B9%E9%87%8F%E5%AF%BC%E5%85%A5%E7%BB%84%E5%90%88%E5%95%86%E5%93%81.xlsx',
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
      FileType.FILE_TYPE_MERCHANDISE_COMBINE_SSU_IMPORT,
      file,
    )
      .then((json) => {
        if (json && json.download_url) {
          const url = {
            file_url: json.download_url,
          }
          return type === '1'
            ? ImportCombineSsu(url)
            : BulkUpdateCombineSsu(url)
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
      <FormItem label={t('1.选择导入类型')}>
        <RadioGroup value={type} onChange={handleChoseRadio}>
          <Flex>
            <PermissionJudge
              permission={Permission.PERMISSION_PRODUCTION_CREATE_COMBINE_SSU}
            >
              <Radio value='1'>{t('批量导入新建')}</Radio>
            </PermissionJudge>
            <PermissionJudge
              permission={Permission.PERMISSION_PRODUCTION_UPDATE_COMBINE_SSU}
            >
              <Radio value='2'>{t('批量导入修改')}</Radio>
            </PermissionJudge>
          </Flex>
        </RadioGroup>
      </FormItem>
      {type === '1' && (
        <FormItem label={t('2.下载模板')}>
          <span onClick={handleDownload} className='down_span'>
            {t('下载新建模板')}
          </span>
        </FormItem>
      )}
      <FormItem label={t(`${type === '2' ? 2 : 3}.上传文件`)}>
        <Uploader onUpload={handleChoseFile} accept='.xlsx'>
          <Button>{file ? t('重新上传') : t('上传')}</Button>
        </Uploader>

        {file ? <p className='gm-text-desc '>{file.name}</p> : null}
        {type === '2' && (
          <div className='gm-margin-top-5 gm-text-desc'>
            {t('导出组合商品信息，修改组合商品信息后上传文件，完成导入')}
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
