<template>
    <div>
        <head-top></head-top>

        <div class="table_container">
            <div style="margin-bottom: 10px">
                <el-input
                    placeholder="搜索商品标题"
                    icon="search"
                    style="width: 500px"
                    v-model="searchParam"
                    :on-icon-click="searchClick">
                </el-input>
                <el-button type="primary" @click="addItem()" style="float: right" icon="plus">新增商品</el-button>
                <el-button type="primary" @click="getItemLists()" style="margin-right: 10px; float: right"
                           icon="circle-check">刷新
                </el-button>
                <el-button type="primary" @click="deleteItems()" style="float: right" icon="delete2">删除</el-button>
            </div>

            <el-table
                :data="itemList"
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
                    label="标题"
                    width="350">
                </el-table-column>
                <el-table-column
                    prop="categoryName"
                    label="分类"
                    width="100">
                </el-table-column>
                <el-table-column
                    prop="price"
                    label="价格 (元)"
                    width="120">
                </el-table-column>
                <el-table-column
                    prop="num"
                    label="库存数量"
                    width="120">
                </el-table-column>
                <el-table-column
                    label="商品状态"
                    width="100">
                    <template scope="scope">
                        <span v-if="scope.row.status === 2" style="color: red">{{ scope.row.status | formatStatus }}</span>
                        <span v-else style="color: green">{{ scope.row.status | formatStatus }}</span>
                    </template>
                </el-table-column>
                <el-table-column type="expand">
                    <template scope="props">
                        <el-form label-position="left" inline class="demo-table-expand">
                            <el-form-item label="商品ID">
                                <span>{{ props.row.id }}</span>
                            </el-form-item>
                            <el-form-item label="卖点">
                                <span>{{ props.row.sellPoint }}</span>
                            </el-form-item>
                            <el-form-item label="条形码">
                                <span>{{ props.row.barcode }}</span>
                            </el-form-item>
                            <el-form-item label="重量 (克)">
                                <span>{{ props.row.weight }}</span>
                            </el-form-item>
                            <el-form-item label="颜色">
                                <span>{{ props.row.colour }}</span>
                            </el-form-item>
                            <el-form-item label="尺寸">
                                <span>{{ props.row.size }}</span>
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
                            <el-button @click="editItem(scope.row)" size="mini" icon="edit"/>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="删除" placement="top-start">
                            <el-button @click="deleteItem(scope.row.id)" size="mini" icon="delete"/>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="上架" placement="top-start">
                            <el-button @click="updateItemStatusToUp(scope.row)" size="mini" icon="plus"/>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="下架" placement="top-start">
                            <el-button @click="updateItemStatusToDown(scope.row)" size="mini" icon="minus"/>
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

            <el-dialog
                title="编辑商品"
                :visible.sync="edit_item_dialog_show"
                size="full"
                :modal="false"
                :before-close="handleClose">

                <add-items :curr_item="curr_item" ref="editItems"></add-items>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import headTop from '../components/headTop'
    import addItems from '@/page/addItems'
    import {formatDate} from '../utils/formatDate'
    import {getItemList, deleteItemAll, updateItemStatus, getItemListLikeTitle} from '@/api/getData'

    export default {
        data() {
            return {
                // 当前选中的商品
                curr_item: {},
                edit_item_dialog_show: false,
                searchParam: '',
                itemList: [],
                multipleSelection: [],
                count: 0,
                limit: 20,
                currentPage: 1
            }
        },
        components: {
            headTop,
            addItems
        },
        methods: {
            // 根据商品标题查找商品
            searchClick() {
                if (this.searchParam.trim() === "") {
                    this.$message.error("请输入要查询的商品")
                } else {
                    getItemListLikeTitle({
                        "page": this.currentPage,
                        "limit": this.limit,
                        "title": this.searchParam
                    })
                        .then(res => {
                            this.itemList = res.records
                            this.count = res.total
                        })
                        .catch(err => {
                            this.$message.error("查询商品列表错误")
                        })
                }
            },
            handleSelectionChange(val) {
                this.multipleSelection = val
            },
            handleSizeChange(val) {
                this.limit = val
                this.getItemLists()
            },
            handleCurrentChange(val) {
                this.currentPage = val
                this.getItemLists()
            },
            // 获取商品列表
            getItemLists() {
                getItemList({
                    "page": this.currentPage,
                    "limit": this.limit
                })
                    .then(res => {
                        this.itemList = res.records
                        this.count = res.total
                    })
                    .catch(err => {
                        this.$message.error("请求商品列表错误")
                    })
            },
            // 批量删除商品
            deleteItems() {
                let ids = []
                for (let select of this.multipleSelection) {
                    ids.push(select.id)
                }
                if (ids.length < 1) {
                    return this.$message.error("请选择要删除的商品")
                }
                deleteItemAll(ids)
                    .then(res => {
                        if (res.status === 'success') {
                            this.$message.success("刪除商品成功")
                            this.getItemLists()
                        } else {
                            this.$message.error("刪除商品错误")
                        }
                    })
                    .catch(err => {
                        this.$message.error("刪除商品错误")
                    })
            },
            // 删除单个商品
            deleteItem(id) {
                let ids = [id]
                deleteItemAll(ids)
                    .then(res => {
                        if (res.status === 'success') {
                            this.$message.success("刪除商品成功")
                            this.getItemLists()
                        } else {
                            this.$message.error("刪除商品错误")
                        }
                    })
                    .catch(err => {
                        this.$message.error("刪除商品错误")
                    })
            },
            // 新增商品跳转
            addItem() {
                this.$router.push('/addItems')
            },
            // 更新商品状态（下架）
            updateItemStatusToDown(row) {
                if (row.status === 2) {
                    return this.$message.error("该商品已经下架了")
                }
                row.status = 2
                updateItemStatus(row)
                    .then(res => {
                        if (res.status === 'success') {
                            this.$message.success("该商品下架成功")
                            return this.getItemLists()
                        } else {
                            return this.$message.error("该商品下架失败")
                        }
                    })
                    .catch(err => {
                        return this.$message.error("该商品下架失败")
                    })
            },
            // 更新商品状态（上架）
            updateItemStatusToUp(row) {
                if (row.status === 1) {
                    return this.$message.error("该商品已经上架了")
                }
                row.status = 1
                updateItemStatus(row)
                    .then(res => {
                        if (res.status === 'success') {
                            this.$message.success("该商品上架成功")
                            return this.getItemLists()
                        } else {
                            return this.$message.error("该商品上架失败")
                        }
                    })
                    .catch(err => {
                        return this.$message.error("该商品上架失败")
                    })
            },
            // 编辑商品
            async editItem(row) {
                await (this.curr_item = row)
                // this.$refs.editItems.editItem()
                // 由于，el-dialog嵌套el-table的情况下，el-table是在el-dialog打开后动态渲染上去的，也就是说，
                // 在没有打开dialog的情况下el-table在页面中并不存在，元素不存在的话，元素上的属性当然是获取不到的，因此显示undefind
                await (this.edit_item_dialog_show = true)

                this.$nextTick(() => this.$refs.editItems.editItem())
            },
            // 选择关闭选择类别对话框
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done()
                    })
                    .catch(_ => {
                    })
            }
        },
        mounted: function () {
            this.$nextTick(async () => {
                // 获取商品列表
                await this.getItemLists()
            })
        },
        filters: {
            dateFormat(date) {
                let now = new Date(date)
                return formatDate(now, 'yyyy-MM-dd hh:mm:ss')
            },
            // 格式化商品状态
            formatStatus(cellValue) {
                if (cellValue === 1) {
                    return "正常"
                } else if (cellValue === 2) {
                    return "下架"
                }
            },
        }
    }
</script>

<style lang="less" type="text/less">
    @import '../style/mixin';

    .table_container {
        padding: 20px;
    }

    .demo-table-expand {
        font-size: 0;
    }

    .demo-table-expand label {
        width: 90px;
        color: #99a9bf;
    }

    .demo-table-expand .el-form-item {
        margin-right: 0;
        margin-bottom: 0;
        width: 50%;
    }
</style>
