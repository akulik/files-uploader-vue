/**
 * Created by andrey on 29.09.17.
 */
import VueCoreImageUpload from 'vue-image-crop-upload';

export default {
    extends: VueCoreImageUpload,

    methods: {
            setSourceImg(file) {
                this.reset();
                this.cropWidth = file.width;
                this.cropHeight = file.height;
                this.item = file;
                this.sourceImgUrl = file.url;
                this.startCrop();
            },
            prepareUpload() {
                let {
                    url,
                    createImgUrl
                } = this;
                if(typeof createImgUrl == 'string' && createImgUrl){
                    this.$emit('crop-success', createImgUrl, this.item);
                    this.reset();
                }else{
                    this.off();
                }
            }
        },
    };
