import { t } from 'gm-i18n'
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { Modal, Checkbox, Row, Col, message } from 'antd'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox'
import {
  NavConfigSubOptions,
  NavConfigSubSubOptions,
  NavConfigProps,
} from '@/frame/type'
import {
  UpdateDashboardSettings,
  UpdateDashboardSettingsRequest,
} from 'gm_api/src/preference'
import _ from 'lodash'
import globalStore from '@/stores/global'
const CheckboxGroup = Checkbox.Group
export interface RefType {
  handleSetting: () => void
}
interface CommonProps {
  initList: NavConfigProps[]
  getRouteList: (e: string[]) => void
  checklist: Record<string, CheckboxValueType[]>
  all: Record<string, boolean>
  sub: Record<string, boolean>
}

const CommonFunctionModal = forwardRef<RefType, CommonProps>(
  ({ initList, getRouteList, checklist, all, sub }, ref) => {
    const [navList, setNavList] = useState(initList)
    const [visible, setVisible] = useState(false)

    const [checksubAll, setCheckSubAll] = React.useState<
      Record<string, boolean>
    >({})
    const [checkAll, setCheckAll] = React.useState<Record<string, boolean>>({})
    const [checkList, setCheckList] = useState<
      Record<string, CheckboxValueType[]>
    >({})

    useImperativeHandle(ref, () => ({
      handleSetting,
    }))

    const handleCancel = () => {
      setVisible(false)
    }
    const handleSetting = () => {
      setVisible(true)
    }

    const handleOk = () => {
      const route = _.reduce(Object.values(checkList), (prve, next) => {
        return prve.concat(next)
      }) as string[]
      const req = {
        dashboard_settings: {
          routes: { route },
        },
      } as UpdateDashboardSettingsRequest
      UpdateDashboardSettings(req).then(() => {
        message.success(t('配置成功'))
        setVisible(false)
      })
      getRouteList(route)
    }

    const onCheckAllChange = (
      e: CheckboxChangeEvent,
      name: string,
      one: NavConfigSubOptions[],
    ) => {
      const obj: Record<string, CheckboxValueType[]> = {}
      const subObj: Record<string, boolean> = {}
      _.each(one, (item) => {
        subObj[item.link] = e.target.checked
        obj[item.name] = e.target.checked
          ? _.map(item.sub, (subItem) => subItem.link)
          : []
      })

      const values = { ...checkList, ...obj }
      const allCheck = { ...checkAll, [name]: e.target.checked }
      setCheckAll(allCheck)
      setCheckSubAll(subObj)
      setCheckList(values)
    }

    const onCheckSubChange = (
      e: CheckboxChangeEvent,
      two: NavConfigSubOptions,
      twoLink: string,
      oneName: string,
      one: NavConfigSubOptions[],
    ) => {
      const values = {
        ...checkList,
        [two.name]: e.target.checked ? _.map(two.sub, (i) => i.link) : [],
      }

      const subCheck = { ...checksubAll, [twoLink]: e.target.checked }

      const checkAllBool = _.every(one, (item) => subCheck[item.link])
      const allCheck = { ...checkAll, [oneName]: checkAllBool }
      setCheckAll(allCheck)
      setCheckSubAll(subCheck)
      setCheckList(values)
    }

    const onChange = (
      value: CheckboxValueType[],
      name: string,
      two: NavConfigSubSubOptions[],
      oneName: string,
      twoLink: string,
      one: NavConfigSubOptions[],
    ) => {
      const values = { ...checkList, [name]: value }
      const subCheck = {
        ...checksubAll,
        [twoLink]: value.length === two.length,
      }

      const checkAllBool = _.every(one, (item) => subCheck[item.link])
      const allCheck = { ...checkAll, [oneName]: checkAllBool }

      setCheckAll(allCheck)
      setCheckSubAll(subCheck)
      setCheckList(values)
    }

    useEffect(() => {
      if (visible) {
        setCheckList(checklist)
        setCheckSubAll(sub)
        setCheckAll(all)
      }
    }, [visible])

    return (
      <Modal
        title={t('配置常用功能')}
        visible={visible}
        onOk={handleOk}
        bodyStyle={{ height: '480px' }}
        wrapClassName='b-add-scroll'
        width='900px'
        onCancel={handleCancel}
      >
        {navList.map((one) => (
          <>
            <div key={one.link}>
              <Checkbox
                onChange={(e) => onCheckAllChange(e, one.name, one.sub)}
                checked={checkAll[one.name]}
              >
                {one.name}
              </Checkbox>
            </div>
            {one.sub.map((two) => (
              <Row
                key={two.link}
                className='tw-w-full tw-mb-2 tw-mt-1 tw-px-2 tw-box-border'
              >
                <Col span={6}>
                  <Checkbox
                    onChange={(e) =>
                      onCheckSubChange(e, two, two.link, one.name, one.sub)
                    }
                    checked={checkList?.[two.name]?.length === two.sub.length}
                  >
                    {two.name}
                  </Checkbox>
                </Col>
                <Col key={two.link} span={18}>
                  <CheckboxGroup
                    options={two.sub.map((three) => {
                      return {
                        label: three.name,
                        value: three.link,
                      }
                    })}
                    value={checkList[two.name]}
                    onChange={(value) => {
                      onChange(
                        value,
                        two.name,
                        two.sub,
                        one.name,
                        two.link,
                        one.sub,
                      )
                    }}
                  />
                </Col>
              </Row>
            ))}
          </>
        ))}
      </Modal>
    )
  },
)
export default CommonFunctionModal
