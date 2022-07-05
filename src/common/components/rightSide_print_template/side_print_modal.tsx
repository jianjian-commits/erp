import { i18next, t } from 'gm-i18n'
import React, { FC, useState } from 'react'
import { Flex, RadioGroup, Radio, Storage, Button, Tip } from '@gm-pc/react'
import { PrintingTemplate } from 'gm_api/src/preference'

interface SidePrintModalProps {
  templates: PrintingTemplate[]
  name: string
  onPrint: (template: PrintingTemplate) => void
  onEdit: (templateId: string) => void
}

const SidePrintModal: FC<SidePrintModalProps> = ({
  name,
  templates = [],
  onPrint,
  onEdit,
}) => {
  const [curType, setCurType] = useState<string>(() => {
    if (
      Storage.get(name) &&
      !templates.some((t) => t.printing_template_id === Storage.get(name))
    )
      Storage.remove(name)
    return (
      Storage.get(name) ||
      templates.find((o) => o.is_default)?.printing_template_id
    )
  })

  function handlePrint() {
    const obj = templates.find((o) => o.printing_template_id === curType)
    if (obj) {
      onPrint(obj)
    } else {
      Tip.success('没有选择打印模板')
    }
  }

  function handleChangePrintTemp(v: string) {
    setCurType(v)
    Storage.set(name, v)
  }

  return (
    <Flex
      column
      style={{
        width: '300px',
        padding: '30px 0 20px 20px',
        borderLeft: '1px solid #ddd',
      }}
    >
      <Flex
        justifyBetween
        alignCenter
        className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
      >
        <Flex className='gm-text-16'>{i18next.t('选择单据模板')}</Flex>
        <Button type='primary' onClick={handlePrint}>
          {i18next.t('打印')}
        </Button>
      </Flex>

      <RadioGroup
        value={curType}
        onChange={handleChangePrintTemp}
        className='gm-padding-right-15 gm-padding-tb-10'
      >
        {templates.map((item) => {
          return (
            <Flex
              justifyBetween
              className='gm-padding-bottom-5'
              key={item.printing_template_id}
            >
              <Radio value={item.printing_template_id}>
                <span>{item.name}</span>
              </Radio>
              <a onClick={onEdit.bind(null, item.printing_template_id)}>
                {t('编辑模板')}
              </a>
            </Flex>
          )
        })}
      </RadioGroup>
    </Flex>
  )
}

export default SidePrintModal
