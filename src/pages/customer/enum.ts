import { t } from 'gm-i18n'
import { SemesterType, SchoolType } from 'gm_api/src/enterprise'

export interface options {
  value: number | string
  text: string
}

interface ObjectOfKey<T> {
  [key: number]: T
  [key: string]: T
}

const CreditTypeSelect: options[] = [
  { value: 3, text: t('日结') },
  { value: 4, text: t('周结') },
  { value: 5, text: t('月结') },
]
const CreditType: options[] = [
  { value: 0, text: t('全部') },
  ...CreditTypeSelect,
]

const FrozenType: options[] = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('已冻结') },
  { value: 2, text: t('未冻结') },
]
const WhitelistType: options[] = [
  { value: 0, text: t('全部') },
  { value: 1, text: t('开启') },
  { value: 2, text: t('关闭') },
]

const SXM_MAP: ObjectOfKey<string> = {
  0: t('男'),
  1: t('女'),
}

const InvoiceType: options[] = [
  { value: 0, text: t('开具发票') },
  { value: 1, text: t('不开发票') },
]

const TERM_OPTIONS_TYPE = [
  { value: SemesterType.SEMESTER_TYPE_SPRING, label: t('春季学期') },
  { value: SemesterType.SEMESTER_TYPE_FALL, label: t('秋季学期') },
]

const TERM_OPTIONS_TYPE_MAP: ObjectOfKey<string> = {
  [SemesterType.SEMESTER_TYPE_SPRING]: t('春季学期'),
  [SemesterType.SEMESTER_TYPE_FALL]: t('秋季学期'),
}

const SELECT_SCHOOL_TYPE = [
  { value: SchoolType.SCHOOL_TYPE_UNSPECIFIED, label: t('未选择类型') },
  { value: SchoolType.SCHOOL_TYPE_KINDERGARTEN, label: t('幼儿园') },
  { value: SchoolType.SCHOOL_TYPE_PRE_SCHOOL, label: t('学前班') },
  { value: SchoolType.SCHOOL_TYPE_PRIMARY_SCHOOL, label: t('小学') },
  { value: SchoolType.SCHOOL_TYPE_MIDDLE_SCHOOL, label: t('中学') },
]

const SELECT_SCHOOL_TYPE_MAP: ObjectOfKey<string> = {
  [SchoolType.SCHOOL_TYPE_UNSPECIFIED]: t('未选择类型'),
  [SchoolType.SCHOOL_TYPE_KINDERGARTEN]: t('幼儿园'),
  [SchoolType.SCHOOL_TYPE_PRE_SCHOOL]: t('学前班'),
  [SchoolType.SCHOOL_TYPE_PRIMARY_SCHOOL]: t('小学'),
  [SchoolType.SCHOOL_TYPE_MIDDLE_SCHOOL]: t('中学'),
}

export {
  FrozenType,
  WhitelistType,
  CreditType,
  CreditTypeSelect,
  SXM_MAP,
  InvoiceType,
  TERM_OPTIONS_TYPE_MAP,
  TERM_OPTIONS_TYPE,
  SELECT_SCHOOL_TYPE,
  SELECT_SCHOOL_TYPE_MAP,
}
