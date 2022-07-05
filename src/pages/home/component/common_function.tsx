import { t } from 'gm-i18n'
import React, { useState, useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import Panel from './panel'
import { Flex } from '@gm-pc/react'
import { Tooltip } from 'antd'
import _ from 'lodash'
import { CommonFunConfigOptions } from '../interface'
import SvgSetting from 'svg/setting.svg'
import getNavConfig, { getNavRouteMap } from '@/frame/navigation'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import CommonFunctionModal, { RefType } from './common_function_modal'
import { GetDashboardSettings } from 'gm_api/src/preference'

const initList = getNavConfig()

const CommonFunction = observer(() => {
  const modalRef = useRef<RefType | null>(null)

  const [cf, setCf] = useState<CommonFunConfigOptions>({
    configList: [],
    allConfigMap: getNavRouteMap(),
  })
  const [checksubAll, setCheckSubAll] = React.useState<Record<string, boolean>>(
    {},
  )
  const [checkAll, setCheckAll] = React.useState<Record<string, boolean>>({})
  const [checkList, setCheckList] = useState<
    Record<string, CheckboxValueType[]>
  >({})

  const handleConfig = () => {
    modalRef.current && modalRef.current.handleSetting()
  }

  const filterModalFiled = (list: string[] = []) => {
    let chooseRoute: Record<string, CheckboxValueType[]> = {}
    const subRoute: Record<string, boolean> = {}
    const allRoute: Record<string, boolean> = {}
    if (list.length === 0) {
      setCheckList({})
      setCheckSubAll({})
      setCheckAll({})
    }
    _.each(list, (item) => {
      _.each(getNavRouteMap(), (itemTwo) => {
        if (itemTwo.link === item) {
          const value: any = {
            [itemTwo.twoName]: _.concat(
              [item],
              chooseRoute[itemTwo.twoName] || [],
            ),
          }
          chooseRoute = { ...chooseRoute, ...value }
          const filterOne = _.filter(itemTwo.one, (i) =>
            _.every(i.sub, (x) => !x.disabled),
          )
          setCheckList(chooseRoute)
          subRoute[itemTwo.twoLink] =
            chooseRoute[itemTwo.twoName]?.length === itemTwo.two.length
          setCheckSubAll(subRoute)
          allRoute[itemTwo.oneName] = _.every(
            filterOne,
            (i) => subRoute[i.link],
          )
          setCheckAll(allRoute)
        }
      })
    })
  }
  const fetchNav = () => {
    GetDashboardSettings().then((res) => {
      const list = res.response.dashboard_settings.routes?.route || []
      const reloadCf = {
        configList: list || [],
        allConfigMap: getNavRouteMap(),
      }
      filterModalFiled(list)
      setCf(reloadCf)
    })
  }

  useEffect(() => {
    fetchNav()
  }, [])

  const getRouteList = (list: string[]) => {
    const reloadCf = { configList: list, allConfigMap: getNavRouteMap() }
    filterModalFiled(list)
    setCf(reloadCf)
  }
  return (
    <Panel
      title={t('常用功能')}
      right={
        <Tooltip
          placement='bottom'
          title={<span className='tw-text-black'>{t('自定义设置')}</span>}
          color='white'
        >
          <span onClick={handleConfig}>
            <SvgSetting className='gm-cursor gm-text-14 icon-setting' />
          </span>
        </Tooltip>
      }
    >
      <Flex
        wrap
        alignContentStart
        className='tw-h-28 tw-overflow-y-auto b-scrollbar'
      >
        {cf.configList?.length === 0 ? (
          <Flex alignCenter justifyCenter className='b-frame-text'>
            <span className='b-frame-text-color'>
              {t('当前无常用功能,请先进行')}
            </span>
            <span className='b-frame-text-active-color ' onClick={handleConfig}>
              {t('配置')}
            </span>
          </Flex>
        ) : (
          _.map(cf.configList, (link) => (
            <>
              {cf.allConfigMap[link] && !cf.allConfigMap[link].disabled ? (
                <div className='tw-w-36 lg:tw-w-1/2 tw-p-1'>
                  <Flex
                    alignCenter
                    justifyCenter
                    key={link}
                    onClick={() => {
                      window.open(`#${link}`)
                    }}
                    className='tw-text-xs tw-h-6 tw-text-center tw-no-underline tw-bg-back tw-rounded-sm tw-text-secondary tw-cursor-pointer hover:tw-text-primary '
                  >
                    {cf.allConfigMap[link]?.name}
                  </Flex>
                </div>
              ) : null}
            </>
          ))
        )}
      </Flex>

      <CommonFunctionModal
        getRouteList={getRouteList}
        initList={initList}
        ref={modalRef}
        checklist={checkList}
        all={checkAll}
        sub={checksubAll}
      />
    </Panel>
  )
})

export default CommonFunction
