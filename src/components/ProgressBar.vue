<script>
export default {
    props: ['progress'],
}
</script>



<template>
    <div class="h-1 w-full bg-green-200">
        <div class="h-1 bg-green-400 progress-bar" :style="{width: progress * 100 + '%'}"></div>
    </div>
</template>



<style>
.progress-bar {
    transition: width 0.3s;
}
</style>