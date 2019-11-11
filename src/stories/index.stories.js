/* eslint-disable import/no-extraneous-dependencies */
// import { storiesOf } from '@storybook/vue'
// import { action } from '@storybook/addon-actions'
// import { linkTo } from '@storybook/addon-links'

import MyButton from '../components/MyButton.vue'
import KeyTrainer from '../components/KeyTrainer.vue'

import { story } from './stories.js';

const toTrain = [{ action: 'save file', sequence: 'ctrl+s' }]
export const KeyTrainerStory = story(KeyTrainer, { toTrain });

// storiesOf('Button', module)
//   .add('with text', () => ({
//     components: { MyButton },
//     template: '<my-button @click="action">Hello Button</my-button>',
//     methods: { action: action('clicked') }
//   }))
//   .add('with some emoji', () => ({
//     components: { MyButton },
//     template: '<my-button @click="action">😀 😎 👍 💯</my-button>',
//     methods: { action: action('clicked') }
//   }))


// storiesOf('KeyTrainer', module)
//   .add('default', () => ({
//     components: { KeyTrainer },
//     template: '<key-trainer :to-train="toTrain"/>',
//     data() {
//       return {
//         toTrain: [
//             { action: 'Underline text', sequence: 'ctrl+u' },
//             { action: 'Bold text', sequence: 'ctrl+b' },
//         ]
//       }
//     }
//   }))