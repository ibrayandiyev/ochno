<template>
  <!-- If there are no items in the filtered selection, show a message about it. -->
  <div v-if="!Object.values(filtered).length" class="fill centered -common-height color-error">
    <span v-if="Object.values(filtervalue).length">Your current filter didn't give any results.</span>
    <span v-else-if="!fetching">This list is empty.</span>
  </div>
</template>


<script>
export default {
  props: {
    filtered: { type: Object, default: () => ({}) },
    filtervalue: { type: Object, default: () => ({}) },
    fetching: { type: Boolean, default: false },
  },
};
</script>


<style scoped lang="less">
</Style>
