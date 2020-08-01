<template>
  <div class="home">
    {{ pingCount }}
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "Home",
  data() {
    return {
      pingCount: 0,
    };
  },

  mounted() {
    const evtSource = new EventSource(
      "http://localhost:5555/presence?chatIds[]=a&chatIds[]=b"
    );
    evtSource.addEventListener("ping", (event) => {
      console.log(event);
      this.pingCount = this.pingCount + 1;
    });
  },
};
</script>
