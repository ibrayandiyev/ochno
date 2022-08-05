<template>
  <div>
    <h2 class="margin-block-row">Tabs</h2>

    <div class="m-down">
      <el-tabs type="card" @tab-click="() => {}">
        <el-tab-pane label="User">User</el-tab-pane>
        <el-tab-pane label="Config">Config</el-tab-pane>
        <el-tab-pane label="Role">Role</el-tab-pane>
        <el-tab-pane label="Task">Task</el-tab-pane>
      </el-tabs>
    </div>

    <div class="m-down">
      <el-tabs type="card" tab-position="left" @tab-click="() => {}">
        <el-tab-pane label="User">User</el-tab-pane>
        <el-tab-pane label="Config">Config</el-tab-pane>
        <el-tab-pane label="Role">Role</el-tab-pane>
        <el-tab-pane label="Task">Task</el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>


<script>
export default {};
</script>


<style scoped lang="less">
</style>
