<template>
    
</template>

<script>
export default {
    created() {
        this.$client.get('user', {}).subscribe(user => {
            
        })
    }
}
</script>
