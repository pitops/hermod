<template>
    <div class="test">
        <div class="dashboard" v-loading="loading" v-if="!loading">
            <div class="line"></div>
            <h4 class="choose-a-project">Choose a project</h4>
            <el-row>
                <el-col :span="6" v-for="(o, index) in projects" :key="index" :offset="index > 0 ? 2 : 0">
                    <el-card :body-style="{ padding: '0px' }" class="project">
                        <div class="logo-bg"><p class="app-name">{{ o.name }}</p></div>
                        <div style="padding: 14px;">
                            <div class="project-details">
                                <div class="details">
                                    <a target="_blank" class="app-url" :href="o.url">{{ o.url }}</a>
                                    <time class="created-at">{{ creationDate }}</time>
                                </div>
                                <router-link :to="{ name: 'project', params: { slug: o.slug }}" tag="el-button"
                                             class="choose-btn">Choose
                                </router-link>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <div class="test" v-if="loading">
            <div class="line"></div>
            <h4 class="choose-a-project">Loading projects...</h4>
            <el-row>
                <el-col :span="6" v-for="(o, index) in 3" :key="index" :offset="index > 0 ? 2 : 0">
                    <el-card :body-style="{ padding: '0px' }">
                        <div class="logo-bg animated-background" style="height: 130px;"><p class="app-name"></p></div>
                        <div style="padding: 14px;">
                            <div class="bottom clearfix">
                                <a target="_blank" class="app-url animated-background"
                                   style="display: block;width: 160px;height: 19px;"></a>
                                <time class="created-at animated-background" style="height: 12px;width: 100px;"></time>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import db from '../firebaseInit'

export default {
  name: 'Dashboard',
  data () {
    return {
      projects: [],
      creationDate: new Date().toISOString(),
      loading: true
    }
  },
  methods: {
    processProjects (projects) {
      const resultArray = []
      projects.forEach(doc => {
        const project = {
          id: doc.id,
          name: doc.data().name,
          url: doc.data().url,
          slug: doc.data().slug,
          timestamp: doc.data().timestamp
        }
        resultArray.push(project)
      })
      this.projects = resultArray
    }
  },
  created () {
    db.collection('projects')
      .get()
      .then(querySnapshot => {
        this.processProjects(querySnapshot)
        setTimeout(() => {
          this.loading = false
        }, 500)
      })
      .catch(err => console.error(err))

    db.collection('projects')
      .onSnapshot(querySnapshot => {
        this.processProjects(querySnapshot)
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .choose-a-project {
        margin-top: 40px;
    }

    .created-at {
        color: #999;
        font-size: 13px;
        display: block;
        margin-top: 5px;
    }

    .project-details {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-around;
    }

    .choose-btn {
        margin: 20px;
    }

    .clearfix:before,
    .clearfix:after {
        display: table;
        content: "";
    }

    .clearfix:after {
        clear: both
    }

    .logo-bg {
        height: 130px;
        background: #f9f9f9;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .app-name {
        color: #888888;
        font-weight: 600;
        font-size: 23px;
        text-transform: uppercase;
    }

    .app-url {
        color: #409EFF;
        font-weight: bold;
        text-decoration: none;
        font-size: 14px;
    }

    @keyframes placeHolderShimmer {
        0% {
            background-position: -468px 0
        }
        100% {
            background-position: 468px 0
        }
    }

    .animated-background {
        -webkit-animation-duration: 1s;
        animation-duration: 1s;
        -webkit-animation-fill-mode: forwards;
        animation-fill-mode: forwards;
        -webkit-animation-iteration-count: infinite;
        animation-iteration-count: infinite;
        -webkit-animation-name: placeHolderShimmer;
        animation-name: placeHolderShimmer;
        -webkit-animation-timing-function: linear;
        animation-timing-function: linear;
        /*background: #f6f7f8;*/
        background: #eeeeee;
        background: -webkit-gradient(linear, left top, right top, color-stop(8%, #eeeeee), color-stop(18%, #dddddd), color-stop(33%, #eeeeee));
        background: -webkit-linear-gradient(left, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
        background: linear-gradient(to right, #eeeeee 8%, #dddddd 18%, #eeeeee 33%);
        -webkit-background-size: 800px 104px;
        background-size: 800px 104px;
        height: auto;
        width: auto;
        position: relative;
    }
</style>
