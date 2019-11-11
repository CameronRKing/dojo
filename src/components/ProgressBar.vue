<script>
export default {
    props: ['progress', 'noBackground'],
    path: __filename
};
</script>



<template>
    <div class="h-1 w-full" :class="{'bg-green-200': !noBackground}">
        <div class="h-1 bg-green-400 progress-bar" :style="{width: progress * 100 + '%'}"></div>
    </div>
</template>



<style>
.progress-bar {
    transition: width 0.3s;
}
</style>