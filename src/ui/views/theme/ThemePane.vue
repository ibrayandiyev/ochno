<template>
  <div>
    <h2 class="margin-block-row">Panes</h2>

    <el-button class="-borderless" @click="first = !first">1</el-button>
    <el-button class="-borderless" @click="second = !second">2</el-button>

    <div class="grid" style="grid-template-columns: 1fr 1fr">
      <Pane v-if="first" @close-pane="first = !first">
        <template #icon>
          <Icon type="controls" />
        </template>

        <template #title>
          <div>Pane 1</div>
        </template>

        This Pane closes manually.
      </Pane>

      <Pane v-if="second" :inactive-close="10" @close-pane="second = !second">
        <template #icon>
          <Icon type="settings" />
        </template>

        <template #title>
          <div>Pane 2</div>
        </template>

        <template #tool>
          <el-button class="-square -common-height -borderless">
            <Icon type="tools" />
          </el-button>
        </template>

        This Pane closes automatically after 10 seconds of idling.
      </Pane>
    </div>
  </div>
</template>


<script>
import { ref } from 'vue';

import Pane from '../../components/layout/Pane.vue';

export default {
  components: { Pane },

  setup() {
    return {
      first: ref(true),
      second: ref(false),
    };
  },
};
</script>


<style scoped lang="less">
</style>
