const router = require('koa-router')();

// filter
const login_filter = require('../filters/login_filter');
const admin_filter = require('../filters/admin_filter');

// front route
const index_route = require('./index_route');
const project_route = require('./project_route');
const task_route = require('./task_route');
const apidoc_route = require('./apidoc_route');
const chat_route = require('./chat_route');

// admin route
const index_admin_route = require('./admin/index_admin_route');
const user_admin_route = require('./admin/user_admin_route');
const project_admin_route = require('./admin/project_admin_route');
const department_admin_route = require('./admin/department_admin_route');

router.get('/', login_filter.is_login, index_route.index);
router.get('/login', index_route.login);
router.get('/register', index_route.register);
router.post('/login', index_route.process_login);
router.post('/register', index_route.process_register);
router.get('/logout', index_route.logout);
router.post('/uploadFile', login_filter.is_login, index_route.uploadFile);
router.get('/chat', login_filter.is_login, chat_route.index);

router.get('/project', login_filter.is_login, project_route.index);
router.get('/project/:id', login_filter.is_login, project_route.detail);
router.get('/project/:projectId/task/:taskId', login_filter.is_login, task_route.index);
router.get('/my_task', login_filter.is_login, task_route.my_task);

router.get('/apidoc', login_filter.is_login, apidoc_route.index);
router.get('/apidoc/:id', login_filter.is_login, apidoc_route.detail);

// ------------------------------------------------------------------------------------
router.get('/admin/index', login_filter.is_login, admin_filter.is_admin, index_admin_route.index);

router.get('/admin/user/list', login_filter.is_login, admin_filter.is_admin, user_admin_route.list);
router.get('/admin/user/edit', login_filter.is_login, admin_filter.is_admin, user_admin_route.edit);
router.post('/admin/user/edit', login_filter.is_login, admin_filter.is_admin, user_admin_route.process_edit);
router.get('/admin/user/delete', login_filter.is_login, admin_filter.is_admin, user_admin_route.delete);

router.get('/admin/project/list', login_filter.is_login, admin_filter.is_admin, project_admin_route.list);
router.get('/admin/project/delete', login_filter.is_login, admin_filter.is_admin, project_admin_route.delete);

router.get('/admin/department/list', login_filter.is_login, admin_filter.is_admin, department_admin_route.list);
router.get('/admin/department/add', login_filter.is_login, admin_filter.is_admin, department_admin_route.add);
router.post('/admin/department/add', login_filter.is_login, admin_filter.is_admin, department_admin_route.process_add);
router.get('/admin/department/edit', login_filter.is_login, admin_filter.is_admin, department_admin_route.edit);
router.post(
  '/admin/department/edit',
  login_filter.is_login,
  admin_filter.is_admin,
  department_admin_route.process_edit
);
router.get('/admin/department/delete', login_filter.is_login, admin_filter.is_admin, department_admin_route.delete);

module.exports = router;
