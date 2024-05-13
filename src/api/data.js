import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-admin-template/data/list',
    method: 'get',
    params: query
  })
}

export function fetchData(id) {
  return request({
    url: '/vue-admin-template/data/detail',
    method: 'get',
    params: { id }
  })
}

export function createData(data) {
  return request({
    url: '/vue-admin-template/data/create',
    method: 'post',
    data
  })
}

export function updateData(data) {
  return request({
    url: '/vue-admin-template/data/update',
    method: 'post',
    data
  })
}
