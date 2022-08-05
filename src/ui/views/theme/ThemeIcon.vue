<template>
  <div class="text-selectable">
    <h2 class="margin-block-row">Icons</h2>

    <div class="m-down" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr); row-gap: 1em;">
      <div v-for="icon in icons" :key="icon" style="display: inline">
        <Icon :type="icon" style="margin-right: 0.5rem" />
        {{ icon }}
      </div>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(175px, 1fr); row-gap: 1em;">
      <div v-for="icon in portIcons" :key="icon" style="word-wrap: none">
        <Icon :type="icon" style="font-size: 20px; margin-right: 1rem" />
        {{ icon }}
      </div>
    </div>
  </div>
</template>


<script>
import lookup from '../../components/icons/lookup';

export default {
  setup() {
    const iconKeys = Object.keys(lookup);

    return {
      icons: iconKeys.filter((key) => !key.startsWith('device')),
      portIcons: iconKeys.filter((key) => key.startsWith('device')),
    };
  },
};
</script>


<style scoped lang="less">
</style>
