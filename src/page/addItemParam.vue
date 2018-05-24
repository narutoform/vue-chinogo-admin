<template>
    <div>
        <head-top></head-top>
        <el-row style="margin-top: 20px;">
            <el-col :span="22" :offset="1">
                <el-form :model="itemParamForm" :rules="itemParamRules" ref="itemParamForm" label-position="right"
                         label-width="110px"
                         class="form item_param_form">
                    <el-form-item label="商品类目" prop="itemCatId">
                        <el-button type="text" @click="category_dialogVisible = true">选择类目</el-button>
                        {{this.curr_category.label}}
                        <el-dialog
                            title="选择类目"
                            :visible.sync="category_dialogVisible"
                            size="small"
                            :modal="false"
                            :before-close="handleClose">
                            <span>
                                <el-input
                                    placeholder="输入关键字进行过滤"
                                    v-model="filterCategory">
                                </el-input>
                                <el-tree
                                    :props="treeProps"
                                    :load="loadNode"
                                    lazy=""
                                    node-key="id"
                                    :filter-node-method="filterNode"
                                    ref="categoryTree"
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

                    <el-form-item
                        v-for="(curr_group, index) in itemParamForm.groups"
                        :label="'组名' + (index + 1)">
                        <el-input style="width: 260px;" v-model="curr_group.group"
                                  @blur="checkGroup(curr_group)"></el-input>
                        <el-button @click="addParams(index)">新增参数</el-button>
                        <el-button style="" @click.prevent="removeGroup(curr_group)">删除</el-button>

                        <el-form-item
                            v-for="(curr_param, num) in itemParamForm.groups[index].params"
                            :label="'|-----参数' + (num + 1)"
                            style="margin-top: 20px;">
                            <el-input style="width: 260px;"
                                      v-model="curr_param.k"
                                      @blur="checkParam(curr_param)"></el-input>
                            <!--不能直接用curr_param-->
                            <el-button @click.prevent="removeParam(curr_param, index)">删除</el-button>
                        </el-form-item>
                    </el-form-item>

                    <el-form-item>
                        <el-button v-if="typeof (this.curr_itemParam) === 'undefined'" type="primary"
                                   @click="submitForm('itemParamForm')">提交
                        </el-button>
                        <el-button v-else type="primary" @click="updateItemParam('itemParamForm')">修改后重新提交</el-button>
                        <el-button @click="addGroups()">新增分组</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import headTop from '@/components/headTop'
    import {getCategoryByParentId, addItemParam, checkItemParamByItemCatId, updateItemParam} from '@/api/getData'

    export default {
        data: function () {
            let requireCid = (rule, value, callback) => {
                if (!this.curr_category.label) {
                    callback(new Error("请选择分类"))
                } else {
                    callback()
                }
            }
            return {
                curr_category: {},
                filterCategory: '',
                category_dialogVisible: false,
                itemParamForm: {
                    groups: [],
                    itemCatId: 0,
                    // 当前要更新的商品规格参数id
                    id: ''
                },
                itemParamRules: {
                    itemCatId: [
                        {required: true, validator: requireCid, trigger: 'change'}
                    ]
                },
                treeProps: {
                    label: 'label',
                    children: 'children',
                    isLeaf: 'isLeaf'
                }
            }
        },
        props: ['curr_itemParam'],
        components: {
            headTop
        },
        methods: {
            // 检查当前组是否存在
            checkGroup(curr_group) {
                if (!curr_group.group) {
                    this.$message.error("组名不能为空")
                }
            },
            // 检查当前参数是否存在
            checkParam(curr_param) {
                if (!curr_param.k) {
                    this.$message.error("参数不能为空")
                }
            },
            // 提交商品参数规格
            submitForm(formName) {
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        let itemParams = this.itemParamForm.groups
                        for (let itemParam of itemParams) {
                            if (!itemParam.group) {
                                return this.$message.error("组名不能为空")
                            }
                            for (let param of itemParam.params) {
                                if (!param.k) {
                                    return this.$message.error("参数不能为空")
                                }
                            }
                        }
                        // 构建post参数
                        let itemParamsString = JSON.stringify(itemParams)
                        let tbItemParam = {}
                        tbItemParam.paramData = itemParamsString
                        tbItemParam.itemCatId = this.itemParamForm.itemCatId
                        addItemParam(tbItemParam)
                            .then(res => {
                                if (res.status === 'success') {
                                    this.$message.success("添加成功")
                                    this.itemParamForm.groups = []
                                    this.itemParamForm.itemCatId = 0
                                    this.curr_category = {}
                                } else {
                                    return this.$message.error("添加失败")
                                }
                            })
                            .catch(err => {
                                return this.$message.error("添加失败")
                            })
                    } else {
                        return this.$message.error("请选择类别")
                    }
                })
            },
            // 移除参数
            removeParam(item, curr_index) {
                var index = this.itemParamForm.groups[curr_index].params.indexOf(item)
                if (index !== -1) {
                    this.itemParamForm.groups[curr_index].params.splice(index, 1)
                }
            },
            // 移除组
            removeGroup(item) {
                var index = this.itemParamForm.groups.indexOf(item)
                if (index !== -1) {
                    this.itemParamForm.groups.splice(index, 1)
                }
            },
            // 添加参数
            addParams(index) {
                this.itemParamForm.groups[index].params.push({
                    "k": '',
                    "v": ''
                })
            },
            // 添加组
            addGroups() {
                this.itemParamForm.groups.push({
                    params: [],
                    group: ''
                })
            },
            // 处理点击树节点
            handleNodeClick(data) {
                this.curr_category = data
                this.itemParamForm.itemCatId = data.id
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
                            ch_tree.label = eleTree.label
                            ch_tree.id = eleTree.id
                            ch_tree.isLeaf = eleTree.isLeaf
                            dataList.push(ch_tree)
                        }
                    })
                resolve(dataList)//加载下级数据!
            },
            // 确定关闭选择类别
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        this.itemParamForm.itemCatId = 0
                        this.curr_category = {}
                        done()
                    })
                    .catch(_ => {
                    })
            },
            // 确定选择类别
            ensureSaveItem() {
                checkItemParamByItemCatId(this.itemParamForm.itemCatId)
                    .then(res => {
                        if (res.status === 'success') {
                            if (!this.curr_category.isLeaf) {
                                this.$notify.error("请选择根节点")
                            } else {
                                this.category_dialogVisible = false
                            }
                        } else {
                            this.category_dialogVisible = false
                            this.itemParamForm.itemCatId = 0
                            this.curr_category = {}
                            this.$notify.error("该商品参数已经添加过了，如果想修改，请先删除后重新添加")
                        }
                    })
            },
            // 取消选择类别
            cancelSaveItem() {
                this.category_dialogVisible = false
                this.itemParamForm.itemCatId = 0
                this.curr_category = {}
            },
            // 编辑商品参数
            editItemParam() {
                // 回显当前分类
                this.curr_category.label = this.curr_itemParam.categoryName
                this.curr_category.id = this.curr_itemParam.itemCatId
                this.itemParamForm.itemCatId = this.curr_itemParam.itemCatId
                // 回显当前商品规格参数
                this.itemParamForm.groups = JSON.parse(this.curr_itemParam.paramData)
                this.itemParamForm.id = this.curr_itemParam.id
            },
            // 更新商品规格参数
            updateItemParam(formName) {
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        let itemParams = this.itemParamForm.groups
                        for (let itemParam of itemParams) {
                            if (!itemParam.group) {
                                return this.$message.error("组名不能为空")
                            }
                            for (let param of itemParam.params) {
                                if (!param.k) {
                                    return this.$message.error("参数不能为空")
                                }
                            }
                        }
                        // 构建post参数
                        let itemParamsString = JSON.stringify(itemParams)
                        let tbItemParam = {}
                        tbItemParam.paramData = itemParamsString
                        tbItemParam.itemCatId = this.itemParamForm.itemCatId
                        tbItemParam.id = this.itemParamForm.id
                        updateItemParam(tbItemParam)
                            .then(res => {
                                if (res.status === 'success') {
                                    this.$message.success("更新成功")
                                    setTimeout(() => {
                                        this.$router.go(0)
                                    }, 1500)
                                } else {
                                    return this.$message.error("更新失败")
                                }
                            })
                            .catch(err => {
                                return this.$message.error("更新失败")
                            })
                    } else {
                        return this.$message.error("请选择类别")
                    }
                })
            }
        },
        watch: {
            filterCategory(val) {
                this.$refs.categoryTree.filter(val);
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

    .item_param_form {
        border: 1px solid #eaeefb;
        padding: 10px 10px 0;
    }
</style>
