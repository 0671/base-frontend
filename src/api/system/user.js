import request from '@/utils/request'

export function fetchList(query) {
    return request({
      url: '/vue-admin-template/system/user/list',
      method: 'get',
      params: query
    })
  }
  
  export function fetchData(id) {
    return request({
      url: '/vue-admin-template/system/user/detail',
      method: 'get',
      params: { id }
    })
  }
  
  export function createData(data) {
    return request({
      url: '/vue-admin-template/system/user/create',
      method: 'post',
      data
    })
  }
  
  export function updateData(data) {
    return request({
      url: '/vue-admin-template/system/user/update',
      method: 'post',
      data
    })
  }
  
