<script>
export default {
    props: ['ast'],
    computed: {
        props() {
    		return [
                {name: 'ast'}  
            ];
        },
    }
}
</script>



<template>
    <ul class="pl-2">
        <li>
            <div class="expandible-header">props {{ props.length }}</div>
            <div class="expandible-body">
                
            </div>
    	</li>
        <li>data</li>
        <li>computed</li>
        <li>watch</li>
        <li>hooks</li>
        <li>methods</li>
        <li class="border border-black"></li>
        <li>uses</li>
        <li>used by</li>
        <li class="border border-black"></li>
        <li>tests</li>
        <li>stories</li>
    </ul>
</template>