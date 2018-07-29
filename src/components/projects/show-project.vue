<template>
    <div>
        <el-row type="flex" align="middle" id="select-project-header">
            <el-col :span="24">
                <div>
                    <span>Viewing project</span>
                    <el-dropdown class="select-project" @command="projectSwitchDropdown">
                          <span class="el-dropdown-link" v-loading="loading">
                            {{(project && project.name) || '' }}<i class="el-icon-arrow-down el-icon--right"></i>
                          </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item
                                    v-for="(project, projectIndex) in projects"
                                    v-if="projects.length"
                                    :key="projectIndex"
                                    :index="projectIndex.toString()"
                                    :command="project.slug">{{ project.name }}</el-dropdown-item>
                            <el-dropdown-item v-if="!projects.length" :disabled="true">This is the only project</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>

                    <el-dropdown style="float: right" @command="projectConfigDropdown">
                        <i class="el-icon-setting" style="margin-right: 15px"></i>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item command="EDIT">Edit</el-dropdown-item>
                            <el-dropdown-item command="DELETE" divided>Delete</el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>

                    <small style="float: right; margin-right: 20px;font-weight: bold;">{{ (project && project.url) || '' }}</small>
                </div>
                <div class="line"></div>
            </el-col>
        </el-row>

        <el-container style="height: 650px; padding: 10px">
            <el-aside width="300px" height="650px">
                <el-card class="box-card">
                    <span>Namespaces</span>
                    <el-button style="float: right;" size="mini" round @click="createNamespace">Add</el-button>
                </el-card>
                <el-menu v-loading="namespacesLoading" element-loading-spinner="el-icon-loading">
                    <el-submenu v-for="(namespace, namespaceIndex) in namespaces" :key="namespaceIndex" :index="namespaceIndex.toString()">
                        <template slot="title">
                            {{ namespace.name }} <el-badge class="mark" :value="namespace.endpoints.length" />
                        </template>
                        <el-menu-item index="1-1" style="font-weight: bold;" @click="openNamespaceUpdateDialog(namespaceIndex)">
                            <i class="el-icon-setting" style="margin-right: 5px; margin-top: -3px;"></i>Settings
                        </el-menu-item>
                        <el-menu-item index="1-2" class="create-endpoint" @click="openEndpointCreationDialog(namespaceIndex)">
                            <i class="el-icon-location-outline" style="margin-right: 5px; margin-top: -3px;"></i>New endpoint
                        </el-menu-item>
                        <el-menu-item-group title="Endpoints">
                            <el-menu-item v-for="(endpoint, endpointIndex) in namespace.endpoints"
                                          :key="endpointIndex"
                                          :index="endpointIndex.toString()"
                                          @click="selectEndpoint(namespaceIndex, endpointIndex)">{{ endpoint.name }}</el-menu-item>
                        </el-menu-item-group>
                    </el-submenu>
                </el-menu>
            </el-aside>

            <el-container>
                <el-main>
                    <div v-if="!selectedEndpoint && namespaces.length">
                        Please select an endpoint from the menu on the left.
                    </div>
                    <div v-if="!selectedEndpoint && !namespaces.length">
                        You can create a namespace and relevant endpoints by clicking on the Add button from the menu on the left.
                    </div>
                    <el-form ref="dispatchForm" :model="dispatchForm" label-width="120px" v-if="selectedEndpoint" id="dispatchForm">
                        <el-button
                                plain
                                icon="el-icon-edit"
                                id="editEndpointFormBtn"
                                @click="switchToEditMode"
                               :disabled="editEndpointFormMode">{{ editEndpointFormMode ? 'Edit mode' : 'Edit' }}</el-button>
                        <el-form-item label="Name">
                            <el-input v-model="dispatchForm.name" :disabled="!editEndpointFormMode"></el-input>
                        </el-form-item>
                        <el-form-item label="Endpoint">
                            <el-input v-model="dispatchForm.endpoint" :disabled="!editEndpointFormMode"></el-input>
                        </el-form-item>
                        <el-form-item label="Template name">
                            <el-input v-model="dispatchForm.templateName" :disabled="!editEndpointFormMode"></el-input>
                        </el-form-item>
                        <el-form-item label="Parameters" >
                            <el-button icon="el-icon-circle-plus-outline" @click.prevent="addParameter" v-if="editEndpointFormMode"></el-button>
                            <p v-if="!dispatchForm.payload.length && !editEndpointFormMode" style="margin: 0;">No parameters set yet.</p>
                        </el-form-item>
                        <hr v-if="dispatchForm.payload.length">
                        <el-form-item v-for="(parameter, index) in dispatchForm.payload"
                                        :label="'Parameter'"
                                        :key="parameter.key"
                                        :index="index.toString()"
                                        v-if="dispatchForm.payload.length">
                            <el-input v-model="parameter.name" placeholder="key" :disabled="!editEndpointFormMode"></el-input>
                            <el-input v-model="parameter.value" placeholder="value" :disabled="!editEndpointFormMode"></el-input>
                            <el-button icon="el-icon-delete" @click.prevent="removeParameter(parameter)" v-if="editEndpointFormMode"></el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="dispatchPayload" v-if="!editEndpointFormMode" :loading="dispatchingLoader">Send</el-button>
                            <el-button @click="cancelEndpointEdit" v-if="editEndpointFormMode">Cancel</el-button>
                            <el-button type="primary" @click="updateEndpoint" v-if="editEndpointFormMode" :loading="savingEndpointChangesLoader">Save changes</el-button>
                        </el-form-item>
                    </el-form>
                </el-main>
            </el-container>
        </el-container>

        <el-dialog title="Endpoint" :visible.sync="createEndpointFormVisible" width="500px">
            <el-form :model="createEndpointform">
                <el-form-item label="Name" :label-width="formLabelWidth">
                    <el-input v-model="createEndpointform.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="Endpoint" :label-width="formLabelWidth">
                    <el-input v-model="createEndpointform.endpoint" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="Template name" :label-width="formLabelWidth">
                    <el-input v-model="createEndpointform.templateName" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="createEndpointFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="createEndpoint" :loading="creatingEndpointLoader">Create</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Project" :visible.sync="editProjectFormVisible" width="500px">
            <el-form :model="projectForm">
                <el-form-item label="Name" :label-width="formLabelWidth">
                    <el-input v-model="projectForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="URL" :label-width="formLabelWidth">
                    <el-input v-model="projectForm.url" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="Endpoint" :label-width="formLabelWidth">
                    <el-input v-model="projectForm.endpoint" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editProjectFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="editProject" :loading="updateProjectLoader">Save changes</el-button>
            </span>
        </el-dialog>

        <el-dialog title="Namespace" :visible.sync="editNamespaceFormVisible" width="500px">
            <el-form :model="editNamespaceForm">
                <el-form-item label="Name" :label-width="formLabelWidth">
                    <el-input v-model="editNamespaceForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="" :label-width="formLabelWidth">
                    <el-button type="danger" size="mini" @click="deleteNamespace">Delete</el-button>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editNamespaceFormVisible = false">Cancel</el-button>
                <el-button type="primary" @click="updateNamespace" :loading="updateNamespaceLoader">Save changes</el-button>
            </span>
        </el-dialog>
    </div>

</template>

<script>
import firebase from 'firebase'
import db from '../../firebaseInit'

export default {
  data () {
    return {
      slug: this.$route.params.slug,
      loading: false,
      namespacesLoading: false,
      project: undefined,
      projects: [],
      namespaces: [],
      selectedNamespace: null,
      selectedEndpoint: null,
      createEndpointFormVisible: false,
      editProjectFormVisible: false,
      editNamespaceFormVisible: false,
      projectForm: {
        name: '',
        url: '',
        endpoint: ''
      },
      editNamespaceForm: {
        name: ''
      },
      createEndpointform: {
        name: '',
        endpoint: '',
        templateName: '',
        payload: []
      },
      creatingEndpointLoader: false,
      savingEndpointChangesLoader: false,
      updateProjectLoader: false,
      dispatchingLoader: false,
      updateNamespaceLoader: false,
      formLabelWidth: '120px',
      dispatchForm: {
        name: '',
        endpoint: '',
        templateName: '',
        payload: []
      },
      editEndpointFormMode: false
    }
  },
  methods: {
    projectConfigDropdown (command) {
      switch (command) {
        case 'DELETE':
          this.confirmProjectDeletion()
          break
        case 'EDIT':
          this.openEditProjectDialog()
          break
        default:
          alert(`command - ${command} not found`)
      }
    },
    projectSwitchDropdown (projectSlug) {
      this.$router.push(`/project/${projectSlug}`)
    },
    confirmProjectDeletion () {
      this.$swal({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.value) {
          db
            .collection('projects')
            .doc(this.project.id)
            .delete()
            .then(() => {
              this.$swal(
                'Deleted!',
                'Project deleted.',
                'success'
              ).then(result => {
                if (result.value) {
                  this.$router.push('/')
                }
              })
            })
            .catch(err => console.log('[Firebase] ', err))
        }
      })
    },
    createNamespace () {
      this.$prompt('Please enter name for namespace', 'Namespaces', {
        confirmButtonText: 'Create',
        cancelButtonText: 'Cancel',
        beforeClose: (action, instance, done) => {
          if (action === 'confirm') {
            instance.confirmButtonLoading = true
            instance.confirmButtonText = 'Creating...'

            db
              .collection('namespaces')
              .add({
                name: instance.inputValue,
                project_id: this.project.id,
                endpoints: []
              })
              .then(docRef => {
                setTimeout(() => {
                  done()
                  setTimeout(() => {
                    instance.confirmButtonLoading = false
                  }, 300)
                }, 500)
              })
              .catch(err => {
                throw new Error(err)
              })
          } else {
            done()
          }
        }
      }).then(prompt => {
        this.$message({
          type: 'success',
          message: 'Namespace created'
        })
      }).catch(err => {
        console.log('[Create namespace] ', err)
      })
    },
    updateNamespace () {
      this.updateNamespaceLoader = !this.updateNamespaceLoader

      db
        .doc(`namespaces/${this.selectedNamespace.id}`)
        .update(this.editNamespaceForm)
        .then(() => {
          this.$message('Namespace updated')
          this.updateNamespaceLoader = !this.updateNamespaceLoader
          this.editNamespaceFormVisible = !this.editNamespaceFormVisible
        })
        .catch(err => console.log('[Firebase] ', err))
    },
    deleteNamespace () {
      db
        .doc(`namespaces/${this.selectedNamespace.id}`)
        .delete()
        .then(() => {
          this.$message('Namespace deleted')
          this.editNamespaceFormVisible = !this.editNamespaceFormVisible
        })
        .catch(err => console.log('[Firebase] ', err))
    },
    openNamespaceUpdateDialog (namespaceIndex) {
      this.selectedNamespace = this.namespaces[namespaceIndex]
      this.editNamespaceForm = this.selectedNamespace
      this.editNamespaceFormVisible = !this.editNamespaceFormVisible
    },
    setProject (querySnapshot) {
      this.loading = !this.loading

      const resultArray = []
      querySnapshot.forEach(doc => {
        const project = {
          id: doc.id,
          name: doc.data().name,
          url: doc.data().url,
          slug: doc.data().slug,
          timestamp: doc.data().timestamp,
          endpoint: doc.data().endpoint
        }
        resultArray.push(project)
      })

      this.project = resultArray.find(project => project.slug === this.slug)

      if (!this.project) {
        setTimeout(() => {
          this.loading = !this.loading
          this.$swal({
            type: 'error',
            title: 'Oops...',
            text: 'Project not found!',
            confirmButtonText: 'Go back',
            allowOutsideClick: false,
            allowEscapeKey: false
          }).then(result => {
            if (result.value) {
              this.$router.push('/')
            }
          })
        }, 1000)
      } else {
        this.loading = !this.loading
      }
    },
    openEditProjectDialog () {
      this.projectForm = this.project
      this.editProjectFormVisible = true
    },
    editProject () {
      this.updateProjectLoader = !this.updateProjectLoader

      const project = {
        name: this.projectForm.name,
        endpoint: ['/', this.projectForm.endpoint.replace(/\//g, '')].join(''),
        url: this.projectForm.url,
        slug: this.projectForm.name.split(' ').join('-').toLowerCase(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }

      db
        .doc(`projects/${this.project.id}`)
        .update(project)
        .then(() => {
          this.$message('Project updated')
          this.updateProjectLoader = !this.updateProjectLoader
          this.editProjectFormVisible = false
          setTimeout(() => {
            this.$router.push(`/project/${project.slug}`)
            this.project = Object.assign(this.project, project)
          }, 1000)
        })
        .catch(err => console.log('[Firebase] ', err))
    },
    getEndpoints () {
      this.namespaces.forEach((namespace, index) => {
        db
          .doc(`namespaces/${this.namespaces[index].id}`)
          .collection('endpoints')
          .get()
          .then(querySnapshot => {
            const resultArray = []
            querySnapshot.forEach(doc => {
              const endpoint = {
                id: doc.id,
                name: doc.data().name,
                endpoint: doc.data().endpoint,
                templateName: doc.data().templateName,
                payload: doc.data().payload
              }
              resultArray.push(endpoint)
            })
            this.namespaces[index].endpoints = resultArray
          })
      })
    },
    openEndpointCreationDialog (namespaceIndex) {
      this.selectedNamespace = this.namespaces[namespaceIndex]
      this.createEndpointform.endpoint = `${this.project.endpoint}`
      this.createEndpointFormVisible = true
    },
    createEndpoint () {
      const namespaceRef = db.doc(`namespaces/${this.selectedNamespace.id}`)
      this.creatingEndpointLoader = !this.creatingEndpointLoader

      namespaceRef
        .collection('endpoints')
        .add(this.createEndpointform)
        .then(docRef => {
          // add the new endpoint artificially to our list
          const endpoints = [...(this.selectedNamespace.endpoints || []), Object.assign({}, this.createEndpointform, { id: docRef.id })]
          this.namespaces[this.namespaces.findIndex(namespace => namespace.id === this.selectedNamespace.id)].endpoints = endpoints

          // reset stuff
          this.selectedNamespace = null
          this.createEndpointFormVisible = false
          this.creatingEndpointLoader = !this.creatingEndpointLoader
          this.$message({ message: 'Endpoint created successfully', type: 'success' })
        })
        .catch(err => console.log('[Firebase] ', err))
    },
    updateEndpoint () {
      const endpointRef = db.doc(`namespaces/${this.selectedNamespace.id}/endpoints/${this.selectedEndpoint.id}`)
      this.savingEndpointChangesLoader = !this.savingEndpointChangesLoader
      endpointRef
        .set(this.dispatchForm)
        .then(docRef => {
          this.$message('Endpoint updated')
          this.editEndpointFormMode = false
          this.savingEndpointChangesLoader = !this.savingEndpointChangesLoader
        })
        .catch(err => console.log('[Firebase] ', err))
    },
    selectEndpoint (namespaceIndex, endpointIndex) {
      this.selectedNamespace = this.namespaces[namespaceIndex]
      const tmp = this.namespaces[namespaceIndex].endpoints[endpointIndex]

      this.dispatchForm = tmp
      this.selectedEndpoint = tmp
    },
    dispatchPayload () {
      this.dispatchingLoader = !this.dispatchingLoader

      const dispatcherUrl = `${this.project.url}/${this.project.endpoint}`
      const payload = this.selectedEndpoint.payload.reduce((accumulator, parameter) => {
        accumulator[parameter.name] = parameter.value

        return accumulator
      }, {})

      const body = {
        templateId: this.selectedEndpoint.templateName,
        data: {
          payload: payload
        }
      }

      this.$http.post(dispatcherUrl, body)
        .then(response => {
          this.$message('Dispatched successfully')
          this.dispatchingLoader = !this.dispatchingLoader
        })
        .catch(err => {
          this.$notify({
            title: 'Error',
            message: `Failed to dispatch - ${err.bodyText}`,
            type: 'error'
          })
          this.dispatchingLoader = !this.dispatchingLoader
          console.log('[dispatcher] ', err)
        })
    },
    removeParameter (parameter) {
      const index = this.dispatchForm.payload.indexOf(parameter)
      if (index !== -1) {
        this.dispatchForm.payload.splice(index, 1)
      }
    },
    addParameter () {
      this.dispatchForm.payload.push({
        key: Date.now(),
        value: '',
        name: ''
      })
    },
    switchToEditMode () {
      this.editEndpointFormMode = !this.editEndpointFormMode
    },
    cancelEndpointEdit () {
      this.selectedEndpoint.payload = this.selectedEndpoint.payload.filter(parameter => !!parameter.value)
      this.editEndpointFormMode = false
    },
    getAllProjects () {
      db
        .collection('projects')
        .get()
        .then(querySnapshot => {
          const resultArray = []
          querySnapshot.forEach(doc => {
            const project = {
              id: doc.id,
              name: doc.data().name,
              url: doc.data().url,
              slug: doc.data().slug,
              timestamp: doc.data().timestamp
            }
            resultArray.push(project)
          })

          this.projects = resultArray.filter(project => project.name !== this.project.name)
        })
        .catch(err => console.log('[Firebase] ', err))
    }
  },
  watch: {
    'project' (newVal, oldVal) {
      if (newVal) {
        db
          .collection('namespaces')
          .where('project_id', '==', this.project.id)
          .onSnapshot(querySnapshot => {
            const resultArray = []
            querySnapshot.forEach(doc => {
              const namespace = {
                id: doc.id,
                name: doc.data().name,
                project_id: doc.data().project_id,
                endpoints: []
              }
              resultArray.push(namespace)
            })
            this.namespaces = resultArray
            this.getEndpoints()
          })
        this.getAllProjects()
      }
    }
  },
  created: function () {
    this.$nextTick(() => {
      db
        .collection('projects')
        .where('slug', '==', this.$route.params.slug)
        .get()
        .then(querySnapshot => {
          this.setProject(querySnapshot)
        })
        .catch(err => console.log('[Firebase] ', err))
    })
  },
  beforeRouteUpdate (to, from, next) {
    this.slug = to.params.slug
    db
      .collection('projects')
      .where('slug', '==', this.slug)
      .get()
      .then(querySnapshot => {
        this.setProject(querySnapshot)
        next()
      })
      .catch(err => console.log('[Firebase] ', err))
  }
}
</script>

<style scoped>
    .el-dropdown-link {
        cursor: pointer;
        color: #409EFF;
    }

    .el-icon-arrow-down {
        font-size: 12px;
    }

    .el-header {
        color: #333;
        line-height: 60px;
    }

    .el-aside {
        color: #333;
        border-top: 1px solid #e6e6e6;
        border-right: 1px solid #e6e6e6;
    }

    .el-menu {
        border-right: none;
    }

    .select-project {
        border: 1px solid #409EFF;
        border-radius: 3px;
        padding: 3px 11px;
    }

    #select-project-header {
        margin-top: 20px;
        padding-left: 10px;
        margin-bottom: 10px;
    }

    .box-card {
        border: none;
        border-bottom: 1px solid #ebeef5;
        border-radius: 0;
    }

    .box-card >>> .el-card__body {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    >>> .el-loading-spinner {
        margin-top: -10px;
    }

    >>> .el-submenu .el-menu-item {
        padding-left: 5px !important;
        margin-left: 40px;
    }

    .create-endpoint {
        border-bottom: 1px solid #eee;
        margin-bottom: 10px;
        color: #f56c6c;
        font-weight: bold;
    }

    .create-endpoint:hover,
    .create-endpoint:focus,
    .create-endpoint:active{
        background-color: #fef0f0;
    }

    #dispatchForm {
        border: 1px solid #eee;
        padding: 30px 20px;
        margin-top: -20px;
        position: relative
    }

    #dispatchForm >>> .el-input {
        width: 300px;
    }

    #editEndpointFormBtn {
        position: absolute;
        right: 0;
        top: 0;
        border: none;
    }

    hr {
        width: 750px;
        margin: -6px 0 18px 41px;
        border-top: 0;
    }

    >>> .el-badge .el-badge__content {
        display: inline-block !important;
        margin-top: -2px;
    }

    >>> .el-input.is-disabled {
        color: #898e96;
    }

</style>
