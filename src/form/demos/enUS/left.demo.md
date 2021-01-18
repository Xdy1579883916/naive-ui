# Label Placement Left

```html
<n-radio-group
  v-model:value="size"
  name="left-size"
  style="margin-bottom: 12px;"
>
  <n-radio-button value="small">Small</n-radio-button>
  <n-radio-button value="medium">Medium</n-radio-button>
  <n-radio-button value="large">Large</n-radio-button>
</n-radio-group>
<n-form
  :model="model"
  :rules="rules"
  ref="form"
  label-placement="left"
  label-align="right"
  :size="size"
  :label-width="160"
  :style="{
    maxWidth: '640px'
  }"
>
  <n-form-item-row label="Input" path="inputValue">
    <n-input placeholder="Input" v-model:value="model.inputValue" />
  </n-form-item-row>
  <n-form-item-row label="Textarea" path="textareaValue">
    <n-input
      placeholder="Textarea"
      v-model:value="model.textareaValue"
      type="textarea"
      :autosize="{
        minRows: 3,
        maxRows: 5
      }"
    />
  </n-form-item-row>
  <n-form-item-row label="Select" path="selectValue">
    <n-select
      placeholder="Select"
      :options="generalOptions"
      v-model:value="model.selectValue"
    />
  </n-form-item-row>
  <n-form-item-row label="Multiple Select" path="multipleSelectValue">
    <n-select
      placeholder="Select"
      :options="generalOptions"
      v-model:value="model.multipleSelectValue"
      multiple
    />
  </n-form-item-row>
  <n-form-item-row label="Datetime" path="datetimeValue">
    <n-date-picker type="datetime" v-model:value="model.datetimeValue" />
  </n-form-item-row>
  <n-form-item-row label="Switch" path="switchValue">
    <n-switch v-model:value="model.switchValue" />
  </n-form-item-row>
  <n-form-item-row label="Checkbox Group" path="checkboxGroupValue">
    <n-checkbox-group v-model:value="model.checkboxGroupValue">
      <n-space>
        <n-checkbox value="Option 1">Option 1</n-checkbox>
        <n-checkbox value="Option 2">Option 2</n-checkbox>
        <n-checkbox value="Option 3">Option 3</n-checkbox>
      </n-space>
    </n-checkbox-group>
  </n-form-item-row>
  <n-form-item-row label="Radio Group" path="radioGroupValue">
    <n-radio-group v-model:value="model.radioGroupValue" name="radiogroup1">
      <n-space>
        <n-radio value="Radio 1">Radio 1</n-radio>
        <n-radio value="Radio 2">Radio 2</n-radio>
        <n-radio value="Radio 3">Radio 3</n-radio>
      </n-space>
    </n-radio-group>
  </n-form-item-row>
  <n-form-item-row label="Radio Button Group" path="radioGroupValue">
    <n-radio-group v-model:value="model.radioGroupValue" name="radiogroup2">
      <n-radio-button value="Radio 1">Radio 1</n-radio-button>
      <n-radio-button value="Radio 2">Radio 2</n-radio-button>
      <n-radio-button value="Radio 3">Radio 3</n-radio-button>
    </n-radio-group>
  </n-form-item-row>
  <n-form-item-row label="Input Number" path="inputNumberValue">
    <n-input-number v-model:value="model.inputNumberValue" />
  </n-form-item-row>
  <n-form-item-row label="Time Picker" path="timePickerValue">
    <n-time-picker v-model:value="model.timePickerValue" />
  </n-form-item-row>
  <n-form-item-row label="Slider" path="sliderValue">
    <n-slider v-model:value="model.sliderValue" :step="5" />
  </n-form-item-row>
  <n-form-item-row label="Transfer" path="transferValue">
    <n-transfer v-model:value="model.transferValue" :options="generalOptions" />
  </n-form-item-row>
  <n-form-item-row :gutter="[28, 0]" label="Nested Path">
    <n-row :gutter="[28, 0]">
      <n-form-item-col :span="12" path="nestedValue.path1">
        <n-input
          placeholder="Nested Path 1"
          v-model:value="model.nestedValue.path1"
        />
      </n-form-item-col>
      <n-form-item-col :span="12" path="nestedValue.path2">
        <n-select
          placeholder="Nested Path 2"
          :options="generalOptions"
          v-model:value="model.nestedValue.path2"
        />
      </n-form-item-col>
    </n-row>
  </n-form-item-row>
  <n-row>
    <n-col :span="24">
      <div style="display: flex; justify-content: flex-end;">
        <n-button @click="handleValidateButtonClick" round type="primary"
          >Validate</n-button
        >
      </div>
    </n-col>
  </n-row>
</n-form>

<pre>
{{  JSON.stringify(model, 0, 2) }}
</pre>
```

```js
export default {
  inject: ['message'],
  data () {
    return {
      size: 'medium',
      model: {
        inputValue: null,
        textareaValue: null,
        selectValue: null,
        multipleSelectValue: null,
        datetimeValue: null,
        nestedValue: {
          path1: null,
          path2: null
        },
        switchValue: false,
        checkboxGroupValue: null,
        radioGroupValue: null,
        radioButtonGroupValue: null,
        inputNumberValue: null,
        timePickerValue: null,
        sliderValue: 0,
        transferValue: null
      },
      generalOptions: ['groode', 'veli good', 'emazing', 'lidiculous'].map(
        (v) => ({
          label: v,
          value: v
        })
      ),
      rules: {
        inputValue: {
          required: true,
          trigger: ['blur', 'input'],
          message: 'Please input inputValue'
        },
        textareaValue: {
          required: true,
          trigger: ['blur', 'input'],
          message: 'Please input textareaValue'
        },
        selectValue: {
          required: true,
          trigger: ['blur', 'change'],
          message: 'Please select selectValue'
        },
        multipleSelectValue: {
          type: 'array',
          required: true,
          trigger: ['blur', 'change'],
          message: 'Please select multipleSelectValue'
        },
        datetimeValue: {
          type: 'number',
          required: true,
          trigger: ['blur', 'change'],
          message: 'Please input datetimeValue'
        },
        nestedValue: {
          path1: {
            required: true,
            trigger: ['blur', 'input'],
            message: 'Please input nestedValue.path1'
          },
          path2: {
            required: true,
            trigger: ['blur', 'change'],
            message: 'Please input nestedValue.path2'
          }
        },
        checkboxGroupValue: {
          type: 'array',
          required: true,
          trigger: 'change',
          message: 'Please select checkboxGroupValue'
        },
        radioGroupValue: {
          required: true,
          trigger: 'change',
          message: 'Please select radioGroupValue'
        },
        radioButtonGroupValue: {
          required: true,
          trigger: 'change',
          message: 'Please select radioButtonGroupValue'
        },
        inputNumberValue: {
          type: 'number',
          required: true,
          trigger: ['blur', 'change'],
          message: 'Please input inputNumberValue'
        },
        timePickerValue: {
          type: 'number',
          required: true,
          trigger: ['blur', 'change'],
          message: 'Please input timePickerValue'
        },
        sliderValue: 0,
        transferValue: {
          type: 'array',
          required: true,
          trigger: 'change',
          message: 'Please input transferValue'
        }
      }
    }
  },
  methods: {
    handleValidateButtonClick (e) {
      e.preventDefault()
      this.$refs.form.validate((errors) => {
        if (!errors) {
          this.message.success('Valid')
        } else {
          console.log(errors)
          this.message.error('Invalid')
        }
      })
    }
  }
}
```