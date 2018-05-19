<template>
    <div>
        <head-top></head-top>
        <el-row style="margin-top: 20px;">
            <el-col :span="22" :offset="1">
                <el-form :model="itemForm" :rules="itemRules" ref="itemForm" label-width="110px" class="form item_form">
                    <el-form-item label="商品类目" prop="cid">
                        <el-button type="text" @click="category_dialogVisible = true">选择类目</el-button>
                        {{this.curr_category.label}}
                        <el-dialog
                            title="选择类目"
                            :visible.sync="category_dialogVisible"
                            size="large"
                            :modal="false"
                            :before-close="handleClose">
                            <span>
                                <el-input
                                    placeholder="输入关键字进行过滤"
                                    v-model="filterCategory">
                                </el-input>
                                <el-tree
                                    :load="loadNode"
                                    lazy=""
                                    node-key="id"
                                    :filter-node-method="filterNode"
                                    ref="categoryTree"
                                    :props="treeProps"
                                    highlight-current
                                    accordion
                                    @node-click="handleNodeClick">
                                </el-tree>
                            </span>
                            <span slot="footer" class="dialog-footer">
                                <el-button @click="cancelSaveItem()">取 消</el-button>
                                <el-button type="primary" @click="ensureSaveItem()">确 定</el-button>
                            </span>
                        </el-dialog>
                    </el-form-item>
                    <el-form-item label="商品标题" prop="title">
                        <el-input v-model="itemForm.title"></el-input>
                    </el-form-item>
                    <el-form-item label="商品卖点" prop="sellPoint">
                        <el-input type="textarea" autosize v-model="itemForm.sellPoint"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="price">
                        <el-input style="width: 260px" v-model.number="itemForm.price"></el-input>
                        元
                    </el-form-item>
                    <el-form-item label="库存数量" prop="num">
                        <el-input style="width: 260px" v-model.number="itemForm.num"></el-input>
                        件
                    </el-form-item>
                    <el-form-item label="条形码" prop="barcode">
                        <el-input style="width: 260px" v-model="itemForm.barcode"></el-input>
                    </el-form-item>
                    <el-form-item label="上传商品图片" prop="image">
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
                    <el-form-item label="商品详情" prop="itemDesc">
                        <div class="edit_container">
                            <quill-editor v-model="itemForm.itemDesc"
                                          ref="myQuillEditor"
                                          class="editer">
                            </quill-editor>
                        </div>
                    </el-form-item>
                    <el-form-item label="商品状态" prop="status">
                        <el-radio class="radio" v-model="itemForm.status" :label="1">正常</el-radio>
                        <el-radio class="radio" v-model="itemForm.status" :label="2">下架</el-radio>
                        <el-radio class="radio" v-model="itemForm.status" :label="3">删除</el-radio>
                    </el-form-item>
                    <el-form-item label="重量" prop="weight">
                        <el-input style="width: 260px" v-model.number="itemForm.weight"></el-input>
                        克
                    </el-form-item>
                    <el-form-item label="颜色">
                        <el-input style="width: 260px" v-model="itemForm.colour"></el-input>
                    </el-form-item>
                    <el-form-item label="尺寸">
                        <el-input style="width: 260px" v-model="itemForm.size"></el-input>
                    </el-form-item>

                </el-form>

                <el-form v-show="show_itemParam" label-position="right" label-width="230px" class="form item_form"
                         :model="myItemParamForm">
                    <h3 style="margin-bottom: 20px; text-align: center">商品规格</h3>

                    <div v-for="(curr_paramData, index) in myItemParamForm.itemParamData">
                        <el-tag class="group" type="gray">{{curr_paramData.group}}</el-tag>

                        <el-form-item v-for="(param, index) in curr_paramData.params" :label="param.k">
                            <el-input style="width: 400px" v-model="param.v"></el-input>
                        </el-form-item>
                    </div>

                </el-form>

                <el-button v-if="typeof (this.curr_item) !== 'undefined'" type="primary"
                           style="margin-bottom: 50px; margin-top: 30px" @click="updateItem('itemForm')">
                    重新修改商品
                </el-button>
                <el-button v-else type="primary" style="margin-bottom: 50px; margin-top: 30px"
                           @click="addItem('itemForm')">
                    确认添加商品
                </el-button>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import headTop from '@/components/headTop'
    import {
        addItem,
        getCategoryByParentId,
        deleteFile,
        getItemParamByCid,
        getItemDescById,
        getItemParamItemByItemId,
        updateItem
    } from '@/api/getData'
    import {baseImgRootPath} from '@/config/env'
    import {quillEditor} from 'vue-quill-editor'

    export default {
        props: ['curr_item'],
        data: function () {
            let requireCid = (rule, value, callback) => {
                if (!this.curr_category.label) {
                    callback(new Error("请选择分类"))
                } else {
                    callback()
                }
            }
            let requireImg = (rule, value, callback) => {
                if (this.itemForm.image === '') {
                    callback(new Error("请添加图片"))
                } else {
                    callback()
                }
            }
            let requirePrice = (rule, value, callback) => {
                var re = /^[0-9]+.?[0-9]*$/
                if (re.test(value)) {
                    this.itemForm.price = (this.itemForm.price / 1).toFixed(2)
                    callback()
                } else {
                    callback("请输入商品价格")
                }
            }
            let requireNum = (rule, value, callback) => {
                var re = /^[0-9]+.?[0-9]*$/
                if (re.test(value)) {
                    this.itemForm.num = parseInt(value)
                    callback()
                } else {
                    callback("请输入数字类型")
                }
            }
            let requireWeight = (rule, value, callback) => {
                var re = /^[0-9]+.?[0-9]*$/
                if (re.test(value)) {
                    this.itemForm.weight = (this.itemForm.weight / 1).toFixed(2)
                    callback()
                } else {
                    callback("请输入商品重量")
                }
            }
            return {
                show_itemParam: false,
                // 商品规格参数
                myItemParamForm: {
                    itemParamData: []
                },
                curr_category: {},
                filterCategory: '',
                category_dialogVisible: false,
                image_dialogVisible: false,
                // 当前选择的图片文件路径
                image_dialog: '',
                // 上传的文件列表, 格式[["name":"","url":""]]
                upload_file_list: [],
                // 上传的文件列表，格式["","",""]
                images: [],
                baseImgRootPath,
                itemForm: {
                    cid: 0,
                    title: '',
                    sellPoint: '',
                    price: 0,
                    num: 0,
                    barcode: '',
                    image: '',
                    itemDesc: '',
                    status: 1,
                    weight: 0,
                    colour: '',
                    size: ''
                },
                itemRules: {
                    cid: [
                        {required: true, validator: requireCid, trigger: 'blur'}
                    ],
                    title: [
                        {required: true, message: '请输入商品名称', trigger: 'blur'}
                    ],
                    sellPoint: [
                        {required: true, message: '请输入商品卖点', trigger: 'blur'}
                    ],
                    price: [
                        {required: true, validator: requirePrice, trigger: 'blur'}
                    ],
                    num: [
                        {validator: requireNum, required: true, trigger: 'blur'}
                    ],
                    barcode: [
                        {required: true, message: '请输入商品条形码', trigger: 'blur'}
                    ],
                    image: [
                        {required: true, validator: requireImg, trigger: 'blur'}
                    ],
                    itemDesc: [
                        {required: true, message: '请输入商品描述', trigger: 'blur'}
                    ],
                    status: [
                        {type: 'integer', required: true, message: '请输入商品状态', trigger: 'blur'}
                    ],
                    weight: [
                        {validator: requireWeight, message: '请输入商品重量', trigger: 'blur'}
                    ]
                },
                treeProps: {
                    label: 'label',
                    children: 'children',
                    isLeaf: 'isLeaf'
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
        watch: {
            filterCategory(val) {
                this.$refs.categoryTree.filter(val);
            }
        },
        methods: {
            // 点击树节点操作
            handleNodeClick(data) {
                this.curr_category = data
                this.itemForm.cid = data.id
            },
            // 过滤树节点
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },
            // 加载树节点
            async loadNode(node, resolve) {
                //初始第一层节点，初始化数据，根节点配置
                if (node.level === 0) {
                    let treeList = []
                    await getCategoryByParentId()
                        .then(res => {
                            for (let eleTree of res) {
                                let tree = {}
                                tree.label = eleTree.label
                                tree.id = eleTree.id
                                tree.isLeaf = eleTree.isLeaf
                                treeList.push(tree)
                            }
                        })
                    return resolve(treeList)
                }
                var dataList = []
                await getCategoryByParentId({"parentId": node.data.id})
                    .then(res => {
                        if (res.length === 0) {
                            return resolve([])
                        }
                        for (let eleTree of res) {
                            let ch_tree = {}
                            ch_tree.id = eleTree.id
                            ch_tree.label = eleTree.label
                            ch_tree.isLeaf = eleTree.isLeaf
                            dataList.push(ch_tree)
                        }
                    })
                resolve(dataList)//加载下级数据!
            },
            // 选择关闭选择类别对话框
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        this.itemForm.cid = 0
                        this.curr_category = {}
                        done()
                    })
                    .catch(_ => {
                    })
            },
            // 上传前判断图片是否可以上传
            beforeImgUpload(file) {
                const isRightType = (file.type === 'image/jpeg') || (file.type === 'image/png')
                const isLt2M = file.size / 1024 / 1024 < 2

                if (!isRightType) {
                    this.$message.error('上传头像图片只能是 JPG 或者 PNG 格式!')
                }
                if (!isLt2M) {
                    this.$message.error('上传头像图片大小不能超过 2MB!')
                }
                return isRightType && isLt2M
            },
            // 上传成功后处理
            handUploadSuccess(res, file) {
                // 判断是否上传服务器成功
                if (res.status === 'success') {
                    this.image_dialog = res.file_path
                    this.images.push(res.file_path)
                    this.itemForm.image = this.images.join(',')
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
                if (typeof (this.curr_item) !== 'undefined') { // 此时是编辑模式
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
                    this.itemForm.image = this.images.join(',')
                }
                await deleteFile({"fileId": del_image})
                    .then(res => {
                        this.$message.success(res.message)
                    })
            },
            // 取消选择类别
            cancelSaveItem() {
                this.category_dialogVisible = false
                this.itemForm.cid = 0
                this.curr_category = {}
            },
            // 确定选择类别
            ensureSaveItem() {
                if (!this.curr_category.isLeaf) {
                    this.$notify.error("请选择根节点")
                } else {
                    this.category_dialogVisible = false
                    // 得到该类别对应的商品规格参数
                    getItemParamByCid(this.itemForm.cid)
                        .then(res => {
                            if (res.status === 'failed') {
                                this.$message.error("请求商品规格参数失败")
                            } else if (res.status === 'none') {
                                this.$message.error("该商品暂时没有规格参数")
                            } else if (res.status === 'success') {
                                this.show_itemParam = true
                                return this.myItemParamForm.itemParamData = JSON.parse(res.itemParam.paramData)
                            } else {
                                this.$message.error("未知错误")
                            }
                            this.show_itemParam = false
                        })
                        .catch(err => {
                            this.$message.error("请求商品规格参数失败")
                        })
                }
            },
            // 添加商品
            addItem(itemForm) {
                this.$refs[itemForm].validate(async (valid) => {
                    if (valid) {
                        try {
                            // 修改单位为分，并将变量作为number
                            Object.defineProperty(this.itemForm, "price", {
                                value: (Number(this.itemForm.price)) * 100,
                                writable: true,
                                configurable: true
                            })
                            Object.defineProperty(this.itemForm, "weight", {
                                value: (Number(this.itemForm.weight)) * 100,
                                writable: true,
                                configurable: true
                            })
                            // 新增商品参数
                            this.itemForm.paramData = JSON.stringify(this.myItemParamForm.itemParamData)
                            await addItem(this.itemForm)
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
            // 编辑商品
            async editItem() {
                // 通过判断curr_item 来判断此时是否是编辑商品模式
                if (typeof (this.curr_item) !== 'undefined') {
                    // 此时是编辑商品模式
                    // 以下操作用来回显编辑商品的页面
                    // 给当前的商品赋值
                    this.itemForm = this.curr_item
                    // 给当前的图片数组赋值
                    this.images = this.curr_item.image.split(',')
                    // 给当前的图片文件列表赋值,用来在页面显示
                    this.upload_file_list = [] // 先将图片清空
                    for (let imagePath of this.images) {
                        let upload_file = {}
                        upload_file.name = ""
                        upload_file.url = imagePath
                        this.upload_file_list.push(upload_file)
                    }
                    // 给当前的分类赋值
                    this.curr_category.label = this.curr_item.categoryName
                    this.curr_category.id = this.curr_item.cid
                    // 给当前的商品描述赋值
                    await getItemDescById(this.itemForm.id)
                        .then(res => {
                            if (res.status === 'success') {
                                this.itemForm.itemDesc = res.itemDesc.itemDesc
                            } else {
                                this.$message.error("当前商品描述为空")
                            }
                        })
                        .catch(err => {
                            this.$message.error("获取商品描述失败")
                        })
                    // 给当前的商品参数赋值
                    await getItemParamItemByItemId(this.itemForm.id)
                        .then(res => {
                            if (res.status === 'success') {
                                this.show_itemParam = true
                                this.myItemParamForm.itemParamData = JSON.parse(res.itemParamItem.paramData)
                            } else {
                                this.$message.error("当前商品参数为空")
                            }
                        })
                        .catch(err => {
                            this.$message.error("获取商品参数失败")
                        })
                }
            },
            // 编辑完后更新商品
            updateItem(itemForm) {
                this.$refs[itemForm].validate(async (valid) => {
                    if (valid) {
                        try {
                            // 修改单位为分，并将变量作为number
                            Object.defineProperty(this.itemForm, "price", {
                                value: (Number(this.itemForm.price)) * 100,
                                writable: true,
                                configurable: true
                            })
                            Object.defineProperty(this.itemForm, "weight", {
                                value: (Number(this.itemForm.weight)) * 100,
                                writable: true,
                                configurable: true
                            })
                            // 新增商品参数
                            this.itemForm.paramData = JSON.stringify(this.myItemParamForm.itemParamData)
                            await updateItem(this.itemForm)
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
