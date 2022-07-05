import { createElement } from 'react'
import { ACTION } from '../enum'
import { CalcBtnConfig } from '../types'
import Backspace from '@/svg/backspace.svg'
import { t } from 'gm-i18n'

const OPERATOR_BUTTON: Record<string, CalcBtnConfig> = {
  '0': { content: '0', textBoxValue: '0', value: '0' },
  '1': { content: '1', textBoxValue: '1', value: '1' },
  '2': { content: '2', textBoxValue: '2', value: '2' },
  '3': { content: '3', textBoxValue: '3', value: '3' },
  '4': { content: '4', textBoxValue: '4', value: '4' },
  '5': { content: '5', textBoxValue: '5', value: '5' },
  '6': { content: '6', textBoxValue: '6', value: '6' },
  '7': { content: '7', textBoxValue: '7', value: '7' },
  '8': { content: '8', textBoxValue: '8', value: '8' },
  '9': { content: '9', textBoxValue: '9', value: '9' },
  '-': { content: '-', textBoxValue: '-', value: '-' },
  '+': { content: '+', textBoxValue: '+', value: '+' },
  '*': { content: '×', textBoxValue: '×', value: '*' },
  '/': { content: '÷', textBoxValue: '÷', value: '/' },
  '(': { content: '(', textBoxValue: '(', value: '(' },
  ')': { content: ')', textBoxValue: ')', value: ')' },
  '.': { content: '.', textBoxValue: '.', value: '.' },
}

const ACTION_BUTTON: Record<'BACKSPACE' | 'CLEAR' | 'DONE', CalcBtnConfig> = {
  BACKSPACE: {
    content: createElement(Backspace, {
      style: {
        height: '1em',
        width: '1em',
        fontSize: '24px',
      },
    }),
    style: { padding: 0 },
    textBoxValue: '',
    value: ACTION.BACKSPACE,
    isAction: true,
  },
  CLEAR: {
    content: t('清空'),
    textBoxValue: '',
    value: ACTION.CLEAR,
    isAction: true,
  },
  DONE: {
    content: t('完成'),
    textBoxValue: '',
    value: ACTION.DONE,
    isAction: true,
    style: { backgroundColor: '#0363ff', color: '#fff' },
  },
}

export { OPERATOR_BUTTON, ACTION_BUTTON }
