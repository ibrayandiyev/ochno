<template>
  <div class="json-editor flex flex-column" :class="{ disabled: disabled }">
    <div ref="el" class="json-editor-wrapper flex-grow" />
    <div class="json-editor-error color-error text-center font-small1" :class="{ hide: disabled }" :style="{ opacity: (error ? 1 : 0) }">{{ $t(error) }}</div>
    <div class="json-editor-button-wrapper text-center">
      <el-button :class="{ hide: disabled, 'is-disabled': error }" @click="save">{{ buttonText }}</el-button>
    </div>
  </div>
</template>


<script>
import ace from 'brace';
import 'brace/mode/json';
import sortify from 'json.sortify';
import { ref, watch, onMounted, onUnmounted } from 'vue';

export default {
  props: {
    json: { type: Object, required: true },
    // options: { type: Object, default: () => ({}) },
    disabled: { type: Boolean, default: true },
    buttonText: { type: String, default: 'Save' },
  },

  emits: ['save'],

  setup(props, { emit }) {
    const el = ref(null);
    const error = ref(null);

    let editor = null;

    function updateValue() {
      if (editor) {
        // It looks silly to parse and sortify (similar to JSON.stringify), but it's the only way to keep the editor from having the data "jump" around.
        if (props.json) {
          editor.setValue(sortify(props.json, null, 4));
        }
        editor.clearSelection();
      }
    }

    watch(() => props.json, () => updateValue());

    watch(() => props.disabled, () => editor?.setReadOnly(props.disabled));

    onMounted(() => {
      editor = ace.edit(el.value); // https://ace.c9.io/#nav=api&api=editor

      editor.$blockScrolling = Infinity;
      editor.setReadOnly(props.disabled);

      editor.session.setMode('ace/mode/json');

      editor.setOption('maxLines', 300);
      editor.setShowFoldWidgets(false);
      editor.setShowPrintMargin(false);
      editor.renderer.setOption('showLineNumbers', false);

      editor.on('change', () => {
        setTimeout(() => {
          // TODO: This is not a very fancy solution. I can't find any way to get signals about errors. Errors can be seen in editor.session.getAnnotations().
          // NOTE the timeout of 300 is before it takes that long before the error is set.
          if (el.value?.querySelector('.ace_error')) {
            error.value = 'The actual error may be on the line above the error mark.';
          } else {
            error.value = null;
          }
        }, 300);
      });

      updateValue();
    });

    onUnmounted(() => {
      if (editor) {
        editor.destroy();
        editor = null;
      }
    });

    return {
      el,
      error,

      save() {
        const errors = editor.session.getAnnotations().filter((annot) => annot.type === 'error');
        if (errors.length) {
          error.value = 'Please correct all errors before saving.';
        } else {
          error.value = null;
          try {
            emit('save', JSON.parse(editor.getValue()));
          } catch (e) {
            error.value = 'There was an error parsing the data.';
          }
        }
      },
    };
  },
};
</script>


<style scoped lang="less">
.json-editor {
  background-color: rgba(var(--color-zero), 0.1);
}

.json-editor-wrapper {
  width: 100%;
  margin: 1rem 0;
}

.json-editor-error {
  height: 2em;
  transition: opacity 0.3s 1s;
}

.json-editor-button-wrapper {
  margin: 1rem 0;
}

.json-editor:deep(.json-editor-wrapper) {
  &,
  .ace_gutter {
    background: transparent;
  }

  .ace_gutter-cell {
    transition: background 0.3s;

    &.ace_error {
      background: rgba(var(--color-error), 0.6);
    }
  }

  .ace_gutter-active-line,
  .ace_marker-layer .ace_active-line {
    background-color: transparent;
  }
  &.ace_focus {
    .ace_gutter-active-line,
    .ace_marker-layer .ace_active-line {
      background-color: fade(white, 10%);
    }
  }

  .ace_indent-guide {
    background: transparent;
    border-right: 1px solid fade(white, 10%);
  }

  .ace_gutter-layer {
    width: 14px !important;
  }
  .ace_scroller {
    left: 14px !important;
  }

  .ace_text-layer {
    color: darken(white, 25%);
  }
  .ace_variable {
    color: rgb(var(--color-nature));
  }
  .ace_string {
    color: rgb(var(--color-orange)) !important;
  }
  .ace_numeric {
    color: var(--color-orange-lighter) !important;
  }
  .ace-constant,
  .ace_boolean {
    color: var(--color-orange-darker) !important;
  }

  .ace_cursor {
    color: white;
  }

  .ace_selection {
    background-color: rgba(var(--color-primary), var(--opacity-light));
  }

  .ace_selected-word {
    background-color: fade(white, 20%);
    border: none;
  }
}

.disabled {
  background-color: transparent;
}

.disabled:deep(.json-editor-wrapper) {
  .ace_bracket,
  .ace_hidden-cursors {
    display: none;
  }
}
</style>
