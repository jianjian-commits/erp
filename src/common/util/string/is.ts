/*
 * @Description: 校验字符串util，以is开头
 */

/**
 * 判断string是否有值，‘0’也是空
 * @param str string
 */
export const isStringValid = (str?: string) => {
  return str && str !== '0'
}
