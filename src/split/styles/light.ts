import type { Theme } from '../../_mixins'
import type { ThemeCommonVars } from '../../_styles/common'
import { commonLight } from '../../_styles/common'

export function self(vars: ThemeCommonVars) {
  const { primaryColorHover, borderColor } = vars
  return {
    resizableTriggerColorHover: primaryColorHover,
    resizableTriggerColor: borderColor
  }
}

export type SplitThemeVars = ReturnType<typeof self>

const themeLight: Theme<'Split', SplitThemeVars> = {
  name: 'Split',
  common: commonLight,
  self
}

export default themeLight
export type SplitTheme = typeof themeLight
