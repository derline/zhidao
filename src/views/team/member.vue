<template>
    <div class="app-container">
        <div class="filter-container">
            <el-input v-model="listQuery.username" placeholder="用户名" size="small" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
            <el-select v-model="listQuery.sort" size="small" style="width: 140px" class="filter-item" @change="handleFilter">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
            </el-select>
            <el-button v-waves class="filter-item" type="primary" size="small" icon="el-icon-search" @click="handleFilter">查询</el-button>
            <el-button v-waves class="filter-item" type="primary" size="small" icon="el-icon-update" @click="handleTeamUpdate">更新</el-button>
        </div>
        <el-table
                :key="tableKey"
                v-loading="listLoading"
                :data="list"
                border
                size="mini"
                style="width: 100%;"
                row-key="uid"
                @sort-change="sortChange"
        >
            <el-table-column label="序号" type="index" width="50" />
            <el-table-column label="用户名" width="200">
                <template slot-scope="{row}">
                    <span class="link-type">{{ row.username }}</span>
                </template>
            </el-table-column>
            <el-table-column label="采纳" width="110px" align="right">
                <template slot-scope="{row}">
                    <span>{{ row.resolveNum }}</span>
                </template>
            </el-table-column>
            <el-table-column label="回答" width="110px" align="right">
                <template slot-scope="{row}">
                    {{ row.answerNum }}
                </template>
            </el-table-column>
            <el-table-column label="%" width="80px" align="right">
                <template slot-scope="{row}">
                    {{ row.resolveRate }}
                </template>
            </el-table-column>
            <el-table-column label="已休" align="right" width="95">
                <template slot-scope="{row}">
                    {{ row.stopDays }}
                </template>
            </el-table-column>
            <el-table-column label="总假期" align="right" width="95">
                <template slot-scope="{row}">
                    {{ row.totalHolidays }}
                </template>
            </el-table-column>
            <el-table-column label="考核周期" align="right" width="95">
                <template slot-scope="{row}">
                    {{ row.kpiHolidays }}
                </template>
            </el-table-column>
            <el-table-column label="团龄假期" align="right" width="95">
                <template slot-scope="{row}">
                    {{ row.ageHolidays }}
                </template>
            </el-table-column>
            <el-table-column label="最后答" align="center" width="95">
                <template slot-scope="{row}">
                    {{ row.ansDateStr }}
                </template>
            </el-table-column>
            <el-table-column label="团龄" align="center" width="95">
                <template slot-scope="{row}">
                    {{ row.joinTimeStr }}
                </template>
            </el-table-column>
            <el-table-column label="kpi" align="right" width="95">
                <template slot-scope="{row}">
                    {{ row.kpi }}
                </template>
            </el-table-column>
            <el-table-column label="更新时间" align="center" width="150">
                <template slot-scope="{row}">
                    {{ row.updTime }}
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
            <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
                <el-form-item label="Date" prop="timestamp">
                    <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="Please pick a date" />
                </el-form-item>
                <el-form-item label="Title" prop="title">
                    <el-input v-model="temp.title" />
                </el-form-item>
                <el-form-item label="Status">
                    <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
                        <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
                    </el-select>
                </el-form-item>
                <el-form-item label="Imp">
                    <el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;" />
                </el-form-item>
                <el-form-item label="Remark">
                    <el-input v-model="temp.remark" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">
                    Cancel
                </el-button>
                <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
                    Confirm
                </el-button>
            </div>
        </el-dialog>

        <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
            <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
                <el-table-column prop="key" label="Channel" />
                <el-table-column prop="pv" label="Pv" />
            </el-table>
            <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">Confirm</el-button>
      </span>
        </el-dialog>
    </div>
</template>

<script>
import { fetchList, updateTeam } from '@/api/member'
import { parseTime } from '@/utils'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination'

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'info',
        deleted: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        teamId: this.$route.path.substring(this.$route.path.lastIndexOf('/') + 1),
        page: 1,
        limit: 20,
        importance: undefined,
        title: '',
        type: undefined,
        sort: 'kpi'
      },
      sortOptions: [{ label: 'kpi由低到高', key: 'kpi' }, { label: 'kpi由高到低', key: '-id' }],
      statusOptions: ['published', 'draft', 'deleted'],
      showReviewer: false,
      temp: {
        id: undefined,
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        type: '',
        status: 'published'
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.rows || []
        this.total = response.data.total || 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleTeamUpdate() {
      updateTeam(this.listQuery.teamId).then(response => {
        this.getList()
      })
    },
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作Success',
        type: 'success'
      })
      row.status = status
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
        importance: 1,
        remark: '',
        timestamp: new Date(),
        title: '',
        status: 'published',
        type: ''
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
          this.temp.author = 'vue-element-admin'
          createArticle(this.temp).then(() => {
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
      this.temp.timestamp = new Date(this.temp.timestamp)
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
          tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateArticle(tempData).then(() => {
            for (const v of this.list) {
              if (v.id === this.temp.id) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.temp)
                break
              }
            }
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
    handleDelete(row) {
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    getSortClass: function(key) {
      const sort = this.listQuery.sort
      return sort === `+${key}`
        ? 'ascending'
        : sort === `-${key}`
          ? 'descending'
          : ''
    }
  }
}
</script>
