import { uploadTengXunFile } from '@/common/service'
import {
  BoxForm,
  Button,
  Flex,
  FormBlock,
  FormItem,
  MoreSelectDataItem,
  Select,
  Tip,
  Uploader,
  UploaderFile,
} from '@gm-pc/react'
import { t } from 'gm-i18n'
import { FileType } from 'gm_api/src/cloudapi'
import {
  ExportProcessorStockLog,
  ImportProcessorBatchCheck,
} from 'gm_api/src/inventory'
import _ from 'lodash'
import { Observer, observer } from 'mobx-react'
import React, { useEffect, useState } from 'react'
import store from '../processor_check/store'
import globalStore from '@/stores/global'

interface Props {
  onHide: () => void
}

const BatchCheck = (props: Props) => {
  const {
    stockDataCheck,
    fetchStockList,
    stockfiltercheck: { processor_id },
    processors,
  } = store

  useEffect(() => {
    fetchStockList()
  }, [])

  const [file, setFile] = useState<UploaderFile>()

  const handleMoreSelect = (
    select: MoreSelectDataItem<string>[],
    key: string,
  ) => {
    store.updateFiltercheck(select, key)
  }

  async function downloadExcelFile(e: React.MouseEvent<HTMLAnchorElement>) {
    const processorids: string[] = []

    _.forEach(processors, (item) => {
      if (item.parent_id === processor_id) {
        processorids.push(item.processor_id)
      }
    })
    processorids.push(processor_id)

    const processor = _.filter(stockDataCheck, (item) => {
      return item.value === processor_id
    })
    e.preventDefault()

    if (processor[0]?.text) {
      await ExportProcessorStockLog({
        processor_ids: processorids,
        processor_name: processor && processor[0].text,
      })

      props.onHide()
      await globalStore.showTaskPanel('0')
    } else {
      Tip.danger(t('请选择盘点车间！'))
    }
  }

  function handleUpload() {
    if (!file) {
      Tip.danger(t('请上传文件'))
      return
    }
    props.onHide()
    return uploadTengXunFile(
      FileType.FILE_TYPE_INVENTORY_BATCH_CHECK_IMPORT,
      file,
    )
      .then((json) => {
        if (json && json.download_url) {
          return ImportProcessorBatchCheck({
            file_url: json.download_url,
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

  function handleFileSelect(files: UploaderFile[]) {
    setFile(files[0])
  }

  return (
    <Flex className='gm-padding-left-15f' column>
      <BoxForm colWidth='385px'>
        <FormBlock>
          <FormItem label={t('第一步')}>
            <Observer>
              {() => {
                return (
                  <Select
                    placeholder={t('请选择盘点车间')}
                    data={[...stockDataCheck]}
                    value={processor_id}
                    onChange={(value) => {
                      handleMoreSelect(value, 'processor_id')
                    }}
                  />
                )
              }}
            </Observer>
          </FormItem>
        </FormBlock>
        <FormBlock className='gm-margin-top-15'>
          <FormItem label={t('第二步')}>
            <div className='gm-margin-top-10'>
              <a
                className='tw-cursor-pointer gm-margin-top-8'
                onClick={downloadExcelFile}
              >
                {t('点击下载')}
              </a>
            </div>
          </FormItem>
        </FormBlock>
        <FormBlock className='gm-margin-top-20'>
          <FormItem label={t('第三步')}>
            <div className='gm-margin-top-8'>
              {t(
                `导出模版中默认包含当前车间近一个月有领料记录的物料，可自行添加商品填写盘点数，修改单价，填写盘点日期后上传系统`,
              )}
            </div>
          </FormItem>
        </FormBlock>
        <FormBlock>
          <FormItem>
            <div style={{ marginTop: 10, marginLeft: 50 }}>
              <Uploader
                onUpload={(files) => handleFileSelect(files)}
                accept='.xlsx'
              >
                <Button>{file ? t('重新上传') : t('上传')}</Button>
              </Uploader>
              {file ? file.name : null}
            </div>
          </FormItem>
        </FormBlock>
      </BoxForm>

      <div className='gm-margin-top-20 gm-text-right'>
        <Button onClick={() => props.onHide()}>{t('取消')}</Button>
        <Button
          className='gm-margin-left-10'
          type='primary'
          onClick={handleUpload}
        >
          {t('确定')}
        </Button>
      </div>
    </Flex>
  )
}

export default observer(BatchCheck)
