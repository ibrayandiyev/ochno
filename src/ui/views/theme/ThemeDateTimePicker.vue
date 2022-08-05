<template>
  <div>
    <h2 class="margin-block-row">Date and time pickers</h2>

    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(50px, 250px)); column-gap: 5rem;">
      <div class="grid" style="margin-top: 0">
        <el-time-picker v-model="timePicker" format="HH:mm" placeholder="Select time" />
        <el-time-picker v-model="timePicker" :disabled="true" placeholder="Select time" />
      </div>

      <div class="grid" style="margin-top: 0">
        <el-time-picker
          v-model="rangePicker"
          is-range
          format="HH:mm"
          range-separator="to"
          start-placeholder="Start time"
          end-placeholder="End time"
        />
        <el-time-picker
          v-model="rangePicker"
          is-range
          :disabled="true"
          range-separator="to"
          start-placeholder="Start time"
          end-placeholder="End time"
        />
      </div>

      <div class="grid" style="margin-top: 0">
        <el-date-picker
          v-model="datePicker"
          type="daterange"
          range-separator="to"
          start-placeholder="Start date"
          end-placeholder="End date"
        />
        <el-date-picker
          v-model="datePicker"
          type="daterange"
          :disabled="true"
          range-separator="to"
          start-placeholder="Start date"
          end-placeholder="End date"
        />
      </div>
    </div>
  </div>
</template>


<script>
import { ref } from 'vue';

export default {
  setup() {
    return {
      timePicker: ref(null),
      rangePicker: ref(null),
      datePicker: ref(null),
    };
  },
};
</script>


<style scoped lang="less">
</style>
