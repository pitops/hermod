<template>
    <div class="grid-content">
        <el-menu :default-active="$route.path" class="el-menu-demo" mode="horizontal" :router="true">
            <el-menu-item index="/">Dashboard</el-menu-item>
            <el-menu-item index="/project/create">Create new project</el-menu-item>
        </el-menu>
    </div>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {
      activeLink: null,
      projects: [],
      currentDate: new Date()
    }
  },
  methods: {},
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.activeLink = to.path
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.activeLink = to.path
    next()
  }
}
</script>

<style scoped>

</style>
