import { t } from 'gm-i18n'
import React, { FC, useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { BoxForm, FormItem, FormButton, Flex } from '@gm-pc/react'
import { Button, Cascader } from 'antd'
import store from '../store'
import ClassFilter from '@/common/components/class_filter/index'
import PermissionJudge from '@/common/components/permission_judge'
import { Permission } from 'gm_api/src/enterprise'

const Filter: FC = observer(() => {
  const handleSearch = (): void => {
    store.fetchSchoolList()
  }

  const handleCreate = () => {
    window.open('#/customer/school/class_management/detail')
  }
  return (
    <Flex justifyBetween alignCenter style={{ height: '60px' }}>
      <BoxForm labelWidth='80px' onSubmit={handleSearch}>
        <FormItem>
          {/* <Observer>
            {() => {
              const {
                filter: { select },
              } = store
              return (
                <ClassFilter
                  selected={select}
                  onChange={(value, schoolId_map_classIds) => {
                    const value_ = Object.assign({}, value, {
                      schoolId_map_classIds,
                    })
                    store.updateFilter(value_, 'select')
                  }}
                />
              )
            }}
          </Observer> */}
          <Cascader
            changeOnSelect
            expandTrigger='hover'
            style={{ width: '300px' }}
            onChange={(value) => {
              store.updateFilter(
                'customer_ids',
                value ? ([value[value.length - 1]] as string[]) : [],
              )
            }}
            options={store.customers}
            placeholder='请选择班级'
          />
        </FormItem>
        <FormButton>
          <Button type='primary' htmlType='submit'>
            {t('搜索')}
          </Button>
        </FormButton>
      </BoxForm>
      <PermissionJudge
        permission={Permission.PERMISSION_ENTERPRISE_CREATE_SCHOOL_CLASS}
      >
        <Button
          type='primary'
          onClick={handleCreate}
          style={{ marginRight: '20px' }}
        >
          {t('新建学校')}
        </Button>
      </PermissionJudge>
    </Flex>
  )
})

export default Filter

// import { BatchExportCustomer, Customer_Type } from 'gm_api/src/enterprise'
// import globalStore from '@/stores/global'
/* <Button className='gm-margin-left-10' onClick={handleExport}>
          {t('导出')}
        </Button> */
// const handleExport = (): void => {
//   BatchExportCustomer({
//     customer_type: Customer_Type.TYPE_CLASS,
//   }).then((json) => {
//     globalStore.showTaskPanel()
//     return json
//   })
// }
