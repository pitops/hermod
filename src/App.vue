<template>
    <div id="app">
        <el-row>
            <el-col :span="18" :offset="3">
                <el-container>
                    <el-header>
                        <Header/>
                    </el-header>
                    <el-main>
                       <router-view></router-view>
                    </el-main>
                </el-container>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import Dashboard from './components/dashboard.vue'
import Header from './components/header.vue'

export default {
  name: 'app',
  components: {
    Header,
    Dashboard
  }
}
</script>

<style>
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;
        margin-top: 60px;
    }
</style>
