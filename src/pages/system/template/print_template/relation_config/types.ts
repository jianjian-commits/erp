interface HeaderInfoProps {
  label: string
  value: string
}

interface HeaderProps {
  infos: HeaderInfoProps[]
  isModify: boolean
  onModify: () => void
  onCancel: () => void
  onSave: () => void
}

export type { HeaderProps, HeaderInfoProps }
