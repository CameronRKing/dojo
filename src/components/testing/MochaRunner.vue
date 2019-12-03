<script>
import MochaRunner from '@/testing/MochaRunner.js';

export default {
	data() {
		return {
			mocha: null,
			runner: null,
			tests: [],
			toRender: {'can be mounted directly to the DOM': true},
		}
	},
	watch: {
		tests: {
			deep: true,
			handler(newVal) {
				const ref = test => this.$refs[test.title] && this.$refs[test.title][0];
				const mount = (context, tried=false) => {
					if (!ref(context.test)) {
						if (tried) throw new Error('unable to find mounting point for ' + context.test.title);
						this.$nextTick(() => mount(context, true))
					} else {
						ref(context.test).appendChild(context.cmp.vm.$el);
						context.mounted = true;
					}
				}
				const unmount = (context) => {
					const el = ref(context.test);
					el.removeChild(el.lastChild);
					context.mounted = false;
				}

				newVal.forEach(context => {
					const { test, render, mounted } = context;
					if (render && !mounted) {
						mount(context);
					} else if (!render && mounted) {
						unmount(context);
					}
				});

			}
		},  
	},
	created() {
		window.vm = this;
		this.run();
	},
	methods: {
		shouldRender(test) {
			return this.toRender[test.title];
		},
		run() {
			const runner = new MochaRunner(['components/MyButton.spec.js']);
			runner.run().then(console.log);

		},
	}
}
</script>

<template>
<div>
	<button @click="run">Run tests</button>
	<div v-for="context in tests">
		<h2>{{ context.test.title }}</h2>
		<label>render<input type="checkbox" v-model="context.render" /></label>
		<div :ref="context.test.title"></div>
	</div>
</div>
</template>