<template>
  <label
    class="upload fill bg-gray-3"
    :class="classes"
    :style="styles"
    @click="dragLeave"
    @drag.stop.prevent="empty"
    @dragover.stop.prevent="empty"
    @dragstart.stop.prevent="dragEnter"
    @dragenter.stop.prevent="dragEnter"
    @dragend.stop.prevent="dragLeave"
    @dragleave.stop.prevent="dragLeave"
    @drop.stop.prevent="drop"
  >
    <input type="file" :accept="accept" :disabled="disabled" @change="change">

    <div class="upload-instruction relative fill centered text-center font-upper-case">
      <slot>
        <div v-if="!uploading">
          <Icon type="upload" class="font-big2" />
          <div>
            {{ $t(uploadText) }}
          </div>
          <el-button v-if="image" class="remove-image" @click.prevent.stop="emit('remove');">
            {{ $t(removeText) }}
          </el-button>
        </div>
        <div v-else>
          <div class="spinner-wrapper relative font-big1">
            <Spinner class="inline" style="transform: scale(0.8);" />
          </div>
          <div>
            {{ $t(uploadingText) }}
          </div>
        </div>
      </slot>
    </div>
  </label>
</template>


<script>
import _ from 'lodash';
import { ref, computed } from 'vue';

export default {
  props: {
    accept: { type: String, default: 'image/*' },
    disabled: { type: Boolean, default: false },
    uploading: { type: Boolean, default: false },
    uploadText: { type: String, default: 'Drop an image or click here to upload' },
    uploadingText: { type: String, default: 'Uploading' },
    removeText: { type: String, default: 'Remove' },
    image: { type: String },
  },

  emits: ['input', 'remove'],

  setup(props, { emit }) {
    const over = ref(false);

    function emitting(file) {
      over.value = false;
      if (!props.disabled && file) {
        emit('input', file);
      }
    }

    return {
      emit,

      classes: computed(() => ({
        'is-disabled': props.disabled || props.uploading,
        'is-uploading': props.uploading,
        'drag-over': over.value,
        'hover-text': props.image,
      })),

      styles: computed(() => ({
        'background-image': props.image ? `url(${props.image})` : 'none',
      })),

      empty() {},

      dragEnter() {
        over.value = true;
      },
      dragLeave() {
        over.value = false;
      },

      drop(ev) {
        emitting(_.get(ev, 'dataTransfer.files[0]'));
      },
      change(ev) {
        emitting(_.get(ev, 'target.files[0]'));
      },
    };
  },
};
</script>


<style scoped lang="less">
.upload {
  display: grid;
  min-height: 20rem;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
}

.upload-instruction {
  padding: var(--column-gap);
  color: rgb(var(--color-gray-5));
  pointer-events: none; // So it doesn't interfere with drag events.
  transition: all var(--transition-duration-open);
}

.icon {
  margin-bottom: 2rem;
  margin-left: -0.25em; // To make the icon appear centered
}

.remove-image {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  pointer-events: auto;
  transform: translateX(-50%);
}

.spinner-wrapper {
  width: 4rem;
  height: 6rem;
  margin: auto;
}

/* STATES */
.drag-over {
  .upload-instruction {
    background-color: rgb(var(--color-gray-4));
    color: rgb(var(--color-nature));
  }
}

.hover-text {
  .upload-instruction {
    background-color: rgba(var(--color-black), var(--opacity-heavy));
    opacity: 0;
  }
}

.hover-text:hover,
.drag-over,
.is-uploading {
  .upload-instruction {
    opacity: 1;
  }
}

.is-disabled:not(.is-uploading) {
  .upload-instruction {
    display: none;
  }
}
</style>
