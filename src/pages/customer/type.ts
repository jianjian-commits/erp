// eslint-disable-next-line @typescript-eslint/class-name-casing
export interface levelList {
  value: string
  text: string
  children?: levelList[]
}

export interface GroupOptions {
  title: string
}

export interface ClassGroupItemOptions {
  title: string
  group: GroupOptions
  active: boolean
  onMore(): void
  onClick(): void
  index: number
  popup(): void
}

export interface ClassGroupOptions {
  className?: string
  active: number
  popup(): void
  onMore(group: object, index: number): void
  onChange(index: number): void | Promise<void>
  group: GroupOptions[]
}

interface PagingRequest {
  offset?: number
  limit?: number
  need_count?: boolean
}
export interface CustomerRequestParams {
  paging: PagingRequest
}
export interface DefaultMealCount {
  id: string
  name: string
  count: number
}
