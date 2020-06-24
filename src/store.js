import Vue from 'vue'
import Vuex from 'vuex'
import FirebaseDojoRepo from '@/services/FirebaseDojoRepo';

Vue.use(Vuex)

export function makeStore() {
    return new Vuex.Store({
        state: {
            user: null,
            dojoRepo: new FirebaseDojoRepo(),
            dojo: null,
        },
        mutations: {
            updateUser(state, user) {
                state.user = user;
                state.dojoRepo.user = user;
            },
            setDojo(state, dojo) {
                state.dojo = dojo;
            }
        },
        actions: {
        
        }
    })
}

export default makeStore();