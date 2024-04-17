<template>
  <div>
    <!-- 添加环境选择的下拉框 -->
    <select v-model="selectedEnvironment" @change="updateUrl()" class="select-environment">
      <option value="QA环境">QA</option>
      <option value="Staging环境">Staging</option>
      <option value="Production环境">Production</option>
    </select>
    <input v-model="searchId" placeholder="建议用insure_process_id" class="input-searchId rounded-input">
    <button  class="search-button" @click="search">Search</button>
    <!-- 搜索历史记录选择框 -->
    <select @change="updateSearchId" class="rounded-input">
      <option disabled selected value>最近的搜索记录</option>
      <option v-for="(id, index) in searchHistory" :key="index">{{ id }}</option>
<!--      <option placeholder="最近的搜索记录" v-for="(id, index) in searchHistory" :key="index">{{ id }}</option>-->
    </select>
    <div v-for="table in tables" :key="table.name">
      <div>
        <h3 @click="table.isCollapse = !table.isCollapse">{{ table.name }}
          <button @click.stop="table.isCollapse = !table.isCollapse">{{ table.isCollapse ? '展开' : '折叠' }}</button>
        </h3>
        <div v-if="!table.isCollapse && table.data && Object.keys(table.data).length" class="table-content" style="display: flex; flex-direction: row; justify-content: center; align-items: flex-start; flex-wrap: wrap;">
          <div v-for="(value, key) in table.data" :key="key" style="flex: 1 1 25%; display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start;">
            <div class="card" style="margin: 0.5em;">
              <div class="card-body">
                <p class="card-text" :class="{ highlight: isHighlight(key) }" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 0.5em; font-size: 0.9em;">
                  {{ key }}:
                  <span class="details-text" v-if="isLongText(value)">{{ truncatedText(JSON.stringify(value)) }}<a v-on:click="showDetails($event, value)" class="details-link">详情</a></span>
                  <span v-else>{{ value }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div v-else-if="!table.isCollapse">
          暂无数据
          <img :src="logoPath" alt="logoPath" style="width: 200px; height: auto;"/>
        </div>
      </div>
    </div>
    <div class="no-data" v-if="isAllTablesEmpty">
      New-Exectuor，搜你想要的！
      <img :src="logoPath"  alt="logoPath" style="width: 200px; height: auto;"/>
    </div>
    <div v-if="showDetailContent" class="details-popup">
      <span class="dismiss" @click="dismissDetails">X</span>
      <pre>{{ showDetailContent }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios'


export default {
  data() {
    return {
      searchId: '',
      data: null,
      logoPath: require('/public/images/WebStorm.jpg'),
      tables: [],
      detailPopupStyles: { // add this new object
        top: '0px',
        left: '0px',
      },
      searchHistory: [],
      // 新增的 data 属性
      selectedEnvironment: 'QA环境', // 默认选择QA环境
      requestUrl: 'http://192.168.10.73:8090/qa' ,// 根据选择的环境变化
      showDetailContent: null // add this to hold the value to show in the details popup
    }
  },
  methods: {
    // 新增的 methods
    updateUrl() {
      if (this.selectedEnvironment === 'QA环境') {
        this.requestUrl = 'http://192.168.10.73:8090/qa';
      } else if (this.selectedEnvironment === 'Staging环境') {
        this.requestUrl = 'http://192.168.10.73:8090/staging';
      } else if (this.selectedEnvironment === 'Production环境') {
        this.requestUrl = 'http://192.168.10.73:8090/production';
      }
    },
    async search() { // 添加 async 关键字，以便使用 await 关键字等待异步操作完成
      // 在发送请求前，将 searchId 添加到搜索历史
      this.searchHistory.unshift(this.searchId);
      if (this.searchHistory.length > 8) {
        this.searchHistory.pop(); // 如果搜索历史数组长度超过5，移除最老的记录
      }
      try {
        const response = await axios.get(`${this.requestUrl}/search/${this.searchId}`); // 使用 await 等待 API 响应
        if (response.data && response.data.AllTables) {
          // 更新整个表格数组
          this.tables = response.data.AllTables;
          console.log(this.tables)
        }
      } catch (error) {
        console.error("Error during API call:", error); // 处理 API 请求可能出现的错误
      }
    },
    isHighlight(key) {
      const keywords = ['Amount', 'State', 'node_type']; // 需要高亮的字段关键字
      return keywords.some(keyword => key.includes(keyword)); // 检查字段名是否包含特定关键字，并返回结果
    },
    truncatedText(text) {
      return this.isLongText(text) ? `${text.substring(0, 28)}...` : text;
    },
    showDetails(event, text) {
      const rect = event.target.getBoundingClientRect();
      this.detailPopupStyles = {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
      };
      this.showDetailContent = text;
    },
    dismissDetails() {
      this.showDetailContent = null;
    },

    isLongText(value) {
      if (typeof value === 'string') { // Directly check length if value is a string
        return value.length > 30;
      } else if (typeof value === 'object') { // Convert to string if value is an object or array
        let str = JSON.stringify(value);
        return str.length > 30;
      } else { // Handle other types of values if necessary
        return false;
      }
    },
    //更新搜索记录到搜索输入框
    updateSearchId(event) {
      this.searchId = event.target.value;
    },
    isJsonString(str) {
      try {
        // Only parse if str is a string
        if (typeof str === 'string') {
          JSON.parse(str);
        }
      } catch (e) {
        return false;
      }
      // Return true if str is a string and can be parsed to JSON, otherwise return false
      return typeof str === 'string';
    }
  },
  computed: {
    isAllTablesEmpty() { // 检查所有表是否都为空
      return this.tables.every(table => table.data && Object.keys(table.data).length === 0);
      },
  },
}
</script>



<style scoped>
.v-card {
  max-width: 300px;
}

.highlight {
  background-color: darkseagreen;
}
.details-popup {
  background-color: lightgreen;
  position: absolute;
  border: 1px solid #ccc;
  padding: 15px;
  top: 0;
  right: 0;
}
.dismiss {
  color: green;
  float: right;
  cursor: pointer;
}
.details-text {
  color: green;
}
.table-content {
  border: 1px solid black;
}
.rounded-input{
  border-radius: 12px;
  border: 1px solid #ccc;
  padding: 8px 20px;
}
.search-button {
  background-color: aquamarine;
  border-radius: 12px;
  border: 1px solid #ccc;
  padding: 8px 20px;
}
.select-environment {
  width: 50px;  /* 调整到你需要的宽度 */
  overflow: hidden;
  background-color: aquamarine;

}

.input-searchId {
  width: 300px;  /* 调整到你需要让所有内容都能显示的宽度 */
}
</style>
