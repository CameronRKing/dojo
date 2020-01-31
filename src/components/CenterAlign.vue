<script>
export default {
    props: {
        items: {
            validator: (items) => items.length % 2 == 0
        },
        keyStyle: {
            default: ''
        },
        valueStyle: {
            default: ''
        }
    },
    computed: {
        pairs() {
            const toReturn = [];
            for (let i = 0; i < this.items.length; i += 2) {
                toReturn.push(this.items.slice(i, i + 2))
            }
            return toReturn;
        }
    }
};
</script>

<template>
<table>
    <tr v-for="[key, value] in pairs">
        <td
            class="text-right"
            :class="keyStyle"
        >{{ key }}</td>
        <td
            class="text-left"
            :class="valueStyle"
        >{{ value }}</td>
    </tr>
</table>
</template>