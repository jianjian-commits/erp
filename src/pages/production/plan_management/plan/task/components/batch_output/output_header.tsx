import { gmHistory as history } from '@gm-common/router'
import { Checkbox, Flex, RightSideModal } from '@gm-pc/react'
import { Button } from 'antd'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import React, { FC, useState } from 'react'
interface Props {
  /** 单品默认自动产出 */
  isSingleAutoOutput: boolean
  /** 组合默认自动产出 */
  isComboAutoOutput: boolean
  /** 更改过滤条件执行的动作 */
  onChange: (checked: boolean) => void
}
const Header: FC<Props> = observer(
  ({ isSingleAutoOutput, isComboAutoOutput, onChange }) => {
    const [checked, setChecked] = useState<boolean>(true)
    const handleChange = () => {
      setChecked(!checked)
      onChange(!checked)
    }

    const onSettingButtionClick = () => {
      RightSideModal.hide()
      history.push('/system/setting/production_setting')
    }

    return (
      <>
        {(isSingleAutoOutput || isComboAutoOutput) && (
          <Flex alignBaseline>
            <div
              className='gm-margin-bottom-10 gm-padding-lr-5 gm-text-red'
              style={{ fontSize: 14 }}
            >
              不支持{isSingleAutoOutput ? t('单品') : t('组合')}BOM产出功能
            </div>
            <Button
              type='link'
              size='small'
              style={{ fontSize: 12 }}
              onClick={onSettingButtionClick}
            >
              前往设置
            </Button>
          </Flex>
        )}
        <div className='gm-margin-bottom-5 gm-padding-lr-10 gm-text-red'>
          {t('1、进行中、已完成状态任务可以标记产出')}
        </div>
        <div className='gm-margin-bottom-5 gm-padding-lr-10 gm-text-red'>
          {t('2、点击确定，已填写数据的成品将会生成产出，可多次提交产出')}
        </div>
        <div className='gm-margin-bottom-10 gm-padding-lr-10 gm-text-red'>
          {t('3、若无产出数，则无需填写')}
        </div>
        <div className='gm-margin-bottom-10 gm-padding-lr-10'>
          <Checkbox checked={checked} onChange={handleChange}>
            {t('自动过滤已完成指令')}
          </Checkbox>
        </div>
      </>
    )
  },
)

export default Header
