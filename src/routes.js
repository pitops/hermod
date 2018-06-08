import CreateProject from './components/projects/create-project'
import ShowProject from './components/projects/show-project'
import Dashboard from './components/dashboard'

export const routes = [
  { path: '', component: Dashboard },
  { path: '/project/create', component: CreateProject },
  { path: '/project/:slug', name: 'project', component: ShowProject },
  { path: '*', redirect: '/' }
]
