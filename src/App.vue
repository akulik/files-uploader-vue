<template>
  <div id="app">
    <load-img v-show="step === 1" v-on:next-step="nextStep" v-on:createSet="createSet"></load-img>
    <div v-if="step > 1 && files.length">
      <vue-select-image
                        :dataImages="files"
                        :is-multiple="true"
                        v-on:onSelectMultipleImage="onSelectImage">
      </vue-select-image>
      <a href="javascript:void(0)" @click="prevStep">Cancel</a>
      <a href="javascript:void(0)" @click="nextStep" v-if="step < 3 && imagesToPay.length">Add Delivery Info</a>
        <div class="panel panel-default" v-if="step === 3 && imagesToPay.length">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-container">
                <form  v-on:submit.prevent="onSubmit">
                  <vue-form-generator :schema="schema" :model="model" :options="formOptions"></vue-form-generator>
                </form>
              </div>
            </div>
          </div>
        </div>
      <div v-if="step === 4 && imagesToPay.length">
        <form v-on:submit.prevent="onSubmit">
          <stripe-checkout
                  v-on:vue-stripe.success="handleSuccess"
                  onSuccess="broadcast"
                  stripe-key="pk_test_ke0sdgKOfLCIti2s1sMJLOIq"
                  :product="product">
          </stripe-checkout>
        </form>
      </div>
    </div>

  </div>
</template>

<script>

    // swap as you need
    import * as _ from 'underscore';
    import loadImg from './load-img.vue';
    import { StripeCheckout, Bus } from 'vue-stripe';
    import VueSelectImage from 'vue-select-image';
    import VueFormGenerator from "vue-form-generator";

    Bus.$on('vue-stripe.success', payload => {
        console.log(payload);
        debugger;
    });

    export default {
        name: 'app',
        data:  function () {
            return {
            step: 1,
            product:{},
            imagesToPay:[],
            files: [],
            model: {
                name: null,
                address: null,
                age: null,
                phone: null,
                email: null,
            },
            schema: {
                fields: [{
                    type: "input",
                    inputType: "text",
                    label: "Name",
                    model: "name",
                    readonly: false,
                    featured: true,
                    required: true,
                    disabled: false,
                    placeholder: "User's name",
                    validator: VueFormGenerator.validators.string
                }, {
                    type: "input",
                    inputType: "text",
                    label: "Address",
                    model: "address",
                    min: 6,
                    placeholder: "Address for delivery",
                    required: true,
                    hint: "Minimum 6 characters",
                    validator: VueFormGenerator.validators.string
                }, {
                    type: "input",
                    inputType: "text",
                    label: "Phone",
                    model: "phone",
                    required: true,
                    placeholder: "Phone number like ",
                    validator: VueFormGenerator.validators.phone
                }, {
                    type: "input",
                    inputType: "number",
                    label: "Age",
                    model: "age",
                    min: 18,
                    placeholder: "Your age",
                    validator: VueFormGenerator.validators.number
                }, {
                    type: "input",
                    inputType: "email",
                    label: "E-mail",
                    model: "email",
                    placeholder: "User's e-mail address",
                    validator: VueFormGenerator.validators.email
                }, {
                    type: "submit",
                    buttonText: "Submit",
                    validateBeforeSubmit: true
                },
                ]
            },
            formOptions: {
                validateAfterLoad: false,
                validateAfterChanged: true,
                validateBeforeSave: true
            }
          }
        },
        components: {
            'load-img': loadImg,
            'vue-select-image': VueSelectImage,
            'vue-form-generator': VueFormGenerator.component,
            'stripe-checkout': StripeCheckout
        },
        methods: {
            handleSuccess(payload) {
                debugger;

                alert(payload);
                console.log(payload);
            },
            nextStep(){
                if (this.step < 4) {
                    this.step+= 1;
                }
            },
            prevStep(){
                if (this.step > 1) {
                    this.step-= 1;
                }
            },
            createSet(uploadedFiles) {
                this.files = [];
                _.each(uploadedFiles, function(img) {
                    img.src = img.url;
                    img.alt = img.fileName;
                    this.files.push(img);
                }, this);
            },
            onSelectImage(files){
                this.imagesToPay = files;
                this.product = {
                    name: 'Payment for the images',
                    description: 'You added '+ files.length + ' images.',
                    amount: 100 * files.length
                }
            },
            onSubmit(e){
                e.preventDefault();
                this.nextStep();
                return false;
            }
        }
    }
</script>

<style lang="css">
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  .modal-container {
    width: 300px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }
  .vue-form-generator .form-group.error input:not([type=checkbox]) {
     border: 1px solid red;
     background-color: rgba(255,0,0,.15);
   }
  .vue-form-generator .form-group.error .errors {
      color: red;
      font-size: .8em;
    }
  .vue-form-generator * {
    box-sizing: border-box;
  }
  .vue-form-generator .form-group.error .errors span {
     display: block;
     background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAiklEQ…h/4SmRM+6Agw/xIX0tKEDFufeDNRUc4XqLRz3qabVIf3BMHwl6Ktexn3nmAAAAAElFTkSuQmCC);
     background-repeat: no-repeat;
     padding-left: 17px;
     padding-top: 0;
     margin-top: .2em;
     font-weight: 600;
   }
  .vue-form-generator * {
     box-sizing: border-box;
  }
  .vue-form-generator .hint {
     font-style: italic;
     font-size: .8em;
  }
  .vue-form-generator .form-control {
     display: block;
     padding: 6px 12px;
     font-size: 14px;
     width: 90%;
     line-height: 1.42857143;
     color: #555;
     background-color: #fff;
     background-image: none;
     border: 1px solid #ccc;
     border-radius: 4px;
     box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
     transition: border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  }
  .vue-form-generator .form-group {
    display: inline-block;
    vertical-align: top;
    width: 100%;
    margin-bottom: 1rem;
  }
</style>
