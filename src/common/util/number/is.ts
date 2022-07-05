/*
 * @Description: 校验数字相关，以is开头
 */
/**
 * @description: 校验非数字开头
 */
export const isNotBeginWithNumber = (str: string) => {
  return /^[^0-9]+$/.test(str + '')
}

/**
 * @description: 是否全为数字组合
 */
export function isNumberCombination(input: string | number | null | undefined) {
  return /^[0-9]+$/.test(input + '')
}
