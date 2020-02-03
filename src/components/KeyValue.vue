<script>
function containsPairedArrays(arr) {
    return arr.every(item => Array.isArray(item) && item.length == 2);
}
export default {
    props: {
        items: {
            validator: (items) => containsPairedArrays(items) || items.length % 2 == 0
        },
        keyStyle: {
            default: ''
        },
        valueStyle: {
            default: ''
        },
        align: {
            default: 'left'
        }
    },
    computed: {
        pairs() {
            if (containsPairedArrays(this.items)) return this.items;
            
            const toReturn = [];
            for (let i = 0; i < this.items.length; i += 2) {
                toReturn.push(this.items.slice(i, i + 2))
            }
            return toReturn;
        },
        keyAlign() {
            return {
                left: 'text-left',
                center: 'text-right',
                right: 'text-right',
                between: 'text-left'
            }[this.align];
        },
        valueAlign() {
            return {
                left: 'text-left',
                center: 'text-left',
                right: 'text-right',
                between: 'text-right'
            }[this.align];
        }
    }
};
</script>

<template>
<table>
    <tr v-for="[key, value] in pairs" :key="key">
        <td :class="keyAlign + ' ' + keyStyle">{{ key }}</td>
        <td :class="valueAlign + ' ' + valueStyle">{{ value }}</td>
    </tr>
</table>
</template>