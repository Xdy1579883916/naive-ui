import type { ExtractPublicPropTypes, MaybeArray } from '../../_utils'
import type { ColorPickerTheme } from '../styles'
import type {
  OnClear,
  OnUpdateValue,
  OnUpdateValueImpl,
  RenderLabel
} from './interface'
import type { ColorPickerMode } from './utils'
import {
  hsl2hsv,
  hsl2rgb,
  type HSLA,
  hsla,
  hsv2hsl,
  hsv2rgb,
  type HSVA,
  hsva,
  rgb2hsl,
  rgb2hsv,
  type RGBA,
  rgba,
  toHexaString,
  toHexString,
  toHslaString,
  toHslString,
  toHsvaString,
  toHsvString,
  toRgbaString,
  toRgbString
} from 'seemly'
import { useMergedState } from 'vooks'
import {
  computed,
  type CSSProperties,
  defineComponent,
  h,
  nextTick,
  type PropType,
  provide,
  type Ref,
  ref,
  type SlotsType,
  toRef,
  type VNode,
  watchEffect
} from 'vue'
import {
  type ThemeProps,
  useConfig,
  useFormItem,
  useLocale,
  useTheme,
  useThemeClass
} from '../../_mixins'
import { call, createKey } from '../../_utils'
import { NButton } from '../../button'
import { colorPickerLight } from '../styles'
import AlphaSlider from './AlphaSlider'
import ColorInput from './ColorInput'
import ColorPickerSwatches from './ColorPickerSwatches'
import ColorPreview from './ColorPreview'
import { colorPickerInjectionKey } from './context'
import HueSlider from './HueSlider'
import Pallete from './Pallete'
import style from './styles/index.cssr'
import { deriveDefaultValue, getModeFromValue } from './utils'

export const colorPickerPanelProps = {
  ...(useTheme.props as ThemeProps<ColorPickerTheme>),
  value: String as PropType<string | null>,
  defaultValue: String as PropType<string | null>,
  modes: {
    type: Array as PropType<ColorPickerMode[]>,
    // no hsva by default since browser doesn't support it
    default: () => ['rgb', 'hex', 'hsl']
  },
  showAlpha: {
    type: Boolean,
    default: true
  },
  showPreview: Boolean,
  swatches: Array as PropType<string[]>,
  disabled: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined
  },
  actions: {
    type: Array as PropType<Array<'clear'>>,
    default: null
  },
  internalActions: Array as PropType<ReadonlyArray<'redo' | 'undo'>>,
  size: String as PropType<'small' | 'medium' | 'large'>,
  renderLabel: Function as PropType<RenderLabel>,
  onComplete: Function as PropType<OnUpdateValue>,
  onClear: Function as PropType<OnClear>,
  onUpdateShow: [Function, Array] as PropType<
    MaybeArray<(value: boolean) => void>
  >,
  'onUpdate:value': [Function, Array] as PropType<MaybeArray<OnUpdateValue>>,
  onUpdateValue: [Function, Array] as PropType<MaybeArray<OnUpdateValue>>
} as const

export type ColorPickerPanelProps = ExtractPublicPropTypes<
  typeof colorPickerPanelProps
>

export interface ColorPickerPanelSlots {
  swatchTop?: () => VNode[]
  action?: () => VNode[]
}

export default defineComponent({
  name: 'ColorPickerPanel',
  props: colorPickerPanelProps,
  slots: Object as SlotsType<ColorPickerPanelSlots>,
  setup(props, { slots }) {
    let upcomingValue: string | null = null

    const formItem = useFormItem(props)
    const { mergedSizeRef } = formItem
    const { localeRef } = useLocale('global')
    const { mergedClsPrefixRef, inlineThemeDisabled } = useConfig(props)

    const themeRef = useTheme(
      'ColorPicker',
      '-color-picker',
      style,
      colorPickerLight,
      props,
      mergedClsPrefixRef
    )

    provide(colorPickerInjectionKey, {
      themeRef,
      renderLabelRef: toRef(props, 'renderLabel'),
      colorPickerSlots: slots
    })

    const { defaultValue } = props
    const uncontrolledValueRef = ref(
      defaultValue === undefined
        ? deriveDefaultValue(props.modes, props.showAlpha)
        : defaultValue
    )
    const mergedValueRef = useMergedState(
      toRef(props, 'value'),
      uncontrolledValueRef
    )

    const undoStackRef: Ref<Array<string | null>> = ref([mergedValueRef.value])
    const valueIndexRef = ref(0)

    const valueModeRef = computed(() => getModeFromValue(mergedValueRef.value))

    const { modes } = props
    const displayedModeRef = ref<ColorPickerMode>(
      getModeFromValue(mergedValueRef.value) || modes[0] || 'rgb'
    )

    function handleUpdateDisplayedMode(): void {
      const { modes } = props
      const { value: displayedMode } = displayedModeRef
      const currentModeIndex = modes.findIndex(mode => mode === displayedMode)
      if (~currentModeIndex) {
        displayedModeRef.value = modes[(currentModeIndex + 1) % modes.length]
      }
      else {
        displayedModeRef.value = 'rgb'
      }
    }

    let _h: number, // avoid conflict with render function's h
      s: number,
      l: number,
      v: number,
      r: number,
      g: number,
      b: number,
      a: number

    const hsvaRef = computed<HSVA | null>(() => {
      const { value: mergedValue } = mergedValueRef
      if (!mergedValue)
        return null
      switch (valueModeRef.value!) {
        case 'hsv':
          return hsva(mergedValue)
        case 'hsl':
          ;[_h, s, l, a] = hsla(mergedValue)
          return [...hsl2hsv(_h, s, l), a]
        case 'rgb':
        case 'hex':
          ;[r, g, b, a] = rgba(mergedValue)
          return [...rgb2hsv(r, g, b), a]
      }
    })

    const rgbaRef = computed<RGBA | null>(() => {
      const { value: mergedValue } = mergedValueRef
      if (!mergedValue)
        return null
      switch (valueModeRef.value!) {
        case 'rgb':
        case 'hex':
          return rgba(mergedValue)
        case 'hsv':
          ;[_h, s, v, a] = hsva(mergedValue)
          return [...hsv2rgb(_h, s, v), a]
        case 'hsl':
          ;[_h, s, l, a] = hsla(mergedValue)
          return [...hsl2rgb(_h, s, l), a]
      }
    })

    const hslaRef = computed<HSLA | null>(() => {
      const { value: mergedValue } = mergedValueRef
      if (!mergedValue)
        return null
      switch (valueModeRef.value!) {
        case 'hsl':
          return hsla(mergedValue)
        case 'hsv':
          ;[_h, s, v, a] = hsva(mergedValue)
          return [...hsv2hsl(_h, s, v), a]
        case 'rgb':
        case 'hex':
          ;[r, g, b, a] = rgba(mergedValue)
          return [...rgb2hsl(r, g, b), a]
      }
    })

    const mergedValueArrRef = computed(() => {
      switch (displayedModeRef.value) {
        case 'rgb':
        case 'hex':
          return rgbaRef.value
        case 'hsv':
          return hsvaRef.value
        case 'hsl':
          return hslaRef.value
      }
    })

    const displayedHueRef = ref<number>(0)
    const displayedAlphaRef = ref<number>(1)
    const displayedSvRef = ref<[number, number]>([0, 0])

    function handleUpdateSv(s: number, v: number): void {
      const { value: hsvaArr } = hsvaRef
      const hue = displayedHueRef.value
      const alpha = hsvaArr ? hsvaArr[3] : 1
      displayedSvRef.value = [s, v]
      const { showAlpha } = props
      switch (displayedModeRef.value) {
        case 'hsv':
          doUpdateValue(
            (showAlpha ? toHsvaString : toHsvString)([hue, s, v, alpha]),
            'cursor'
          )
          break
        case 'hsl':
          doUpdateValue(
            (showAlpha ? toHslaString : toHslString)([
              ...hsv2hsl(hue, s, v),
              alpha
            ]),
            'cursor'
          )
          break
        case 'rgb':
          doUpdateValue(
            (showAlpha ? toRgbaString : toRgbString)([
              ...hsv2rgb(hue, s, v),
              alpha
            ]),
            'cursor'
          )
          break
        case 'hex':
          doUpdateValue(
            (showAlpha ? toHexaString : toHexString)([
              ...hsv2rgb(hue, s, v),
              alpha
            ]),
            'cursor'
          )
          break
      }
    }

    function handleUpdateHue(hue: number): void {
      displayedHueRef.value = hue
      const { value: hsvaArr } = hsvaRef
      if (!hsvaArr) {
        return
      }
      const [, s, v, a] = hsvaArr
      const { showAlpha } = props
      switch (displayedModeRef.value) {
        case 'hsv':
          doUpdateValue(
            (showAlpha ? toHsvaString : toHsvString)([hue, s, v, a]),
            'cursor'
          )
          break
        case 'rgb':
          doUpdateValue(
            (showAlpha ? toRgbaString : toRgbString)([
              ...hsv2rgb(hue, s, v),
              a
            ]),
            'cursor'
          )
          break
        case 'hex':
          doUpdateValue(
            (showAlpha ? toHexaString : toHexString)([
              ...hsv2rgb(hue, s, v),
              a
            ]),
            'cursor'
          )
          break
        case 'hsl':
          doUpdateValue(
            (showAlpha ? toHslaString : toHslString)([
              ...hsv2hsl(hue, s, v),
              a
            ]),
            'cursor'
          )
          break
      }
    }

    function handleUpdateAlpha(alpha: number): void {
      switch (displayedModeRef.value) {
        case 'hsv':
          ;[_h, s, v] = hsvaRef.value!
          doUpdateValue(toHsvaString([_h, s, v, alpha]), 'cursor')
          break
        case 'rgb':
          ;[r, g, b] = rgbaRef.value!
          doUpdateValue(toRgbaString([r, g, b, alpha]), 'cursor')
          break
        case 'hex':
          ;[r, g, b] = rgbaRef.value!
          doUpdateValue(toHexaString([r, g, b, alpha]), 'cursor')
          break
        case 'hsl':
          ;[_h, s, l] = hslaRef.value!
          doUpdateValue(toHslaString([_h, s, l, alpha]), 'cursor')
          break
      }
      displayedAlphaRef.value = alpha
    }

    function doUpdateValue(
      value: string | null,
      updateSource: 'cursor' | 'input'
    ): void {
      if (updateSource === 'cursor') {
        upcomingValue = value
      }
      else {
        upcomingValue = null
      }
      const { nTriggerFormChange, nTriggerFormInput } = formItem
      const { onUpdateValue, 'onUpdate:value': _onUpdateValue } = props
      if (onUpdateValue)
        call(onUpdateValue as OnUpdateValueImpl, value)
      if (_onUpdateValue)
        call(_onUpdateValue as OnUpdateValueImpl, value)
      nTriggerFormChange()
      nTriggerFormInput()
      uncontrolledValueRef.value = value
    }

    function handleInputUpdateValue(value: string): void {
      doUpdateValue(value, 'input')
      void nextTick(handleComplete)
    }

    function handleComplete(pushStack: boolean = true): void {
      const { value } = mergedValueRef
      // no value & only hue changes will complete with no value
      if (value) {
        const { nTriggerFormChange, nTriggerFormInput } = formItem
        const { onComplete } = props
        if (onComplete) {
          ;(onComplete as OnUpdateValueImpl)(value)
        }
        const { value: undoStack } = undoStackRef
        const { value: valueIndex } = valueIndexRef
        if (pushStack) {
          undoStack.splice(valueIndex + 1, undoStack.length, value)
          valueIndexRef.value = valueIndex + 1
        }
        nTriggerFormChange()
        nTriggerFormInput()
      }
    }

    function undo(): void {
      const { value: valueIndex } = valueIndexRef
      if (valueIndex - 1 < 0)
        return
      doUpdateValue(undoStackRef.value[valueIndex - 1], 'input')
      handleComplete(false)
      valueIndexRef.value = valueIndex - 1
    }

    function redo(): void {
      const { value: valueIndex } = valueIndexRef
      if (valueIndex < 0 || valueIndex + 1 >= undoStackRef.value.length)
        return
      doUpdateValue(undoStackRef.value[valueIndex + 1], 'input')
      handleComplete(false)
      valueIndexRef.value = valueIndex + 1
    }

    function handleClear(): void {
      doUpdateValue(null, 'input')
      const { onClear } = props
      if (onClear) {
        onClear()
      }
    }

    const undoableRef = computed(() => valueIndexRef.value >= 1)
    const redoableRef = computed(() => {
      const { value: undoStack } = undoStackRef
      return undoStack.length > 1 && valueIndexRef.value < undoStack.length - 1
    })

    watchEffect(() => {
      if (upcomingValue && upcomingValue === mergedValueRef.value) {
        // let it works in uncontrolled mode
      }
      else {
        const { value } = hsvaRef
        if (value) {
          displayedHueRef.value = value[0]
          displayedAlphaRef.value = value[3]
          displayedSvRef.value = [value[1], value[2]]
        }
      }
      upcomingValue = null
    })

    const cssVarsRef = computed(() => {
      const { value: mergedSize } = mergedSizeRef
      const {
        common: { cubicBezierEaseInOut },
        self: {
          textColor,
          color,
          panelFontSize,
          boxShadow,
          border,
          borderRadius,
          dividerColor,
          [createKey('height', mergedSize)]: height,
          [createKey('fontSize', mergedSize)]: fontSize
        }
      } = themeRef.value
      return {
        '--n-bezier': cubicBezierEaseInOut,
        '--n-text-color': textColor,
        '--n-color': color,
        '--n-panel-font-size': panelFontSize,
        '--n-font-size': fontSize,
        '--n-box-shadow': boxShadow,
        '--n-border': border,
        '--n-border-radius': borderRadius,
        '--n-height': height,
        '--n-divider-color': dividerColor
      }
    })
    const themeClassHandle = inlineThemeDisabled
      ? useThemeClass(
          'color-picker',
          computed(() => {
            return mergedSizeRef.value[0]
          }),
          cssVarsRef,
          props
        )
      : undefined

    function renderPanel(): VNode {
      const { value: rgba } = rgbaRef
      const { value: displayedHue } = displayedHueRef
      const { internalActions, modes, actions } = props
      const { value: mergedTheme } = themeRef
      const { value: mergedClsPrefix } = mergedClsPrefixRef
      return (
        <div
          class={[
            `${mergedClsPrefix}-color-picker-panel`,
            themeClassHandle?.themeClass.value
          ]}
          onDragstart={(e) => {
            e.preventDefault()
          }}
          style={
            inlineThemeDisabled
              ? undefined
              : (cssVarsRef.value as CSSProperties)
          }
        >
          <div class={`${mergedClsPrefix}-color-picker-control`}>
            <Pallete
              clsPrefix={mergedClsPrefix}
              rgba={rgba}
              displayedHue={displayedHue}
              displayedSv={displayedSvRef.value}
              onUpdateSV={handleUpdateSv}
              onComplete={handleComplete}
            />
            <div class={`${mergedClsPrefix}-color-picker-preview`}>
              <div class={`${mergedClsPrefix}-color-picker-preview__sliders`}>
                <HueSlider
                  clsPrefix={mergedClsPrefix}
                  hue={displayedHue}
                  onUpdateHue={handleUpdateHue}
                  onComplete={handleComplete}
                />
                {props.showAlpha ? (
                  <AlphaSlider
                    clsPrefix={mergedClsPrefix}
                    rgba={rgba}
                    alpha={displayedAlphaRef.value}
                    onUpdateAlpha={handleUpdateAlpha}
                    onComplete={handleComplete}
                  />
                ) : null}
              </div>
              {props.showPreview ? (
                <ColorPreview
                  clsPrefix={mergedClsPrefix}
                  mode={displayedModeRef.value}
                  color={rgbaRef.value && toHexString(rgbaRef.value)}
                  onUpdateColor={(color) => {
                    doUpdateValue(color, 'input')
                  }}
                />
              ) : null}
            </div>
            <ColorInput
              clsPrefix={mergedClsPrefix}
              showAlpha={props.showAlpha}
              mode={displayedModeRef.value}
              modes={modes}
              onUpdateMode={handleUpdateDisplayedMode}
              value={mergedValueRef.value}
              valueArr={mergedValueArrRef.value}
              onUpdateValue={handleInputUpdateValue}
            />
            {slots.swatchTop ? (
              <div
                class={`${mergedClsPrefix}-color-picker-swatch-top`}
                style={{
                  marginTop: '10px'
                }}
              >
                {{ default: slots.swatchTop }}
              </div>
            ) : null}
            {props.swatches?.length && (
              <ColorPickerSwatches
                clsPrefix={mergedClsPrefix}
                mode={displayedModeRef.value}
                swatches={props.swatches}
                onUpdateColor={(color) => {
                  doUpdateValue(color, 'input')
                }}
              />
            )}
          </div>
          {actions?.length ? (
            <div class={`${mergedClsPrefix}-color-picker-action`}>
              {actions.includes('clear') && (
                <NButton
                  size="small"
                  onClick={handleClear}
                  disabled={!mergedValueRef.value}
                  theme={mergedTheme.peers.Button}
                  themeOverrides={mergedTheme.peerOverrides.Button}
                >
                  {{ default: () => localeRef.value.clear }}
                </NButton>
              )}
            </div>
          ) : null}
          {slots.action ? (
            <div class={`${mergedClsPrefix}-color-picker-action`}>
              {{ default: slots.action }}
            </div>
          ) : internalActions ? (
            <div class={`${mergedClsPrefix}-color-picker-action`}>
              {internalActions.includes('undo') && (
                <NButton
                  size="small"
                  onClick={undo}
                  disabled={!undoableRef.value}
                  theme={mergedTheme.peers.Button}
                  themeOverrides={mergedTheme.peerOverrides.Button}
                >
                  {{ default: () => localeRef.value.undo }}
                </NButton>
              )}
              {internalActions.includes('redo') && (
                <NButton
                  size="small"
                  onClick={redo}
                  disabled={!redoableRef.value}
                  theme={mergedTheme.peers.Button}
                  themeOverrides={mergedTheme.peerOverrides.Button}
                >
                  {{ default: () => localeRef.value.redo }}
                </NButton>
              )}
            </div>
          ) : null}
        </div>
      )
    }

    return {
      renderPanel,
      onRender: themeClassHandle?.onRender
    }
  },
  render() {
    const { onRender } = this
    onRender?.()
    return this.renderPanel()
  }
})
