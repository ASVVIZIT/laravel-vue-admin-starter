export default {
  route: {
    dashboard: '仪表盘',
    permission: '权限管理',
    pagePermission: '页面权限',
    rolePermission: '角色权限',
    directivePermission: '指令权限',
    charts: '图表',
    keyboardChart: '键盘图表',
    lineChart: '折线图',
    mixChart: '混合图表',
    table: '表格',
    form: '表单',
    errorPages: '错误页面',
    page401: '401',
    page404: '404',
    administrator: '管理员',
    users: '用户列表',
    userProfile: '用户资料',
    guide: '网站指南',
  },
  navbar: {
    logOut: '退出登录',
    dashboard: '仪表盘',
    github: 'GitHub仓库',
    theme: '主题',
    size: '全局尺寸',
    profile: '个人资料',
    logout: '退出',
    home: '首页'
  },
  login: {
    title: '系统登录',
    logIn: '登录',
    username: '用户名',
    password: '密码',
    any: '任意',
    thirdparty: '第三方登录',
    thirdpartyTips: '本地无法模拟，请根据业务需求实现！',
    email: '邮箱',
    loginSuccess: '登录成功'
  },
  validation: {
    general: {
      notNameAdmin: '禁止使用此名称',
      required: '必填字段',
      minLength: '至少{min}个字符',
      email: '无效的邮箱',
      phone: '无效的电话格式',
      match: '必须与{field}匹配',
      specialChars: '至少需要{min}个特殊字符',
      notMatch: '密码不能与{field}相同',
      passwordNotEmail: '密码不能与邮箱相同',
      passwordNotName: '密码不能与名称相同',
      matchPassword: '密码必须一致'
    },
    fields: {
      password: '密码',
      phone: '电话',
      email: '邮箱',
      name: '名称'
    },
    rules: {
      role: { required: '需要角色' },
      name: { required: '需要名称' },
      sex: { required: '需要性别' },
      email: {
        required: '需要邮箱',
        type: '请输入有效的邮箱'
      },
      password: { required: '需要密码' },
      confirmPassword: {
        required: '确认密码',
        mismatched: '密码不匹配！'
      }
    }
  },
  permission: {
    actions: {
      addRole: '添加角色权限',
      editPermission: '编辑权限',
      delete: '删除',
      confirm: '确认',
      cancel: '取消'
    },
    messages: {
      editPermissionForForm: '编辑权限为',
      switchRoles: '切换角色',
      tips: '某些情况下不适合使用v-role/v-permission（例如Element Tab组件或el-table-column），请手动使用v-if和checkRole/checkPermission。'
    },
    table: {
      edit: { user: '编辑访问权限' },
      rolePermissions: { name: '继承自角色' },
      userPermissions: {
        name: {
          menu: '附加菜单',
          permissions: '附加权限'
        }
      },
      elMessageBox: {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        warning: '警告',
        continue: '继续？',
        confirm1: { message: '将永久删除该用户' }
      },
      elMessage: {
        update: { success: { message: '权限更新成功' } },
        delete: {
          success: { message: '删除完成' },
          canceled: { message: '删除已取消' }
        },
        newUser: {
          success: {
            message: {
              part1: '新用户',
              part2: '已成功创建。'
            }
          }
        },
        confirmPermission: {
          success: { message: '权限更新成功' }
        }
      }
    }
  },
  table: {
    general: {
      description: '描述',
      dynamicTips1: '固定表头，按表头顺序排序',
      dynamicTips2: '不固定表头，按点击顺序排序',
      dragTips1: '默认顺序',
      dragTips2: '拖拽后顺序',
      title: '标题',
      importance: '重要性',
      type: '类型',
      remark: '备注',
      search: '搜索',
      add: '添加',
      filterReset: '重置所有筛选',
      export: '导出',
      reviewer: '审核人',
      id: 'ID',
      date: '日期',
      author: '作者',
      readings: '阅读量',
      status: '状态',
      actions: '操作',
      edit: '编辑',
      publish: '发布',
      draft: '草稿',
      delete: '删除',
      cancel: '取消',
      confirm: '确认'
    },
    user: {
      form: {
        title: {
          create: '创建新用户',
          edit: '编辑用户'
        },
        about_me: '关于我',
        education: '教育',
        skills: '技能',
        tabs: {
          timeline: '时间线',
          account: '账户'
        },
        fields: {
          role: { title: '角色', placeholder: '选择角色' },
          name: { title: '名称', placeholder: '您的名字' },
          email: { title: '邮箱', placeholder: '您的邮箱' },
          password: { title: '密码', placeholder: '输入密码' },
          confirmPassword: { title: '确认密码', placeholder: '不能与名称或邮箱相同' },
          sex: { title: '性别', placeholder: '' },
          male: { title: '男', placeholder: '' },
          female: { title: '女', placeholder: '' },
          age: { title: '年龄', placeholder: '未指定出生日期' },
          birthday: { title: '生日', placeholder: '选择出生日期' },
          description: { title: '描述', placeholder: '写下关于您自己...' }
        }
      },
      columns: {
        id: 'ID',
        name: '名称',
        email: '邮箱',
        role: '角色'
      },
      elMessageBox: {
        deleteTitle: '删除用户！',
        confirmButtonText: '接受',
        cancelButtonText: '取消',
        warning: '警告',
        continue: '继续？',
        confirm1: { "message@j": '这将永久删除用户。 <br><strong>{name}</strong>' }
      },
      "elMessage": {
        "created": {
          "success": {
            "message": "用户已创建"
          },
          "error": {
            "message": "用户创建错误"
          }
        },
        "delete": {
          "success": { "message": "用户已成功删除" },
          "error": { "message": "用户删除错误" },
          "canceled": { "message": "删除已取消" }
        },
        "newUser": {
          "success": {
            "message": {
              "part1": "新用户",
              "part2": "已成功创建。"
            }
          }
        }
      }
    }
  },
  tagsView: {
    refresh: '刷新',
    close: '关闭',
    closeOthers: '关闭其他',
    closeAll: '关闭所有'
  },
  settings: {
    title: '页面样式设置',
    theme: '主题颜色',
    tagsView: '启用标签视图',
    fixedHeader: '固定头部',
    sidebarLogo: '侧边栏Logo'
  },
  user: {
    profile: {
      notfound: '用户未找到',
      avatar: '头像',
      about_me: '关于我',
      education: '教育',
      skills: '技能',
      tabs: {
        timeline: '时间线',
        account: '账户'
      },
      elMessage: {
        update: {
          success: {
            message: '用户的信息已成功更新'
          }
        },
      },
      fields: {
        role: { title: '角色', placeholder: '选择角色' },
        name: { title: '名称', placeholder: '您的名字' },
        email: { title: '邮箱', placeholder: '您的邮箱' },
        password: { title: '密码', placeholder: '输入密码' },
        confirmPassword: { title: '确认密码', placeholder: '不能与名称或邮箱相同' },
        sex: { title: '性别', placeholder: '' },
        male: { title: '男', placeholder: '' },
        female: { title: '女', placeholder: '' },
        age: { title: '年龄', placeholder: '未指定出生日期' },
        birthday: { title: '生日', placeholder: '选择出生日期' },
        description: { title: '描述', placeholder: '写下关于您自己...' }
      }
    }
  },
  roles: {
    name: '角色',
    description: {
      superadmin: '超级管理员：拥有所有页面和功能的完全访问权限。',
      admin: '管理员：拥有所有页面的完全访问权限。',
      manager: '经理：除权限页面外的大部分页面访问权限。',
      editor: '编辑：可访问文章和相关资源。',
      user: '用户：仅限访问特定页面。',
      visitor: '访客：仅限访问静态页面。'
    }
  },
  switchLang: {
    localName: '语言切换成功'
  },
  form: {
    button: {
      save: '保存',
      cancel: '取消'
    }
  }
};
