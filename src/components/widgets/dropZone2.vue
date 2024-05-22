
<template>
  <div
    @dragenter.prevent="toggleActive"
    @dragleave.prevent="toggleActive"
    @dragover.prevent
    @drop.prevent="toggleActive"
    :class="{ 'active-dropzone': active }"
    class="dropzone position-relative"
  >
    <div>
        <i class="display-6 text-muted ri-upload-cloud-2-fill"></i>
    </div>
    <small>Drop files here or click to upload.</small>
    <label for="drop" class="stretched-link">Upload</label>
   <input type="file" id="drop" class="dropzoneFile btn btn-primary" />
  </div>
</template>


<script>
import { ref } from "vue";
export default {
  name: "drop",
  setup() {
    const active = ref(false);
    const toggleActive = () => {
      active.value = !active.value;
    };
    return { active, toggleActive };
  },
};
</script>
