import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const login = r => require.ensure([], () => r(require('@/page/login')), 'login');
const manage = r => require.ensure([], () => r(require('@/page/manage')), 'manage');
const home = r => require.ensure([], () => r(require('@/page/home')), 'home');
const addItems = r => require.ensure([], () => r(require('@/page/addItems')), 'addItems');
const addItemParam = r => require.ensure([], () => r(require('@/page/addItemParam')), 'addItemParam');
const addContentCategory = r => require.ensure([], () => r(require('@/page/addContentCategory')), 'addContentCategory');
const userList = r => require.ensure([], () => r(require('@/page/userList')), 'userList');
const ItemList = r => require.ensure([], () => r(require('@/page/itemList')), 'itemList');
const contentList = r => require.ensure([], () => r(require('@/page/contentList')), 'contentList');
const itemParamList = r => require.ensure([], () => r(require('@/page/itemParamList')), 'itemParamList');
const explain = r => require.ensure([], () => r(require('@/page/explain')), 'explain');

const routes = [
    {
        path: '/',
        component: login
    },
    {
        path: '/manage',
        component: manage,
        name: '',
        children: [{
            path: '',
            component: home,
            meta: [],
        }, {
            path: '/addItems',
            component: addItems,
            meta: ['添加数据', '添加商品'],
        }, {
            path: '/addItemParam',
            component: addItemParam,
            meta: ['添加数据', '添加商品规格'],
        }, {
            path: '/addContentCategory',
            component: addContentCategory,
            meta: ['添加数据', '添加广告内容分类'],
        }, {
            path: '/userList',
            component: userList,
            meta: ['数据管理', '用户列表'],
        }, {
            path: '/itemList',
            component: ItemList,
            meta: ['数据管理', '商品列表'],
        }, {
            path: '/itemParamList',
            component: itemParamList,
            meta: ['数据管理', '商品规格列表'],
        }, {
            path: '/contentList',
            component: contentList,
            meta: ['数据管理', '内容广告列表'],
        },{
            path: '/explain',
            component: explain,
            meta: ['说明', '说明'],
        }]
    }
]

export default new Router({
    routes,
    strict: process.env.NODE_ENV !== 'production',
})
