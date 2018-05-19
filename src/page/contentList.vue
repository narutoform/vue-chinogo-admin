<template>
    <div class="fillcontain">
        <head-top></head-top>

        <el-row style="margin-top: 20px;">

            <el-col :span="5" :offset="1">
                <el-row :gutter="20">
                    <el-form label-width="110px" class="form context_form">
                        <el-tree
                            style="margin-bottom: 10px"
                            :props="defaultProps"
                            :load="loadNode"
                            lazy=""
                            @node-click="contentTreeClick"
                            :default-expand-all="true"
                            :highlight-current="true"
                            node-key="id">
                        </el-tree>
                    </el-form>
                </el-row>
            </el-col>

            <el-col :span="13" :offset="4">
                <el-row :gutter="20">
                    <div style="margin-bottom: 10px; text-align:center">
                        <el-button type="success" @click="addContent()" icon="plus">新增广告内容</el-button>
                        <el-button type="success" @click="refreshContent()"
                                   icon="circle-check">刷新
                        </el-button>
                        <el-button type="success" @click="deleteContents()" icon="delete2">删除
                        </el-button>
                    </div>

                    <el-form label-width="110px" class="form context_form">
                        <el-table
                            :data="contentList"
                            ref="multipleTable"
                            tooltip-effect="dark"
                            @selection-change="handleSelectionChange"
                            border
                            highlight-current-row
                            style="width: 100%">
                            <el-table-column
                                type="selection"
                                width="45">
                            </el-table-column>
                            <el-table-column
                                prop="title"
                                label="内容标题"
                                width="420">
                            </el-table-column>
                            <el-table-column type="expand">
                                <template scope="props">
                                    <el-form label-position="left" inline class="demo-table-expand">
                                        <el-form-item label="内容ID">
                                            <span>{{ props.row.id }}</span>
                                        </el-form-item>
                                        <el-form-item label="内容分类ID">
                                            <span>{{ props.row.categoryId }}</span>
                                        </el-form-item>
                                        <el-form-item label="内容分类">
                                            <span>{{ props.row.categoryName }}</span>
                                        </el-form-item>
                                        <el-form-item label="子标题">
                                            <span>{{ props.row.subTitle }}</span>
                                        </el-form-item>
                                        <el-form-item label="标题描述">
                                            <span>{{ props.row.titleDesc }}</span>
                                        </el-form-item>
                                        <el-form-item label="内容" v-show="false">
                                            <span>{{ props.row.content }}</span>
                                        </el-form-item>
                                        <el-form-item label="链接">
                                            <a :href="props.row.url">{{props.row.url}}</a>
                                        </el-form-item>
                                        <el-form-item label="图片绝对路径">
                                            <span v-for="(pic, index) in props.row.pic.split(',')">
                                                <a :href="pic">{{ pic }}</a> <br>
                                            </span>
                                        </el-form-item>
                                        <el-form-item label="创建时间">
                                            <span>{{ props.row.created | dateFormat}}</span>
                                        </el-form-item>
                                        <el-form-item label="更新时间">
                                            <span>{{ props.row.updated | dateFormat}}</span>
                                        </el-form-item>
                                    </el-form>
                                </template>
                            </el-table-column>
                            <el-table-column
                                label="操作">
                                <template scope="scope">
                                    <el-tooltip class="item" effect="dark" content="编辑" placement="top-start">
                                        <el-button @click="editContent(scope.row)" size="mini" icon="edit"/>
                                    </el-tooltip>
                                    <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                                        <el-button @click="deleteContent(scope.row.id)" size="mini" icon="delete"/>
                                    </el-tooltip>
                                </template>
                            </el-table-column>

                        </el-table>

                        <div class="Pagination" style="text-align: left;margin-top: 10px;">
                            <el-pagination
                                @size-change="handleSizeChange"
                                @current-change="handleCurrentChange"
                                :current-page="currentPage"
                                :page-sizes="[10, 20, 30, 40]"
                                :page-size="limit"
                                layout="total, sizes, prev, pager, next, jumper"
                                :total="count">
                            </el-pagination>
                        </div>

                    </el-form>

                    <el-dialog
                        title="添加内容"
                        :visible.sync="add_content_dialog_show"
                        size="full"
                        :modal="false"
                        :before-close="handleClose">
                        <addContent ref="addContent" :curr_content="curr_content" :curr_contentCategory="curr_contentCategory"></addContent>
                    </el-dialog>

                    <el-dialog
                        title="编辑内容"
                        :visible.sync="edit_content_dialog_show"
                        size="full"
                        :modal="false"
                        :before-close="handleClose">
                        <addContent ref="editContent" :curr_contentCategory="curr_contentCategory" :curr_content="curr_content"></addContent>
                    </el-dialog>
                </el-row>
            </el-col>

        </el-row>
    </div>
</template>

<script>
    import headTop from '../components/headTop'
    import addContent from '../page/addContent'
    import {
        getContentCategoryByParentId,
        getContentListWithCid,
        insertContent,
        deleteContent,
        updateContent
    } from '@/api/getData'
    import {formatDate} from '../utils/formatDate'

    export default {
        data: function () {
            return {
                defaultProps: {
                    label: 'label',
                    children: 'children',
                    isLeaf: 'isLeaf'
                },
                contentList: [],
                multipleSelection: [],
                count: 0,
                limit: 20,
                currentPage: 1,
                // 当前的内容
                curr_content: {},
                // 当前的内容分类
                curr_contentCategory: {},
                edit_content_dialog_show: false,
                add_content_dialog_show: false
            }
        },
        components: {
            headTop,
            addContent
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
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => {
                    });
            },
            handleSelectionChange(val) {
                this.multipleSelection = val
            },
            handleSizeChange(val) {
                this.limit = val
                this.getContentLists()
            },
            handleCurrentChange(val) {
                this.currentPage = val
                this.getContentLists()
            },
            // 点击内容分类树的子节点
            contentTreeClick(data) {
                if (data.isLeaf) {
                    this.curr_contentCategory = data
                    return this.getContentLists()
                }
                this.curr_contentCategory = {}
            },
            // 获取对应分类的内容列表
            getContentLists() {
                getContentListWithCid({
                    "page": this.currentPage,
                    "limit": this.limit,
                    "categoryId": this.curr_contentCategory.id
                })
                    .then(res => {
                        this.contentList = res.records
                        this.count = res.total
                    })
                    .catch(err => {
                        this.$message.error("请求内容列表错误")
                    })
            },
            // 添加内容
            addContent() {
                if (this.curr_contentCategory.id) {
                    this.add_content_dialog_show = true
                    this.curr_content = {}
                }
            },
            // 刷新内容
            refreshContent() {
                if (this.curr_contentCategory.isLeaf) {
                    this.getContentLists()
                }
            },
            // 批量删除内容
            deleteContents() {
                let ids = []
                for (let select of this.multipleSelection) {
                    ids.push(select.id)
                }
                if (ids.length < 1) {
                    return this.$message.error("请选择要删除的内容")
                }
                deleteContent(ids)
                    .then(res => {
                        if (res.status === 'success') {
                            this.$message.success("刪除内容成功")
                            this.getContentLists()
                        } else {
                            this.$message.error("刪除内容错误")
                        }
                    })
                    .catch(err => {
                        this.$message.error("刪除内容错误")
                    })
            },
            // 删除单个内容
            deleteContent(id) {
                let ids = [id]
                deleteContent(ids)
                    .then(res => {
                        if (res.status === 'success') {
                            this.$message.success("刪除内容成功")
                            this.getContentLists()
                        } else {
                            this.$message.error("刪除内容错误")
                        }
                    })
                    .catch(err => {
                        this.$message.error("刪除内容错误")
                    })
            },
            // 编辑内容
            editContent(row) {
                this.curr_content = row
                this.edit_content_dialog_show = true
                this.$nextTick(() => this.$refs.editContent.editContent())
            }
        },
        filters: {
            dateFormat(date) {
                let now = new Date(date)
                return formatDate(now, 'yyyy-MM-dd hh:mm:ss')
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

    .context_form {
        border: 1px solid #eaeefb;
        padding: 10px 10px 0;
    }
</style>
