import Vue from 'vue'
import Vuex from 'vuex'
import {getAdminInfo} from '@/api/getData'

Vue.use(Vuex)

const state = {
	adminInfo: {
		avatar: 'default.jpg'
	},
}

const mutations = {
}

const actions = {
}

export default new Vuex.Store({
	state,
	actions,
	mutations,
})
