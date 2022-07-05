import React, {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { Flex, Storage } from '@gm-pc/react'
import {
  Button,
  Modal,
  Radio,
  RadioChangeEvent,
  Select,
  Space,
  Steps,
} from 'antd'
import { t } from 'gm-i18n'
import _ from 'lodash'
import value, { QRCodeCanvas } from 'qrcode.react'
import {
  ListPrintingTemplate,
  PrintingTemplate,
  PrintingTemplate_Type,
} from 'gm_api/src/preference'
import queryString from 'query-string'

interface Props {
  modalRef: RefObject<Ref>
}

export type ShareParams = {
  id: string
  name: string
  token: string
}

export interface Ref {
  handleOpen: (params: ShareParams) => void
}

const steps = [
  {
    title: t('选择模板'),
  },
  {
    title: t('二维码'),
  },
]

// TODO 上线换下域名
const baseUrl = `${location.origin}/more#/share_salemenu`

const useTemplate = (
  dep: boolean,
  setSelectedTemplate: React.Dispatch<React.SetStateAction<string>>,
) => {
  const [templateList, setTemplateList] = useState<PrintingTemplate[]>([])
  const defaultTemplateId = useRef<string>('')

  useEffect(() => {
    defaultTemplateId.current = Storage.get('SALEMENU_DEFAULT_TEMPLATEID') || ''
    if (dep) {
      ListPrintingTemplate({
        paging: { limit: 999 },
        type: PrintingTemplate_Type.TYPE_QUOTATION,
      }).then((json) => {
        const printing_templates = json.response.printing_templates || []
        setTemplateList(printing_templates)
        if (
          Storage.get('SALEMENU_DEFAULT_TEMPLATEID') &&
          !printing_templates.some(
            (p) =>
              p.printing_template_id ===
              Storage.get('SALEMENU_DEFAULT_TEMPLATEID'),
          )
        ) {
          defaultTemplateId.current = ''
          Storage.remove('SALEMENU_DEFAULT_TEMPLATEID')
        }
        defaultTemplateId.current =
          defaultTemplateId.current ||
          printing_templates.find(({ is_default }) => is_default)
            ?.printing_template_id ||
          ''
        setSelectedTemplate(defaultTemplateId.current)
      })
    }
  }, [dep])

  return {
    templateList,
    defaultTemplateId: defaultTemplateId.current,
  }
}

const ShareQrcode: FC<Props> = ({ modalRef }) => {
  const [visible, setVisible] = useState<boolean>(false)
  const [quotation, setQuotation] = useState<Omit<ShareParams, 'token'>>({
    id: '',
    name: '',
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [shareUrl, setShareUrl] = useState<string>('')

  const { templateList, defaultTemplateId } = useTemplate(
    visible,
    setSelectedTemplate,
  )

  useImperativeHandle(modalRef, () => ({
    handleOpen,
  }))

  useEffect(() => {
    const { quotation_id, token } = queryString.parse(shareUrl.split('?')[1])
    setShareUrl(
      `${baseUrl}?${queryString.stringify({
        quotation_id,
        token,
        template_id: selectedTemplate,
      })}`,
    )
  }, [selectedTemplate])

  const handleOpen = useCallback(
    (params: ShareParams) => {
      setQuotation(_.omit(params, 'token'))
      setShareUrl(
        `${baseUrl}?${queryString.stringify({
          quotation_id: params.id,
          token: params.token,
          template_id: defaultTemplateId,
        })}`,
      )
      setVisible(true)
    },
    [shareUrl],
  )

  const hideModal = () => {
    setVisible(false)
    setSelectedTemplate(defaultTemplateId)
    setCurrentStep(0)
  }

  const handleTemplateChange = (selected: string) => {
    setSelectedTemplate(selected)
  }

  const handlePngSave = () => {
    const dataURL =
      (
        document.getElementById('qrcode_share') as HTMLCanvasElement
      )?.toDataURL() || ''
    if (!dataURL) return
    const a_ele = document.createElement('a')
    a_ele.id = 'qrcode_a'
    a_ele.download = `${quotation.name}.png`
    a_ele.href = dataURL
    a_ele.click()
    // eslint-disable-next-line no-unused-expressions
    a_ele.parentNode?.removeChild(a_ele)
  }

  return (
    <Modal
      title={t('报价单分享')}
      visible={visible}
      onOk={_.noop}
      onCancel={hideModal}
      okText={t('保存图片')}
      cancelText={t('取消')}
    >
      <Flex column justifyCenter alignCenter>
        <Steps current={currentStep} size='small'>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div className='gm-margin-top-20' />

        {currentStep === 0 ? (
          <>
            <Select
              style={{ minWidth: 250 }}
              value={selectedTemplate}
              options={templateList.map(
                ({ name, printing_template_id, is_default }) => ({
                  value: printing_template_id,
                  label: name + (is_default ? '(默认模板)' : ''),
                }),
              )}
              onSelect={handleTemplateChange}
            />
            <div className='gm-modal-footer'>
              <Button onClick={hideModal}>{t('取消')}</Button>
              <Button
                type='primary'
                onClick={() => {
                  setCurrentStep(currentStep + 1)
                  Storage.set('SALEMENU_DEFAULT_TEMPLATEID', selectedTemplate)
                }}
                disabled={!selectedTemplate}
              >
                {t('下一步')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Flex column justifyCenter alignCenter>
              <span>{quotation.name}</span>
              <div
                className='gm-padding-10 gm-bg gm-margin-left-10'
                style={{ width: '270px', background: 'blue' }}
              >
                <QRCodeCanvas id='qrcode_share' size={250} value={shareUrl} />
              </div>
            </Flex>
            <div className='gm-modal-footer'>
              <Button
                onClick={() => {
                  setCurrentStep(currentStep - 1)
                }}
              >
                {t('上一步')}
              </Button>
              <Button type='primary' onClick={handlePngSave}>
                {t('保存图片')}
              </Button>
            </div>
          </>
        )}
      </Flex>
    </Modal>
  )
}

export default ShareQrcode
