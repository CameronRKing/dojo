import Vue from 'vue'
import Vuex from 'vuex'
import FirebaseDojoRepo from '@/services/FirebaseDojoRepo';

Vue.use(Vuex)

export default new Vuex.Store({
	state: {
		dojoRepo: new FirebaseDojoRepo(),
	},
	mutations: {
	
	},
	actions: {
	
	}
})
