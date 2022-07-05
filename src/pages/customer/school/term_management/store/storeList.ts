import { makeAutoObservable } from 'mobx'
import {
  UpdateSemester,
  DeleteSemester,
  ListSemester,
  Semester,
  Status_Code,
} from 'gm_api/src/enterprise'
import _ from 'lodash'
import { message } from 'antd'
import { t } from 'gm-i18n'
export interface TermItemProps extends Semester {
  isEditing: boolean
}

class Store {
  termList: TermItemProps[] = []
  constructor() {
    makeAutoObservable(this, undefined, { autoBind: true })
  }

  init() {
    this.termList = []
  }

  updateTermItem<T extends keyof TermItemProps>(
    index: number,
    key: T,
    value: TermItemProps[T],
  ) {
    this.termList[index][key] = value
  }

  fetchDeleteTerm(semester_id: string) {
    return DeleteSemester(
      {
        semester_id,
      },
      [Status_Code.SEMESTER_EXISTS_BUDGET, Status_Code.SEMESTER_NOT_EXISTS],
    )
      .then((json) => {
        if (json.code === Status_Code.SEMESTER_EXISTS_BUDGET) {
          message.error(t('该学期存在预算，不能删除!'))
          throw new Error(t('该学期存在预算，不能删除!'))
        }
        if (json.code === Status_Code.SEMESTER_NOT_EXISTS) {
          message.error(t('学期不存在！'))
          throw new Error(t('学期不存在！'))
        }
        if (json) {
          message.success(t('删除成功'))
          this.fetchListTerm()
        }
        return json
      })
      .catch(() => {
        this.fetchListTerm()
      })
  }

  fetchListTerm() {
    return ListSemester({
      paging: { limit: 999 },
    }).then((json) => {
      this.termList = _.sortBy(
        _.map(json.response.semesters, (item) => {
          return {
            ...item,
            isEditing: false,
          }
        }),
        ['year'],
      ).reverse()
      return json
    })
  }

  fetchUpdateTerm(index: number) {
    const req = _.omit(this.termList[index], ['isEditing'])
    return UpdateSemester(
      {
        semester: req,
      },
      [Status_Code.SEMESTER_TIME_OVERLAP, Status_Code.SEMESTER_NOT_EXISTS],
    ).then((json) => {
      if (json.code === Status_Code.SEMESTER_TIME_OVERLAP) {
        message.error(t('学期期间不能有交集，请重新选择!'))
        throw new Error(t('学期期间不能有交集，请重新选择!'))
      }
      if (json.code === Status_Code.SEMESTER_NOT_EXISTS) {
        message.error(t('学期不存在！'))
        throw new Error(t('学期不存在!'))
      }
      return json
    })
  }
}

export default new Store()
