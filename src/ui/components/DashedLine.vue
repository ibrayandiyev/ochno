<template>
  <svg class="dashed-line" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="0" x2="100%" y2="0" />
  </svg>
</template>


<style scoped lang="less">
.dashed-line {
  width: 100%;
  height: 1px;
  stroke: var(--rgba-row-line);
  stroke-dasharray: 4px 4px;
  shape-rendering: crispedges;
  overflow: visible;
}
</style>
