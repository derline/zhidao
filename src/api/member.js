import request from '@/utils/request'
import qs from 'qs'

export function fetchList(data) {
  console.log(data)
  return request({
    url: '/members',
    // url: '/vue-admin-template/user/login',
    method: 'post',
    data: qs.stringify(data)
  })
}
