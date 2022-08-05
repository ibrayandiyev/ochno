<template>
  <div>
    <h2 class="margin-block-row">Buttons</h2>

    <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(50px, 450px)); column-gap: 5rem;">
      <div>
        <h3 class="margin-block-column">Regular buttons</h3>
        <el-button>Default</el-button>
        <el-button class="color-primary">Primary</el-button>
        <el-button disabled>Disabled</el-button>
      </div>

      <div>
        <h3 class="margin-block-column">Circular buttons</h3>
        <el-button class="-circle">
          <Icon type="light" />
        </el-button>
        <el-button class="-circle color-primary">
          <Icon type="light" />
        </el-button>
        <el-button class="-circle" disabled>
          <Icon type="light" />
        </el-button>
      </div>

      <div>
        <h3 class="margin-block-column">Quadratic buttons</h3>
        <el-button class="-square">
          <Icon type="lamp" />
        </el-button>
        <el-button class="-square color-primary">
          <Icon type="lamp" />
        </el-button>
        <el-button class="-square" disabled>
          <Icon type="lamp" />
        </el-button>
        <el-button class="-square">
          <div>Fixed</div>
        </el-button>
        <el-button class="-quadratic">
          <div>Dynamic width</div>
        </el-button>
        <el-button class="-square -common-height">
          <Icon type="lamp" class="font-big2" />
        </el-button>
      </div>

      <div>
        <h3 class="margin-block-column">Borderless buttons</h3>
        <el-button class="-borderless">Default</el-button>
        <el-button class="-quadratic -borderless">Quadratic</el-button>
      </div>
    </div>
  </div>
</template>


<script>
export default {};
</script>


<style scoped lang="less">
</style>
