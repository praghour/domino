<script setup>
import useFishman from '../composables/Arena';

const { fishList } = useFishman();
</script>

<template>
    <div class="fish" v-for="value in fishList" :key="value.id">
        <img :src="value.img" width="50px" :alt="value.name">
    </div>
    <div class="fish">{{ value.health }}</div>
    <div class="uebok">
        <img src="/public/710090f0fc77d351e3765c2954efa3bcb1886276.png" width="100px" alt="">
        <p class="health">health</p>
    </div>
</template>
<style>
.Fish{
    position: absolute;
    left: 200px;
}
.uebok{
    position: absolute;
    left: 600px;
}
</style>