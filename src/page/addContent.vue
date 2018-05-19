<template>
    <div>
        <head-top></head-top>
        <el-row style="margin-top: 20px;">
            <el-col :span="22" :offset="1">
                <el-form :model="contentForm" :rules="categoryRules" ref="contentForm" label-width="110px"
                         class="form item_form">
                    <el-form-item label="内容标题" prop="title">
                        <el-input v-model="contentForm.title"></el-input>
                    </el-form-item>
                    <el-form-item label="内容子标题">
                        <el-input v-model="contentForm.subTitle"></el-input>
                    </el-form-item>
                    <el-form-item label="标题描述">
                        <el-input type="textarea" autosize v-model="contentForm.titleDesc"></el-input>
                    </el-form-item>
                    <el-form-item label="URL">
                        <el-input style="width: 260px" v-model="contentForm.url"></el-input>
                    </el-form-item>
                    <el-form-item label="图片">
                        <el-upload
                            class="avatar-uploader"
                            :action="baseImgRootPath + '/upload/file'"
                            name="uploadFile"
                            list-type="picture-card"
                            :file-list="upload_file_list"
                            :before-upload="beforeImgUpload"
                            :on-preview="handlePictureCardPreview"
                            :on-success="handUploadSuccess"
                            :on-remove="handleRemove">
                            <i class="el-icon-plus"></i>
                        </el-upload>
                        <el-dialog v-model="image_dialogVisible" size="tiny">
                            <img width="100%" :src="image_dialog" alt="">
                        </el-dialog>
                    </el-form-item>

                    <el-form-item label="内容">
                        <div class="edit_container">
                            <quill-editor v-model="contentForm.content"
                                          ref="myQuillEditor"
                                          class="editer">
                            </quill-editor>
                        </div>
                    </el-form-item>
                </el-form>
                <el-button v-if="JSON.stringify(curr_content) != '{}'" type="primary"
                           style="margin-bottom: 50px; margin-top: 30px" @click="updateContent('contentForm')">
                    重新修改内容
                </el-button>
                <el-button v-else type="primary" style="margin-bottom: 50px; margin-top: 30px"
                           @click="addContent('contentForm')">
                    确认添加内容
                </el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import headTop from '@/components/headTop'
    import {
        insertContent,
        updateContent,
        deleteFile
    } from '@/api/getData'
    import {baseImgRootPath} from '@/config/env'
    import {quillEditor} from 'vue-quill-editor'

    export default {
        props: ['curr_content', 'curr_contentCategory'],
        data: function () {
            let requireImg = (rule, value, callback) => {
                if (this.contentForm.pic === '') {
                    callback(new Error("请添加图片"))
                } else {
                    callback()
                }
            }
            return {
                image_dialogVisible: false,
                // 当前选择的图片文件路径
                image_dialog: '',
                // 上传的文件列表, 格式[["name":"","url":""]]
                upload_file_list: [],
                // 上传的文件列表，格式["","",""]
                images: [],
                baseImgRootPath,
                contentForm: {
                    categoryId: 0,
                    title: '',
                    subTitle: '',
                    titleDesc: '',
                    url: '',
                    pic: '',
                    content: ''
                },
                categoryRules: {
                    title: [
                        {required: true, message: '请输入标题', trigger: 'blur'}
                    ]
                }
            }
        },
        components: {
            headTop,
            quillEditor
        },
        computed: {
            editor() {
                return this.$refs.myQuillEditor.quill
            }
        },
        methods: {
            // 上传前判断图片是否可以上传
            beforeImgUpload(file) {
                const isRightType = (file.type === 'image/jpeg') || (file.type === 'image/png')
                const isLt10M = file.size / 1024 / 1024 < 10

                if (!isRightType) {
                    this.$message.error('上传头像图片只能是 JPG 或者 PNG 格式!')
                }
                if (!isLt10M) {
                    this.$message.error('上传头像图片大小不能超过 10MB!')
                }
                return isRightType && isLt10M
            },
            // 上传成功后处理
            handUploadSuccess(res, file) {
                // 判断是否上传服务器成功
                if (res.status === 'success') {
                    this.image_dialog = res.file_path
                    if (!this.images) {
                        this.images = []
                    }
                    this.images.push(res.file_path)
                    this.contentForm.pic = this.images.join(',')
                } else {
                    this.$message.error(res.file_path)
                }
            },
            // 处理图片预览
            handlePictureCardPreview(file) {
                this.image_dialog = file.url
                this.image_dialogVisible = true
            },
            // 移除图片
            async handleRemove(file) {
                // 将图片从服务器中删除
                // 判断是否编辑模式
                let image_url = ""
                if (this.curr_content.id) { // 此时是编辑模式
                    image_url = file.url
                } else {
                    image_url = file.response.file_path
                }
                let del_image = image_url.substr(image_url.indexOf('/group') + 1)
                // 无论无何都得把该图片从要提交的图片数组中去除
                let index = this.images.indexOf(image_url)
                // 如何值存在的话
                if (index > -1) {
                    this.images.splice(index, 1)
                    this.contentForm.image = this.images.join(',')
                }
                await deleteFile({"fileId": del_image})
                    .then(res => {
                        this.$message.success(res.message)
                    })
            },
            // 添加内容
            addContent(contentForm) {
                this.$refs[contentForm].validate(async (valid) => {
                    if (valid) {
                        this.contentForm.categoryId = this.curr_contentCategory.id
                        try {
                            await insertContent(this.contentForm)
                                .then(res => {
                                    if (res.status === 'success') {
                                        this.$message({
                                            type: 'success',
                                            message: '添加成功'
                                        })
                                        setTimeout(() => {
                                            this.$router.go(0)
                                        }, 1500)
                                    } else {
                                        this.$message({
                                            type: 'error',
                                            message: '添加失败'
                                        })
                                    }
                                })
                        } catch (err) {
                            console.log(err)
                            this.$message({
                                type: 'error',
                                message: '添加失败'
                            })
                        }
                    } else {
                        this.$notify.error({
                            title: '错误',
                            message: '请检查输入是否正确',
                            offset: 100
                        })
                        return false
                    }
                })
            },
            // 内容编辑前的渲染
            async editContent() {
                // 通过判断curr_content 来判断此时是否是编辑内容模式
                if (this.curr_content.id) {
                    // 此时是编辑内容模式
                    // 以下操作用来回显编辑内容的页面
                    // 给当前的内容赋值
                    this.contentForm = this.curr_content
                    // 给当前的图片数组赋值
                    if (this.curr_content.pic) {
                        this.images = this.curr_content.pic.split(',')
                    } else {
                        this.images = []
                    }
                    // 给当前的图片文件列表赋值,用来在页面显示
                    this.upload_file_list = [] // 先将图片清空
                    for (let imagePath of this.images) {
                        let upload_file = {}
                        upload_file.name = ""
                        upload_file.url = imagePath
                        this.upload_file_list.push(upload_file)
                    }
                }
            },
            // 编辑完后更新内容
            updateContent(contentForm) {
                this.$refs[contentForm].validate(async (valid) => {
                    if (valid) {
                        try {
                            // 新增内容参数
                            this.contentForm.categoryId = this.curr_contentCategory.id
                            this.contentForm.pic = this.contentForm.image
                            await updateContent(this.contentForm)
                                .then(res => {
                                    if (res.status === 'success') {
                                        this.$message({
                                            type: 'success',
                                            message: '更新成功'
                                        })
                                        setTimeout(() => {
                                            this.$router.go(0)
                                        }, 1500)
                                    } else {
                                        this.$message({
                                            type: 'error',
                                            message: '更新失败'
                                        })
                                    }
                                })
                        } catch (err) {
                            console.log(err)
                            this.$message({
                                type: 'error',
                                message: '更新失败'
                            })
                        }
                    } else {
                        this.$notify.error({
                            title: '错误',
                            message: '请检查输入是否正确',
                            offset: 100
                        })
                        return false
                    }
                })
            }
        }
    }
</script>

<style lang="less" type="text/less">
    @import '../style/mixin';

    .form {
        min-width: 400px;
        margin-bottom: 30px;
        &:hover {
            box-shadow: 0 0 8px 0 rgba(232, 237, 250, .6), 0 2px 4px 0 rgba(232, 237, 250, .5);
            border-radius: 6px;
            transition: all 400ms;
        }
    }

    .item_form {
        border: 1px solid #eaeefb;
        padding: 10px 10px 0;
    }

    .avatar-uploader .el-upload {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
    }

    .avatar-uploader .el-upload:hover {
        border-color: #20a0ff;
    }

    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 120px;
        height: 120px;
        line-height: 120px;
        text-align: center;
    }

    .avatar {
        width: 120px;
        height: 120px;
        display: block;
    }

    .edit_container {
        margin-bottom: 90px;
    }

    .editer {
        height: 350px;
    }

    .group {
        width: 630px;
        text-align: center;
        margin-bottom: 10px
    }
</style>
