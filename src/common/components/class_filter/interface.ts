export interface LevelList {
  value: string
  text: string
  children?: LevelList[]
}

export interface RelationData {
  schoolIdMapClassIds: { [key: string]: string[] }
}

export interface SelectedOption {
  school_ids: string[]
  class_ids: string[]
}
export interface ClassFilterProps {
  selected: SelectedOption
  onChange: (
    value: SelectedOption,
    /**
     * key 是学校的customer_id
     * [] 数组是这个学校所有班级的customer_id
     * 用处: 用于班级筛选的时候，用户只选择学校的情况，根据学校的customer_id，
     * 去找到这间学校下的所有班级的customer_id
     */
    schoolIdMapClassIds?: { [key: string]: string[] },
  ) => void
}
