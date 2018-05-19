<template>
    <div class="fillcontain">
        <head-top></head-top>
        <p class="explain_text">欢迎使用chinogo后台管理系统</p>
    </div>
</template>

<script>
	import headTop from '../components/headTop'
    export default {
    	components: {
    		headTop,
    	},
    }
</script>

<style lang="less" type="text/less">
	@import '../style/mixin';
	.explain_text{
		margin-top: 20px;
		text-align: center;
		font-size: 20px;
		color: #333;
	}
</style>
