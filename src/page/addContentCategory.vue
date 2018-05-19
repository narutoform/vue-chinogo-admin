<template>
    <div class="fillcontain">
        <head-top></head-top>
        <el-row style="margin-top: 20px;">
            <el-col :span="22" :offset="1">
                <el-form :model="contCaForm" label-width="110px"
                         class="form context_category_form">
                    <el-tree
                        style="margin-bottom: 10px"
                        :props="defaultProps"
                        :load="loadNode"
                        lazy=""
                        :highlight-current="true"
                        node-key="id"
                        :render-content="renderContent">
                    </el-tree>

                    <el-dialog
                        title="添加内容分类"
                        :visible.sync="appendDialogVisible"
                        size="tiny"
                        :before-close="handleClose">
                        <el-input size="small" style="margin-right: 10px" v-model="contCaForm.appendText"
                                  placeholder="请输入要添加的内容"></el-input>
                        <span slot="footer" class="dialog-footer">
                            <el-button @click="appendDialogVisible = false">取 消</el-button>
                            <el-button type="primary" @click="ensureAppend()">确 定</el-button>
                        </span>
                    </el-dialog>

                    <el-dialog
                        title="更新内容分类"
                        :visible.sync="updateDialogVisible"
                        size="tiny"
                        :before-close="handleClose">
                        <el-input size="small" style="margin-right: 10px" v-model="contCaForm.updateText"
                                  placeholder="请输入要更新的内容"></el-input>
                        <span slot="footer" class="dialog-footer">
                            <el-button @click="updateDialogVisible = false">取 消</el-button>
                            <el-button type="primary" @click="ensureUpdate()">确 定</el-button>
                        </span>
                    </el-dialog>

                    <el-dialog
                        title="排序内容分类"
                        :visible.sync="sortDialogVisible"
                        size="small"
                        :before-close="handleClose">
                        <el-input size="small" style="margin-right: 10px" v-model="contCaForm.sortText"
                                  placeholder="请输入序号（如数值相等则按默认次序(默认10)排列。取值范围:大于零的整数）"></el-input>
                        <span slot="footer" class="dialog-footer">
                            <el-button @click="sortDialogVisible = false">取 消</el-button>
                            <el-button type="primary" @click="ensureSort()">确 定</el-button>
                        </span>
                    </el-dialog>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import headTop from '../components/headTop'
    import {
        getContentCategoryByParentId,
        insertContentCategory,
        deleteContentCategory,
        updateContentCategory
    } from '@/api/getData'

    export default {
        data: function () {
            return {
                // 当前store
                curr_store: {},
                // 当前data
                curr_data: {},
                contCaForm: {
                    appendText: '',
                    updateText: '',
                    sortText: ''
                },
                appendDialogVisible: false,
                updateDialogVisible: false,
                sortDialogVisible: false,
                defaultProps: {
                    label: 'label',
                    children: 'children',
                    isLeaf: 'isLeaf'
                }
            }
        },
        components: {
            headTop,
        },
        methods: {
            // 加载树节点
            async loadNode(node, resolve) {
                //初始第一层节点，初始化数据，根节点配置
                if (node.level === 0) {
                    let treeList = []
                    await getContentCategoryByParentId()
                        .then(res => {
                            for (let eleTree of res) {
                                let tree = {}
                                tree.label = eleTree.label
                                tree.id = eleTree.id
                                tree.isLeaf = eleTree.isLeaf
                                treeList.push(tree)
                            }
                        })
                        .catch(err => {
                            this.$message.error("获取内容分类失败")
                        })
                    return resolve(treeList)
                }
                var dataList = []
                await getContentCategoryByParentId({"parentId": node.data.id})
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
            // 添加树节点
            append(store, data) {
                if (!this.contCaForm.appendText.trim()) {
                    return this.$message.error('添加失败，请输入要添加的内容')
                }
                // 请求后台,内容分类插入
                insertContentCategory({
                    "parentId": data.id,
                    "name": this.contCaForm.appendText
                }).then(res => {
                    if (res.status === 'success') {
                        // 页面进行添加
                        store.append({id: res.id, label: this.contCaForm.appendText, children: [], isLeaf: true}, data)
                        // 将其父类更新为有父类节点 // 数据库同步更新
                        data.isLeaf = false
                        // 得加这个，光data.isLeaf = false不行
                        store.currentNode.isLeaf = false
                        this.contCaForm.updateText = data.label
                        this.update(store, data)

                        // 将添加的值置为空
                        this.contCaForm.appendText = ''
                        this.$message.success('添加成功')
                    } else {
                        this.$message.error('添加失败')
                    }
                }).catch(err => {
                    this.$message.error('添加失败')
                })
            },
            // 移除树节点
            remove(store, data) {
                // 请求后台,内容分类逻辑删除
                deleteContentCategory(data.id)
                    .then(res => {
                        if (res.status === 'success') {
                            store.remove(data)
                            this.$message.success('删除成功')
                        } else {
                            this.$message.error('删除失败')
                        }
                    }).catch(err => {
                        this.$message.error('删除失败, 后台错误')
                    })
            },
            // 更新树节点
            update(store, data) {
                if (!this.contCaForm.updateText.trim()) {
                    return this.$message.error('更新失败，请输入要更新的内容')
                }
                updateContentCategory({
                    "id": data.id,
                    "name": this.contCaForm.updateText,
                    "isParent": data.isLeaf ? 0 : 1
                }).then(res => {
                    if (res.status === 'success') {
                        data.label = this.contCaForm.updateText
                        this.contCaForm.updateText = ''
                        this.$message.success('更新成功')
                    } else {
                        this.$message.error('更新失败')
                    }
                }).catch(err => {
                    this.$message.error('更新失败')
                })
            },
            // 排序
            sort(store, data) {
                if (!this.contCaForm.sortText.trim()) {
                    return this.$message.error('更新排序失败，请输入排序值')
                }
                updateContentCategory({
                    "id": data.id,
                    "sortOrder": this.contCaForm.sortText
                }).then(res => {
                    if (res.status === 'success') {
                        this.contCaForm.updateText = ''
                        this.$message.success('更新排序成功, 请刷新查看，1.5秒后自动刷新')
                        setTimeout(() => {
                            this.$router.go(0)
                        }, 1500)
                    } else {
                        this.$message.error('更新排序失败')
                    }
                }).catch(err => {
                    this.$message.error('更新排序失败')
                })
            },
            // 渲染树节点
            renderContent(h, {node, data, store}) {
                return (
                    <span>
                    <span>
                    <span>{node.label}</span>
                </span>
                <span
                    style="float: right; margin-right: 20px">
                    <el-button size="mini" on-click={() => this.onclickAppend(store, data)}>添加</el-button>
                    <el-button size="mini" on-click={() => this.onclickUpdate(store, data)}>更新</el-button>
                    <el-button size="mini" on-click={() => this.remove(store, data)}>删除</el-button>
                    <el-button size="mini" on-click={() => this.onclickSort(store, data)}>排序</el-button>
                </span>
                </span>);
            },
            // 点击添加后
            onclickAppend(store, data) {
                this.appendDialogVisible = true
                this.curr_store = store
                this.curr_data = data
            },
            // 确定添加后
            ensureAppend() {
                this.append(this.curr_store, this.curr_data)
                this.appendDialogVisible = false
            },
            // 点击更新后
            onclickUpdate(store, data) {
                this.updateDialogVisible = true
                this.curr_store = store
                this.curr_data = data
                // 回显
                this.contCaForm.updateText = data.label
            },
            // 确定更新后
            ensureUpdate() {
                this.update(this.curr_store, this.curr_data)
                this.updateDialogVisible = false
            },
            // 点击排序后
            onclickSort (store, data) {
                this.sortDialogVisible = true
                this.curr_store = store
                this.curr_data = data
            },
            // 确定排序
            ensureSort() {
                this.sort(this.curr_store, this.curr_data)
                this.sortDialogVisible = false
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => {
                    });
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

    .context_category_form {
        border: 1px solid #eaeefb;
        padding: 10px 10px 0;
    }
</style>
