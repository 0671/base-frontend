const Mock = require('mockjs')

const List = []

const users = [
  {
    id:1,
    roles: ['admin'],
    password: '123456',
    status: 'enable',
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin'
  },
  {
    id:2,
    roles: ['editor'],
    password: '123456',
    status: 'enable',
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor'
  },
  {
    id:3,
    roles: ['checker'],
    password: '123456',
    status: 'enable',
    introduction: 'I am an checker',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Checker'
  }
]

for (let i = 0; i < users.length; i++) {
  List.push(Mock.mock(users[i]))
}

module.exports = [
  {
    url: '/vue-admin-template/system/user/list\.*',
    type: 'get',
    response: config => {
      const { name = '', page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (name && item.name.indexOf(name) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/vue-admin-template/system/user/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const data of List) {
        if (data.id === +id) {
          return {
            code: 20000,
            data: data
          }
        }
      }
    }
  },

  {
    url: '/vue-admin-template/system/user/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-admin-template/system/user/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]