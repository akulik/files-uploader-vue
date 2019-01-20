/**
 * Created by andrey on 06.10.17.
 */
<template>
    <div class="container load-img">
    <!--UPLOAD-->
    <form enctype="multipart/form-data" novalidate >
<h1>Upload images</h1>
<div class="dropbox">
    <input type="file" multiple :name="uploadFieldName" :disabled="isSaving" @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
accept="image/*" class="input-file">
    <p>
    Drag your file(s) here to begin<br> or click to browse
</p>
<p v-if="isSaving">
    Uploading {{ fileCount }} files...
</p>
</div>
</form>
<!--SUCCESS-->
<div v-if="uploadedFiles.length ">
    <h2>Uploaded {{ uploadedFiles.length }} file(s) successfully.</h2>
<p>
    <a href="javascript:void(0)" @click="createSet">Create a set</a>
    <a href="javascript:void(0)" @click="reset()">Clear uploaded files</a>
</p>
<div class="list-unstyled">

    <myUpload field="img"
        @crop-success="cropSuccess"
        @crop-upload-success="cropUploadSuccess"
        @crop-upload-fail="cropUploadFail"
        @setSourceImg=""
        v-model="showCropper"
        :width="cropWidth"
        :height="cropHeight"
        url="/upload"
        :noCircle="true"
        langType="en">
    </myUpload>
    <div v-for="item in uploadedFiles" class="div-thumbnail">
    <img @click="toggleShowCropper(item)" :src="item.url" class="img-responsive img-thumbnail" :alt="item.originalName">
    </div>
    </div>
    </div>
    <!--FAILED-->
    <div v-if="isFailed">
    <h2>Uploaded failed.</h2>
<p>
<a href="javascript:void(0)" @click="reset()">Try again</a>
</p>
<pre>{{ uploadError }}</pre>
</div>
</div>
</template>

<script>
const BASE_URL = 'http://localhost:3001';

// swap as you need
import * as _ from 'underscore';
import * as axios from 'axios';
import VueCoreImageUpload  from './cropper.js';
import { upload , getImage, getBase64Image } from './file-upload.fake.service.js'; // fake service
// import { upload } from './file-upload.service';   // real service
const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

export default {
    name: 'load-img',
    data() {
        return {
            uploadedFiles: [],
            uploadError: null,
            cropHeight: 200,
            cropWidth: 200,
            currentStatus: null,
            showCropper: false,
            sourceImgUrl: false,
            circle: false,
            uploadFieldName: 'photos'
        }
    },
    computed: {
        isInitial() {
            return this.currentStatus === STATUS_INITIAL;
        },
        isSaving() {
            return this.currentStatus === STATUS_SAVING;
        },
        isSuccess() {
            return this.currentStatus === STATUS_SUCCESS;
        },
        isFailed() {
            return this.currentStatus === STATUS_FAILED;
        }
    },
    methods: {
        createSet() {
            this.$emit('next-step');
            this.$emit('createSet',this.uploadedFiles);
        },
        reset() {
            // reset form to initial state
            this.currentStatus = STATUS_INITIAL;
            this.uploadedFiles = [];
            this.uploadError = null;
        },
        toggleShowCropper(item) {
            this.showCropper = !this.showCropper;
            let child = this.$children[0],
                that = this,
                i = new Image();

            i.onload = function(){
                child.setSourceImg(item);
            };

            i.src = item.url;
        },
        /**
         * crop success
         *
         * [param] imgDataUrl
         * [param] field
         */
        cropSuccess(imgDataUrl, item){
            this.showCropper = false;
            _.each(this.uploadedFiles, function(img, index) {
                if (img == item) {
                    this.uploadedFiles[index]['url'] = imgDataUrl;
                }
            }, this)
        },
        /**
         * upload success
         *
         * [param] jsonData  server api return data, already json encode
         * [param] field
         */
        cropUploadSuccess(jsonData, field){
            console.log('-------- upload success --------');
            console.log(jsonData);
            console.log('field: ' + field);
        },
        /**
         * upload fail
         *
         * [param] status    server api return error status, like 500
         * [param] field
         */
        cropUploadFail(status, field){
            console.log('-------- upload fail --------');
            console.log(status);
            console.log('field: ' + field);
        },
        save(formData) {
            // upload data to the server
            this.currentStatus = STATUS_SAVING;
            const url = `${BASE_URL}/photos/upload`;
            upload(formData)
                .then(x => {

                    let that = this;
                    let tmpImgs = [].concat(x);

                    _.each(tmpImgs, function(comment) {
                        that.uploadedFiles.push(comment);
                    });

                    this.currentStatus = STATUS_SUCCESS;
                })
                .catch(err => {
                    this.uploadError = err.response;
                    this.currentStatus = STATUS_FAILED;
                });
        },
        filesChange(fieldName, fileList) {
            // handle file changes
            const formData = new FormData();
            if (!fileList.length) return;
            // append the files to FormData
            Array
                .from(Array(fileList.length).keys())
                .map(x => {
                    formData.append(fieldName, fileList[x], fileList[x].name);
                });
            // save it
            this.save(formData);
        }
    },
    mounted() {
        this.reset();
    },
    components: {
        'myUpload': VueCoreImageUpload
    }
}
</script>

<style lang="scss">
.dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
}

.input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
}

.dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
}

.dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
}
.vue-image-crop-upload .vicp-wrap .vicp-operate a:first-child{
    visibility: hidden !important;
}
.vicp-preview-item img {
    width: 200px !important;
    height: 200px !important;

}

.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-right {
    width: 200px !important;
    height: 200px !important;
}
.vicp-crop-right {
    visibility: hidden !important;
}
.vue-image-crop-upload .vicp-wrap .vicp-operate {
    right: 15% !important;
}

.vue-image-crop-upload .vicp-wrap .vicp-step2 .vicp-crop .vicp-crop-left {
    padding-left: 16%;
}
.vue-image-crop-upload .vicp-wrap {
    width: 400px !important;
}
.img-thumbnail {
    max-height: 200px;
}
.div-thumbnail {
    float: left;
    padding: 13px
}
.list-unstyled {
    display: block;
}
.VueSelectImage__img {
     -webkit-user-drag: none;
     display: block;
     max-height: 200px !important;
     /*max-width: 100%;*/
     margin-right: auto;
     margin-left: auto;
 }
</style>