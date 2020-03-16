<template>
    <div>
        <div v-html="html"></div>
    </div>
</template>
<style>

</style>
<script>
    export default {
        // 使用时请使用 :url.sync=""传值
        props: {
            url: {
                required: true
            }
        },
        data() {
            return {
                loading: true,
                html: '<h1>你好</h1><br><h1>Hello</h1><br><h1>こんにちは</h1><br><h1>안녕하세요</h1><br><h1>Привет</h1>'
            }
        },
        watch: {
            url(value) {
                this.load(value)
            }
        },
        mounted() {
            this.load(this.url)
        },
        methods: {
            load(url) {
                if (url && url.length > 0) {
                    // 加载中
                    this.loading = true
                    let param = {
                        accept: 'text/html, text/plain'
                    }
                    this.$axios.get(url, param).then((response) => {
                        this.loading = false
                        // 处理HTML显示
                        this.html = response.data
                    }).catch(() => {
                        this.loading = false
                        this.html = '加载失败'
                    })
                }
            }
        }
    }
</script>
