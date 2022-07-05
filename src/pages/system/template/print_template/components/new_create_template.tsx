import { t } from 'gm-i18n'
import { List } from '@gm-pc/react'
import { Dropdown } from 'antd'

import SVGDownTriangle from '@/svg/down_triangle.svg'
import React, { FC } from 'react'
import { observer } from 'mobx-react'

interface NewCreateTemplate {
  /** 新建url，详情url */
  url: string
  /** 新建模板的类型 */
  templateList: Record<'value' | 'text', number | string>[]
  /** url副本 新建模板的下拉框 */
  urlTranscript: Record<string, string>
}

const NewCreateTemplate: FC<NewCreateTemplate> = observer(
  ({ url, templateList, urlTranscript }) => {
    const handlePackBomImport = (value: number) => {
      window.location.href = urlTranscript?.[value]
    }
    const popver = () => {
      return (
        <List
          data={templateList}
          onSelect={(value: number) => {
            handlePackBomImport(value)
          }}
          className='gm-border-0'
          style={{ minWidth: '30px' }}
        />
      )
    }
    return (
      <>
        <Dropdown.Button
          type='primary'
          overlay={popver}
          icon={<SVGDownTriangle />}
          onClick={() => {
            window.location.href = url
          }}
        >
          {t('新建模板')}
        </Dropdown.Button>
      </>
    )
  },
)

export default NewCreateTemplate
