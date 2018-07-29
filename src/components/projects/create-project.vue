<template>

    <el-row type="flex" justify="center" id="form-container" v-loading="redirecting" element-loading-text="Redirecting"
            element-loading-background="rgba(255, 255, 255, 1)">
        <el-col :span="10">
            <el-form ref="form" :model="form" status-icon :rules="rules"
                     label-width="200px">
                <el-form-item label="Project name" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="Site url" prop="url">
                    <el-input v-model="form.url"></el-input>
                </el-form-item>
                <el-form-item label="Dispatch endpoint" prop="url">
                    <el-input v-model="form.endpoint"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="onSubmit" :loading="loading" :disabled="!isFormValidated">Create
                    </el-button>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>

</template>

<script>
import firebase from 'firebase'
import db from '../../firebaseInit'

export default {
  name: 'CreateProject',
  data () {
    const validateNameLength = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('Please input a name for project'))
      } else {
        if (value.length < 5) {
          callback(new Error('Project name must be greater than 5 characters'))
        } else {
          callback()
        }
      }
      this.updateIsFormValidated()
    }
    return {
      loading: false,
      isFormValidated: false,
      redirecting: false,
      rules: {
        name: [
          {validator: validateNameLength, trigger: 'change'}
        ]
      },
      form: {
        name: '',
        url: '',
        endpoint: ''
      }
    }
  },
  methods: {
    onSubmit () {
      this.loading = !this.loading
      const slug = this.form.name.split(' ').join('-').toLowerCase()
      db.collection('projects').add({
        name: this.form.name,
        url: this.form.url,
        endpoint: ['/', this.form.endpoint.replace(/\//g, '')].join(''),
        slug: slug,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      })
        .then(docRef => {
          this.redirecting = true
          this.$notify({
            title: 'Success',
            message: 'Project created successfully',
            type: 'success'
          })

          setTimeout(() => {
            this.$router.push(`/project/${slug}`)
          }, 2000)
        }, error => {
          console.log(error)
          this.$notify.error({
            title: 'Error',
            message: 'Something went wrong'
          })
          this.loading = !this.loading
        })
    },
    updateIsFormValidated () {
      const fields = this.$refs.form.fields
      if (fields.find((f) => f.validateState === 'validating')) {
        setTimeout(() => { this.updateIsFormValidated() }, 100)
      } else {
        this.isFormValidated = fields.reduce((acc, f) => {
          const valid = (f.isRequired && f.validateState === 'success')
          const notErroring = (!f.isRequired && f.validateState !== 'error')
          return acc && (valid || notErroring)
        }, true)
      }
    }
  }
}
</script>

<style scoped>
    button {
        width: 100%;
        display: block;
    }

    #form-container {
        margin-top: 200px;
    }
</style>
