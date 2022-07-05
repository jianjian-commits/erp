import React, { FC, useEffect, useState } from 'react'
import { t } from 'gm-i18n'
import { Flex, MoreSelect, MoreSelectDataItem } from '@gm-pc/react'
import _ from 'lodash'
import { observer } from 'mobx-react'
import { ClassFilterProps, LevelList, RelationData } from './interface'
import { useAsync } from '@gm-common/hooks'
import { ListCustomer, Customer_Type } from 'gm_api/src/enterprise'

const ClassFilter: FC<ClassFilterProps> = observer(({ selected, onChange }) => {
  const [relationData, setRelationData] = useState<RelationData>({
    schoolIdMapClassIds: {},
  })
  const [customers, setCustomers] = useState<LevelList[]>([])

  // 说明：
  // child_customers 是一个map, key(子customer_id): { value: [customer_id]} (子的value)
  // child_customer_relation 是一个map: key (父customer_id): value (子customer_id)
  // customers 是所有学校

  const handleRequest = () => {
    return ListCustomer({
      level: 1,
      paging: { limit: 999 },
      need_child_customers: true, // 返回学校的班级
      type: Customer_Type.TYPE_SCHOOL,
    }).then((json) => {
      const { customers, child_customer_relation, child_customers } =
        json.response

      if (customers && child_customer_relation) {
        const _customers = _.map(customers, (_school) => {
          return {
            text: _school?.name!,
            value: _school?.customer_id!,
            children: _.map(
              child_customer_relation[_school?.customer_id!]?.values,
              (class_id) => {
                const _class = child_customers[class_id]
                return {
                  value: _class?.customer_id!,
                  text: _class?.name!,
                }
              },
            ),
          }
        })
        setCustomers(_customers)
      }

      const _school_ids = Object.keys(
        Object.assign({}, child_customer_relation),
      )
      const schoolIdMapClassIds: { [key: string]: string[] } = {}
      if (child_customer_relation) {
        _.map(_school_ids, (school_id) => {
          schoolIdMapClassIds[school_id] =
            child_customer_relation[school_id]?.values!
        })
      }

      setRelationData({
        schoolIdMapClassIds,
      })
      return json.response
    })
  }

  const { run } = useAsync(handleRequest, {
    cacheKey: 'classFilter',
  })

  useEffect(() => {
    run()
  }, [])

  const handleSelect = (
    name: 'school_ids' | 'class_ids',
    select: LevelList[],
  ) => {
    select = select || []
    let selected_data = selected
    const { schoolIdMapClassIds } = relationData
    if (name === 'school_ids') {
      selected_data = Object.assign({}, selected_data, {
        school_ids: _.map(select, (item) => item.value),
        class_ids: [],
      })
    } else {
      selected_data = Object.assign({}, selected_data, {
        class_ids: _.map(select, (item) => item.value),
      })
    }

    onChange(selected_data, schoolIdMapClassIds)
  }

  let { school_ids, class_ids } = selected

  school_ids = school_ids ? school_ids.slice() : []
  class_ids = class_ids ? class_ids.slice() : []

  // show school
  const show_school_list: LevelList[] = customers
  let show_class_list: LevelList[] = []

  const selected_school_list: LevelList[] = []
  const selected_class_list: LevelList[] = []

  if (school_ids.length) {
    _.each(school_ids, (school_id) => {
      _.map(customers, (item) => {
        if (item?.value! === school_id) {
          // show class
          show_class_list = show_class_list.concat(item?.children!)
          // selected school
          selected_school_list.push({
            value: item?.value!,
            text: item?.text!,
          })
        }
      })
    })
  }

  // selected class
  if (class_ids.length) {
    _.forEach(class_ids, (class_id) => {
      _.forEach(customers, (item) => {
        _.forEach(item?.children!, (_class) => {
          if (_class?.value! === class_id) {
            selected_class_list.push({
              value: _class?.value!,
              text: _class?.text!,
            })
          }
        })
      })
    })
  }

  return (
    <Flex justifyStart flex>
      <MoreSelect
        style={{ width: '100%' }}
        key='school_ids'
        selected={selected_school_list}
        data={show_school_list}
        onSelect={(selected: MoreSelectDataItem<string>[]) => {
          handleSelect('school_ids', selected)
        }}
        placeholder={(!selected.school_ids.length && t('全部学校')) || ''}
        multiple
      />
      <div className='gm-gap-10' />
      <MoreSelect
        style={{ width: '100%' }}
        key='class_ids'
        selected={selected_class_list}
        data={show_class_list}
        onSelect={(selected: MoreSelectDataItem<string>[]) => {
          handleSelect('class_ids', selected)
        }}
        placeholder={(!selected.class_ids.length && t('全部班级')) || ''}
        multiple
      />
    </Flex>
  )
})

export default ClassFilter
