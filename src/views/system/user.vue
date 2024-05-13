<template>
    <div class="app-container">
        <div class="filter-container" style="margin-bottom: 20px;">
            <el-input v-model="listQuery.name" placeholder="用户名" size="mini" style="width: 200px;margin-right: 10px;"
                class="filter-item" @keyup.enter.native="handleFilter" />
            <el-button class="filter-item" style="margin-left: 10px;margin-right: 5px;" type="primary" size="mini" icon="el-icon-search" @click="handleFilter">
                搜索
            </el-button>
            <el-button class="filter-item" style="margin-right: 5px;" type="primary" size="mini" icon="el-icon-edit"
                @click="handleCreate" v-permission="['admin','editor']">
                新增
            </el-button>
            <el-button :loading="downloadLoading" class="filter-item" style="margin-right: 5px;" type="primary" size="mini" icon="el-icon-download"
                @click="handleDownload">
                导出
            </el-button>
        </div>

        <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row stripec
            size="mini" style="width: 100%;" @sort-change="sortChange">
            <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80"
                :class-name="getSortClass('id')">
                <template slot-scope="{row}">
                    <span>{{ row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户名" min-width="150px">
                <template slot-scope="{row}">
                    <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
                </template>
            </el-table-column>
            <el-table-column label="用户状态" class-name="status-col" width="100">
                <template slot-scope="{row}">
                    <el-tag :type="row.status | statusView">
                        {{ row.status }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="用户权限" class-name="status-col" width="100">
                <template slot-scope="{row}">
                    <el-tag 
                        :type="role | roleView"
                        v-for="role in row.roles"
                    >
                        {{ role }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="Actions" align="center" width="230" class-name="small-padding fixed-width">
                <template slot-scope="{row,$index}">
                    <el-button type="primary" size="mini" @click="handleUpdate(row)"
                        v-permission="['admin','editor']">
                        编辑
                    </el-button>
                    <el-button v-if="row.status != 'deleted'" size="mini" type="danger"
                        @click="handleDelete(row, $index)"
                        v-permission="['admin','editor']">
                        删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
            @pagination="getList" />

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" v-permission="['admin','editor']">
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="80px"
                style="width: 400px; margin-left:50px;">
                <el-form-item label="用户名" prop="name" size="mini">
                    <el-input v-model="temp.name" />
                </el-form-item>
                <el-form-item label="用户状态" size="mini">
                    <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
                        <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="用户权限" size="mini">
                    <el-select v-model="temp.roles" class="filter-item" placeholder="Please select" multiple>
                        <el-option v-for="item in rolesOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="用户密码" prop="name" size="mini">
                    <el-input v-model="temp.password" show-password />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false" size="mini">
                    取消
                </el-button>
                <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()" size="mini">
                    确认
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { fetchList, createData, updateData } from '@/api/system/user'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import permission from '@/directive/permission/index.js' // 权限判断指令

export default {
    name: 'UserManage',
    components: { Pagination },
    directives: { permission },
    filters: {
        statusView(status) {
            const statusMap = {
                enable: 'success',
                disable: 'danger'
            }
            return statusMap[status]
        },
        roleView(role) {
            const roleMap = {
                admin: 'danger',
                editor: 'success',
                checker: 'info'
            }
            return roleMap[role]
        },
    },
    data() {
        return {
            tableKey: 0,
            list: null,
            total: 0,
            listLoading: true,
            listQuery: {
                page: 1,
                limit: 20,
                name: undefined,
                sort: '+id'
            },
            statusOptions: ['enable', 'disable'],
            rolesOptions: ['admin', 'editor', 'checker'],
            temp: {
                id: undefined,
                name: '',
                status: 'published',
                roles: [],
                password: ''
            },
            dialogFormVisible: false,
            dialogStatus: '',
            textMap: {
                update: 'Edit',
                create: 'Create'
            },
            rules: {
                name: [{ required: true, message: 'name is required', trigger: 'blur' }],
                status: [{ required: true, message: 'status is required', trigger: 'change' }],
                password: [{ required: true, message: 'password is required', trigger: 'blur' }],
                roles: [{ required: true, message: 'roles is required', trigger: 'blur' }],
            },
            downloadLoading: false,
        }
    },
    created() {
        this.getList()
    },
    methods: {
        getList() {
            this.listLoading = true
            fetchList(this.listQuery).then(response => {
                this.list = response.data.items
                this.total = response.data.total
                // Just to simulate the time of the request
                setTimeout(() => {
                    this.listLoading = false
                }, 1.5 * 1000)
            })
        },
        handleFilter() {
            this.listQuery.page = 1
            this.getList()
        },
        sortChange(data) {
            const { prop, order } = data
            if (prop === 'id') {
                this.sortByID(order)
            }
        },
        sortByID(order) {
            if (order === 'ascending') {
                this.listQuery.sort = '+id'
            } else {
                this.listQuery.sort = '-id'
            }
            this.handleFilter()
        },
        resetTemp() {
            this.temp = {
                id: undefined,
                name: '',
                status: 'published',
                roles: [],
                password: '',
            }
        },
        handleCreate() {
            this.resetTemp()
            this.dialogStatus = 'create'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        createData() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
                    createData(this.temp).then(() => {
                        this.list.unshift(this.temp)
                        this.dialogFormVisible = false
                        this.$notify({
                            title: 'Success',
                            message: 'Created Successfully',
                            type: 'success',
                            duration: 2000
                        })
                    })
                }
            })
        },
        handleUpdate(row) {
            this.temp = Object.assign({}, row) // copy obj
            this.dialogStatus = 'update'
            this.dialogFormVisible = true
            this.$nextTick(() => {
                this.$refs['dataForm'].clearValidate()
            })
        },
        updateData() {
            this.$refs['dataForm'].validate((valid) => {
                if (valid) {
                    const tempData = Object.assign({}, this.temp)
                    updateData(tempData).then(() => {
                        const index = this.list.findIndex(v => v.id === this.temp.id)
                        this.list.splice(index, 1, this.temp)
                        this.dialogFormVisible = false
                        this.$notify({
                            title: 'Success',
                            message: 'Update Successfully',
                            type: 'success',
                            duration: 2000
                        })
                    })
                }
            })
        },
        handleDelete(row, index) {
            this.$notify({
                title: 'Success',
                message: 'Delete Successfully',
                type: 'success',
                duration: 2000
            })
            this.list.splice(index, 1)
        },
        handleDownload() {
            this.downloadLoading = true
            import('@/vendor/Export2Excel').then(excel => {
                const tHeader =   ['name', 'status', 'roles']
                const filterVal = ['name', 'status', 'roles']
                const data = this.formatJson(filterVal)
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: 'user-list'
                })
                this.downloadLoading = false
            })
        },
        formatJson(filterVal) {
            return this.list.map(v => filterVal.map(j => {
                if (j === 'timestamp') {
                    return parseTime(v[j])
                } else {
                    return v[j]
                }
            }))
        },
        getSortClass: function (key) {
            const sort = this.listQuery.sort
            return sort === `+${key}` ? 'ascending' : 'descending'
        }
    }
}
</script>