<template>
  <div v-page-title="$t('Unable to find resource')" class="centered background-logo">
    <h2 class="m-down">
      {{ $t('Unable to find resource') }}
    </h2>

    <p class="text-center m-down">
      {{ $t('What you are looking for is not available.') }}
    </p>

    <router-link to="/">
      <el-button>
        {{ $t('Back to start') }}
      </el-button>
    </router-link>
  </div>
</template>


<script>
export default {};
</script>


<style scoped lang="less">
.centered {
  width: 100%;
  min-height: calc(var(--vh, 1vh) * 100);
}
</style>
