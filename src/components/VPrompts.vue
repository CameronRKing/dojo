<script>
export default {
    props: ['prompts']
}
</script>



<template>
<table class="text-gray-700 mx-auto whitespace-no-wrap">
    <tr v-for="[key, action] in prompts">
        <td class="text-right text-gray-900">{{ key }}:</td>
        <td class="text-left">&nbsp;{{ action }}</td>
    </tr>
</table>
</template>