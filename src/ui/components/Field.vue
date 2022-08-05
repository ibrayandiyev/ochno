<template>
  <div class="field" :class="classes">
    <template v-if="type === 'select'">
      <el-select
        v-model="model"
        :multiple="multiple"
        :disabled="disabled"
        :clearable="clearable"
        :collapse-tags="multiple"
        placeholder=" "
        :filterable="allowCreate || filterable"
        :allow-create="allowCreate"
        :default-first-option="allowCreate"
        :no-match-text="$t('No match')"
        :no-data-text="$t('No values')"
        :popper-class="popperClass"
        class="field-input"
        :class="inputClass"
        :autocomplete="autoComplete"
        @focus="handleFocus"
        @visible-change="$event ? handleFocus() : handleBlur()"
        @change="handleInput"
        @keyup="handleKeyUp"
      >
        <slot name="options">
          <el-option v-for="option in options" :key="option" :label="option" :value="option" />
        </slot>
      </el-select>
    </template>

    <template v-else-if="type === 'textarea'">
      <textarea
        v-model="model"
        :disabled="disabled"
        class="field-input"
        :class="inputClass"
        :autocomplete="autoComplete"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keyup="handleKeyUp"
      />
      <div class="textarea-size">{{ model }}</div>
    </template>

    <template v-else>
      <input
        v-model="model"
        :type="type"
        :min="min"
        :max="max"
        :disabled="disabled"
        class="field-input"
        :class="inputClass"
        :autocomplete="autoComplete"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keyup="handleKeyUp"
      >
    </template>

    <label class="field-label absolute-cover centered">
      <div class="field-label-overflow">
        <slot>{{ label }}</slot>
      </div>
    </label>

    <div v-if="icon || message" class="icon-wrapper centered">
      <div v-if="icon === 'loading'" class="icon">
        <Spinner class="inset" />
      </div>
      <div v-else-if="message">
        <el-tooltip placement="top-end" :content="message" :model-value="showTooltip">
          <div class="is-enabled bg-error-heavy font-small2 -circle" @click="showTooltip = !showTooltip">
            <Icon type="error" />
          </div>
        </el-tooltip>
      </div>
      <Icon v-else-if="icon" :type="icon" />
    </div>
  </div>
</template>


<script>
import _ from 'lodash';
import { ref, computed, watchEffect } from 'vue';

export default {
  props: {
    modelValue: { type: [String, Number, Array] }, // The value of the input field.
    message: { type: String, default: '' }, // Display a message (using an error icon).
    label: { type: String, default: '' }, // The text for the label. You can also use the default slot for this.

    type: { type: String, default: 'text' }, // Type of input, can have all the values input element has, as well as 'select'.
    disabled: { type: Boolean, default: false },
    autoComplete: { type: String, default: 'on' },
    inputClass: { type: String, default: '' }, // Class to put on the input field.
    icon: { type: String, default: '' }, // If the icon has the value "loading" it will get a special "spinner" icon.
    throttle: { type: Number, default: 1000 },

    // NOTE: LIMITED TO NUMBER AND DATE TYPES
    min: { type: Number },
    max: { type: Number },

    // NOTE: ONLY FOR SELECT TYPE
    options: { type: Array, default: () => [] }, // The options to pick from in the select dropdown, you can also use the slot named "options".
    multiple: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false }, // If the selected value is clearable.
    filterable: { type: Boolean, default: false }, // If the dropdown is filterable.
    allowCreate: { type: Boolean, default: false }, // If new options can be typed in by user. Automatically sets filterable to true.
    popperClass: { type: String, default: '' }, // Class to put on the select popper.
  },

  emits: ['input:modelValue', 'update:modelValue', 'keyup'],

  setup(props, { slots, emit }) {
    const model = ref(props.modelValue);
    const focused = ref(false);
    const showTooltip = ref(false);

    watchEffect(() => { // Reset value if it changes.
      model.value = props.modelValue;
    });

    watchEffect(() => { // Show tooltip if message changes.
      showTooltip.value = !!props.message;
    });

    return {
      model,
      showTooltip,

      classes: computed(() => ({
        'is-select': props.type === 'select',
        'is-textarea': props.type === 'textarea',
        'is-focused': focused.value,
        'is-disabled': props.disabled,
        'is-filterable': props.allowCreate || props.filterable,
        'has-input': !(_.isNil(model.value) || (_.isNumber(model.value.length) && model.value.length <= 0)), // 0 and false are valid input, but not null, undefined or empty strings/arrays.
        'has-icon': props.icon || props.message,
        'no-label': !props.label && (!slots.default || !slots.default()[0].children),
      })),

      handleFocus() {
        focused.value = true;
      },

      handleBlur() {
        focused.value = false;

        if (props.type === 'number') {
          // The model has to be parsed to a number, since otherwise model will have a string value.
          const number = parseFloat(model.value, 10);
          model.value = _.isNaN(number) ? props.min : _.clamp(number, props.min, props.max);
        }

        emit('update:modelValue', model.value);
      },

      handleInput() {
        if (props.type !== 'number' || !_.isNaN(model.value)) {
          emit('input:modelValue', model.value);
        }
      },

      handleKeyUp(event) {
        if (event.code === 'Enter') {
          event.target.blur();
        }

        emit('keyup', event);
      },
    };
  },
};
</script>


<style scoped lang="less">
// NOTE: This file has one scoped and one not scoped style tag!
@import '../style/mixins';

.field {
  // NOTE: Very similar to .el-date-editor.
  position: relative;
  box-sizing: border-box;
  width: 100%;
  max-width: var(--max-width-field);
  height: var(--field-size);
  line-height: var(--field-size);
  border-radius: calc(var(--field-size) / 2);
  text-align: center;
  white-space: nowrap;
  background-color: var(--rgba-field);
  color: var(--rgba-font-transparent);
  cursor: pointer;
  transition: all var(--transition-duration-input);

  &:hover {
    background-color: var(--rgba-field-hover);
  }
}

.field-input {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0 calc(var(--field-size) / 2.5); // If you change this, change textarea-size as well!
  border: none;
  outline: 0;
  text-align: inherit;
  background: transparent;
  color: inherit;
}

.field-label {
  padding: 0 calc(var(--field-size) / 2);
  white-space: nowrap;
  color: rgba(var(--color-white), var(--opacity-medium-heavy));
  font-weight: 700;
  pointer-events: none;
  transition: all var(--transition-duration-input);
}

.field-label-overflow {
  // The label does not allow for text-overflow manipulation for some reason.
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.icon-wrapper {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: var(--field-size);
  pointer-events: none;
}

.icon {
  animation-timing-function: ease-in-out;
}

// If select type the field-input will change.
.is-select {
  border-radius: calc(var(--field-size) / 3);
  text-align: left;

  .field-label {
    align-items: flex-start;
    padding-right: var(--field-size);
  }
}

// type: textarea
.is-textarea {
  display: grid;
  align-items: stretch;
  height: auto;
}

textarea.field-input,
.textarea-size {
  grid-area: ~'1 / 1';
  padding: calc(var(--field-size) / 3) calc(var(--field-size) / 2.5);
}

textarea {
  resize: none;
  overflow: hidden;

  &.field-input {
    text-align: left;
    padding-bottom: 0; // Necessary for the area to not grow too large.
  }
}

.textarea-size {
  line-height: normal;
  visibility: hidden;
  white-space: pre-line;
  word-break: break-word;
}

// type: select
.is-select:deep(.el-select) { // The el-select will also have the class field-input.
  padding: 0 !important;

  .select-trigger {
    height: inherit;
  }

  .el-input {
    .expand-arrow-pseudo(); // Mixin the arrow to the right in the select field.
    box-sizing: border-box;
    font-size: inherit;
    height: inherit;
    padding: 0 var(--field-size) 0 calc(var(--field-size) / 2);

    &:after {
      right: calc(var(--field-size) / 2.75);
    }
  }

  .el-input__wrapper {
    background-color: transparent !important;
    border: none;
    box-shadow: none !important;
    color: inherit;
  }

  .el-input__inner {
    height: inherit;
    padding: 0;
    border: 0;
    background-color: transparent;
    color: inherit;
    text-overflow: ellipsis;
  }

  .el-input__suffix {
    display: none;
  }

  .el-select__tags {
    box-sizing: border-box;
    left: 0;
    right: 0;
    top: 0;
    height: 100%;
    width: auto !important; // width is set directly to style in component.
    max-width: none !important; // max-width is set directly to style in component.
    padding: 0 var(--field-size) 0 calc(var(--field-size) / 2);
    align-items: stretch;
    line-height: inherit;
    white-space: inherit;
    cursor: pointer;
    transform: none;

    > span {
      display: flex;
    }
  }

  .el-tag {
    font-size: inherit;
    display: flex;
    align-items: center;
    height: 100%;
    line-height: inherit;
    margin: 0;
    padding: 0 1em 0 0;
    border: none;
    border-radius: 0;
    background-color: transparent;
    color: inherit;

    // The second tag should be the amount of extra tags, such as "+ 1".
    &:nth-child(n+2):last-child {
      padding-right: 0;
      letter-spacing: -0.1em; // To make the space between + and the number less spacious.
    }

    .el-icon-close {
      display: none;
    }
  }

  .el-tag__close {
    display: none;
  }

  .el-select__tags-text {
    overflow: visible;
    max-width: unset !important;
  }

  .el-select__input {
    font-size: inherit;
    flex-grow: 1;
    height: 100%;
    margin-left: calc(var(--field-size) / 1.5);
    color: inherit;

    &:first-child {
      margin-left: 0;
    }
  }
}


// States
.has-input {
  color: var(--rgba-font-transparent);

  .field-label {
    display: none;
  }
}

.has-icon {
  // If select type, then it always has an icon or an arrow.
  .field-input,
  .field-label {
    padding-right: var(--field-size) !important;
  }

  &:deep(.el-select) {
    .el-input:after {
      visibility: hidden;
    }
  }
}

.is-focused,
.is-focused:hover {
  background-color: var(--rgba-field-focus);
  color: rgb(var(--color-nature));

  .field-label {
    color: var(--rgba-font-transparent);
  }
}

.is-focused.is-filterable {
  .field-label {
    display: none
  }
}

.is-disabled {
  background-color: var(--rgba-field) !important;
  opacity: var(--opacity-disabled);

  .field-input {
    pointer-events: none;
  }
}

.look-disabled {
  background-color: rgb(var(--color-gray-3));
  color: rgb(var(--color-gray-5));
}

.no-label {
  .field-label {
    display: none;
  }
}

/* Modifiers */
.-circle {
  width: var(--field-size);
  height: var(--field-size);
  border-radius: 50%;

  + .-circle {
    margin-top: auto !important;
  }

  .field-input {
    height: inherit;
  }

  &:deep(.el-select) {
    .el-input {
      padding: 0;
    }
    .el-input__inner {
      display: none;
    }
  }

  &.has-input {
    background-color: var(--rgba-value-set-bg);
  }
}

// The field class is needed to set higher specificity.
.-quadratic,
.-square {
  width: auto;

  + .-quadratic,
  + .-square {
    border-left: 1px solid var(--rgba-field-divider);
  }

  &:deep(.el-select) {
    .el-select__tags {
      padding: 0;

      .el-tag:first-child {
        padding-left: 1em;
        border-left: 1px solid var(--rgba-field-divider);
        border-radius: 0;
      }

      .el-tag:last-child {
        padding-right: 1em;
      }
    }
  }

  /* States */
  &.no-label {
    &:deep(.el-select) {
      .el-input {
        padding: 0;
      }

      .el-input__inner {
        width: var(--field-size);
        padding: 0;
      }
    }
  }

  &.has-input {
    width: auto;
  }

  &.no-label:not(.has-input):deep(.el-select) {
    padding-right: 0 !important; // The field value should not be shown, so hide icon padding.
  }

  &.no-label.has-input:deep(.el-select) {
    .el-input__inner {
      width: auto;
      padding-left: 1em;
      border-radius: 0;
    }
  }
}

.-common-height {
  &:not(.has-input) {
    .icon-wrapper {
      width: var(--common-size);
    }

    &.-square:deep(.el-input):after {
      right: calc(var(--field-size) / 1.5) !important;
    }
  }
}
</style>

<style lang="less"> // NOT SCOPED!
@import '../style/mixins';

// Can't put this above, since it adds as an item to body, not the element.
// Using id to give element high selector value.
#app .el-select__popper {
  border: none;
  border-radius: calc(var(--field-size) / 3);
  overflow: hidden;
  box-shadow: none;
  background-color: var(--rgba-field-focus);
  color: var(--rgba-font-transparent);

  &[data-popper-placement^=bottom] {
    transform: translateY(-8px);
  }

  &[data-popper-placement^=top] {
    transform: translateY(8px);
  }

  .el-scrollbar,
  .el-select-dropdown__empty {
    width: 100%;
  }

  .el-select-group__wrap {
    padding-bottom: 0;

    &:after {
      display: none;
    }
  }

  .el-select-dropdown__list {
    padding: 0;
  }

  .el-select-group__title {
    padding: 0 calc(var(--field-size) / 2);
    background: rgb(var(--color-gray-3));
    color: rgb(var(--color-gray-5));
    text-transform: capitalize;
  }

  .el-select-dropdown__item,
  .el-select-dropdown__empty {
    font-size: inherit;
    height: var(--field-size);
    line-height: var(--field-size);
    padding: 0 calc(var(--field-size) / 2);
    transition: background-color var(--transition-duration-input);
  }

  .el-select-dropdown__item {
    background-color: transparent; // To overwrite element rule.
    color: inherit; // To overwrite element rule.

    &:before {
      right: calc((var(--field-size) / 3) + 0.25em);
    }

    &.selected {
      font-weight: bold;
      color: rgb(var(--color-nature));
      background-color: var(--rgba-field-dropdown-selected);
    }

    &:hover {
      background-color: var(--rgba-field-dropdown-hover);
    }

    &.is-disabled {
      background-color: rgb(var(--color-gray-3));
      color: rgb(var(--color-gray-5));

      &:before { // for multi-select bullets
        opacity: var(--opacity-light);
      }
    }
  }

  .el-select-dropdown__empty {
    background-color: rgb(var(--color-gray-3));
    color: var(--rgba-font-transparent);
    font-weight: 700;
    box-sizing: border-box;
  }

  .el-scrollbar__bar.is-horizontal {
    display: none;
  }

  .el-popper__arrow {
    display: none;
  }

  .is-multiple {
    .el-select-dropdown__empty,
    .el-select-dropdown__item {
      padding: 0 var(--field-size) 0 calc(var(--field-size) / 2);
    }

    .el-select-dropdown__item {
      &:before {
        .pseudo-setup();
        right: calc(var(--field-size) * 0.4);
        top: 50%;
        width: calc(var(--field-size) * 0.2);
        height: calc(var(--field-size) * 0.2);
        border-radius: 50%;
        background-color: var(--rgba-field-color);
        transform: translateY(-50%);
        transition: background-color var(--transition-duration-input);
      }
      &:after {
        display: none;
      }

      &.selected {
        &:before {
          background-color: rgb(var(--color-primary));
          border-color: white;
        }
      }
    }
  }
}
</style>
