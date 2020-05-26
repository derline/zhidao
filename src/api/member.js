import request from '@/utils/request'
import qs from 'qs'

export function fetchList(data) {
  console.log('请求参数：' + JSON.stringify(data))
  return request({
    url: '/members',
    // url: '/vue-admin-template/user/login',
    method: 'post',
    data: qs.stringify(data)
  })
}

export function updateTeam(teamId) {
  return request({
    url: '/updateTeamUser',
    method: 'post',
    data: 'teamId=' + teamId
  })
}

export function cleanMembers(teamId) {
  return request({
    url: '/zhidao',
    method: 'post',
    data: 'api=cleanMembers&teamId=' + teamId
  })
}
