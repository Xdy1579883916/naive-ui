<markdown>
# panel 用法

某些情况下你或许只需要显示一个颜色选择器面板，而不是一个完整的颜色选择器。
</markdown>

<script setup>
import { ref } from 'vue'

const color = ref('#f40')

const options = [
  {
    label: '文档颜色',
    key: 'doc'
  },
  {
    label: '预设',
    key: 'preset'
  }
]
</script>

<template>
  <span> {{ color }} </span>
  <div style="display: flex; flex-direction: row; gap: 12px">
    <div>
      <NColorPickerPanel v-model:value="color" />
    </div>
    <div>
      <NColorPickerPanel
        v-model:value="color"
        :modes="['rgb']"
        :show-alpha="false"
        :show-preview="false"
      />
    </div>
  </div>

  <div>
    <NColorPickerPanel
      v-model:value="color"
      :swatches="[
        '#FFFFFF',
        '#18A058',
        '#2080F0',
        '#F0A020',
        'rgba(208, 48, 80, 1)',
      ]"
    >
      <template #swatchTop>
        <NDropdown :options="options">
          <NButton size="tiny">
            文档颜色
          </NButton>
        </NDropdown>
      </template>
    </NColorPickerPanel>
  </div>
</template>
