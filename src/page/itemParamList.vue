<template>
    <div>
        <head-top></head-top>

        <div class="table_container">
            <div style="margin-bottom: 10px">
                <el-input
                    placeholder="搜索商品分类"
                    icon="search"
                    style="width: 500px"
                    v-model="searchParam"
                    :on-icon-click="searchClick">
                </el-input>
                <el-button type="primary" @click="addItemParam()" style="float: right" icon="plus">新增商品参数</el-button>
                <el-button type="primary" @click="getItemParamLists()" style="margin-right: 10px; float: right"
                           icon="circle-check">刷新
                </el-button>
                <el-button type="primary" @click="deleteItems()" style="float: right" icon="delete2">删除</el-button>
            </div>

            <el-table
                :data="itemParamList"
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
                    prop="categoryName"
                    label="分类"
                    width="215">
                </el-table-column>
                <el-table-column
                    prop="paramData"
                    label="规格(规格(只显示分组名称) )"
                    :formatter="formatItemParam"
                    width="693">
                </el-table-column>
                <el-table-column type="expand">
                    <template scope="props">
                        <el-form label-position="left" inline class="demo-table-expand">
                            <el-form-item label="ID">
                                <span>{{ props.row.id}}</span>
                            </el-form-item>
                            <el-form-item label="商品类目ID ">
                                <span>{{ props.row.itemCatId}}</span>
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
                title="编辑商品参数"
                :visible.sync="edit_itemParam_dialog_show"
                size="full"
                :append-to-body="true"
                :before-close="handleClose">

                <add-item-param :curr_itemParam="curr_itemParam" ref="editItemParam"></add-item-param>
            </el-dialog>
        </div>
    </div>
</template>

<script>
    import headTop from '../components/headTop'
    import addItemParam from '@/page/addItemParam'
    import {formatDate} from '../utils/formatDate'
    import {getItemParamListWithCid, deleteItemParam, getItemListWithCidLikeCidName} from '@/api/getData'

    export default {
        data() {
            return {
                // 当前选中的商品参数
                curr_itemParam: {},
                edit_itemParam_dialog_show: false,
                searchParam: '',
                itemParamList: [],
                multipleSelection: [],
                count: 0,
                limit: 20,
                currentPage: 1
            }
        },
        components: {
            headTop,
            addItemParam
        },
        methods: {
            // 根据商品类别查找商品规格
            searchClick() {
                if (this.searchParam.trim() === "") {
                    this.$message.error("请输入要查询的分类名称")
                } else {
                    getItemListWithCidLikeCidName({
                        "page": this.currentPage,
                        "limit": this.limit,
                        "categoryName": this.searchParam
                    })
                        .then(res => {
                            this.itemParamList = res.records
                            this.count = res.total
                        })
                        .catch(err => {
                            this.$message.error("查询商品规格列表错误")
                        })
                }
            },
            handleSelectionChange(val) {
                this.multipleSelection = val
            },
            handleSizeChange(val) {
                this.limit = val
                this.getItemParamLists()
            },
            handleCurrentChange(val) {
                this.currentPage = val
                this.getItemParamLists()
            },
            // 获取商品参数列表
            getItemParamLists() {
                getItemParamListWithCid({
                    "page": this.currentPage,
                    "limit": this.limit
                })
                    .then(res => {
                        this.itemParamList = res.records
                        this.count = res.total
                    })
                    .catch(err => {
                        this.$message.error("请求商品规格列表错误")
                    })
            },
            // 批量删除商品参数
            deleteItems() {
                let ids = []
                for (let select of this.multipleSelection) {
                    ids.push(select.id)
                }
                if (ids.length < 1) {
                    return this.$message.error("请选择要删除的商品参数")
                }
                deleteItemParam(ids)
                    .then(res => {
                        if (res.status === 'success') {
                            this.$message.success("刪除商品参数成功")
                            this.getItemParamLists()
                        } else {
                            this.$message.error("刪除商品参数错误")
                        }
                    })
                    .catch(err => {
                        this.$message.error("刪除商品参数错误")
                    })
            },
            // 删除单个商品参数
            deleteItem(id) {
                let ids = [id]
                deleteItemParam(ids)
                    .then(res => {
                        if (res.status === 'success') {
                            this.$message.success("刪除商品参数成功")
                            this.getItemParamLists()
                        } else {
                            this.$message.error("刪除商品参数错误")
                        }
                    })
                    .catch(err => {
                        this.$message.error("刪除商品参数错误")
                    })
            },
            // 新增商品参数跳转
            addItemParam() {
                this.$router.push('/addItemParam')
            },
            // 编辑商品参数
            async editItem(row) {
                await (this.curr_itemParam = row)
                await (this.edit_itemParam_dialog_show = true)
                this.$nextTick(() => this.$refs.editItemParam.editItemParam())
            },
            // 选择关闭选择类别对话框
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done()
                    })
                    .catch(_ => {
                    })
            },
            // 格式化显示商品参数规格
            formatItemParam(row, column, cellValue) {
                let itemParams = JSON.parse(cellValue)
                let returnString = []
                for (let paramData of itemParams) {
                    returnString.push(paramData.group)
                }

                return returnString.join('+')
            }
        },
        mounted: function () {
            this.$nextTick(async () => {
                // 获取商品参数列表
                await this.getItemParamLists()
            })
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
