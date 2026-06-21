// 统一的配色与样式常量，给孩子用，柔和清爽

import type { Subject } from './types';

export const colors = {
  bg: '#F6F8FC',
  card: '#FFFFFF',
  primary: '#4C7DF0',
  primaryDark: '#3A63C7',
  accent: '#FF8A5B',
  text: '#1F2933',
  subtext: '#6B7785',
  border: '#E4E9F2',
  success: '#3BB273',
  danger: '#E55C5C',
  warning: '#F0A93A',
};

// 每个科目一个颜色标签，方便一眼区分
export const subjectColors: Record<Subject, string> = {
  语文: '#E55C5C',
  数学: '#4C7DF0',
  英语: '#3BB273',
  物理: '#7C5CFF',
  化学: '#F0A93A',
  生物: '#2BB3B3',
  历史: '#B5694A',
  地理: '#3A9D5D',
  政治: '#C0497B',
  其他: '#6B7785',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};
