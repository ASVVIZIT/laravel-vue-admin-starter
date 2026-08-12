export default {
  "route": {
    "Dashboard": "仪表盘",
    "Permission": "权限管理",
    "PagePermission": "页面权限",
    "RolePermission": "角色权限",
    "DirectivePermission": "指令权限",
    "Charts": "图表",
    "KeyboardChart": "键盘图表",
    "LineChart": "折线图",
    "MixChart": "混合图表",
    "Table": "表格",
    "Form": "表单",
    "ErrorPages": "错误页面",
    "Page401": "401",
    "Page404": "404",
    "Administrator": "管理员",
    "UserList": "用户列表",
    "UserProfile": "用户资料",
    "DynamicTable": "动态表",
    "Guide": "网站指南",
    "Entity": "参考数据和组件",
    "Brands": "品牌",
    "DeviceType": "设备类型",
    "MeasurementUnit": "计量单位",
    "Accessories": "电气配件",
    "AccessoriesList": "配件清单",
    "AccessoryCreate": "创建电气配件",
    "AccessoryEdit": "编辑电气配件",
    "i18nChecker": "i18n 翻译检查器",
  },
  "navbar": {
    "logOut": "退出登录",
    "dashboard": "仪表盘",
    "github": "GitHub仓库",
    "theme": "主题",
    "size": "全局尺寸",
    "profile": "个人资料",
    "logout": "退出",
    "home": "首页"
  },
  "auth": {
    "forgotPasswordTitle": "忘记密码？",
    "forgotPasswordSubtitle": "输入您的邮箱，我们将发送重置链接",
    "sendResetLink": "发送重置链接",
    "emailSent": "邮件已发送！",
    "checkEmail": "请检查您的邮箱",
    "resetLinkSent": "如果账户存在，您将收到邮件",
    "resetLinkSentGeneric": "如果账户存在于我们的数据库中，所有者将收到包含密码重置说明的邮件。",
    "resetLinkSentHint": "如果几分钟内未收到邮件，请检查垃圾邮件文件夹或确认邮箱地址正确。",
    "resetFailed": "发送重置链接失败",
    "backToLogin": "返回登录",

    "resetPasswordTitle": "重置密码",
    "resetPasswordSubtitle": "输入新密码",
    "resetPassword": "重置密码",
    "passwordResetSuccess": "密码重置成功",
    "invalidResetLink": "无效或已过期的链接",

    "registerTitle": "创建账户",
    "registerSubtitle": "填写表单以创建账户",
    "register": "注册",
    "registerSuccess": "注册成功！请检查您的邮箱",
    "registerFailed": "注册失败",
    "alreadyHaveAccount": "已有账户？登录",
    "agreeTerms": "我同意使用条款",
    "mustAgreeTerms": "请接受条款",

    "emailVerificationTitle": "邮箱验证",
    "emailVerificationSubtitle": "我们已向您的邮箱发送验证链接",
    "emailVerified": "您的邮箱已验证！",
    "checkYourEmail": "请检查您的邮箱：",
    "goToLogin": "前往登录",
    "verificationResent": "验证邮件已重新发送",
    "resendFailed": "发送邮件失败",
    "resendVerification": "重新发送验证邮件",
    "resendCooldown": "{seconds}秒后重试",
    "sending": "发送中...",
    "verifying": "验证中...",
    "invalidVerificationLink": "无效的验证链接",
    "verificationFailed": "验证失败"
  },
  "login": {
    "title": "登录您的个人账户",
    "adminTitle": "管理员登录",
    "testerTitle": "测试登录",
    "moderatorTitle": "版主登录",
    "vipTitle": "贵宾登录",

    "email": "邮箱",
    "username": "用户名",
    "password": "密码",
    "confirmPassword": "确认密码",
    "any": "任意",

    "logIn": "登录",
    "loginAsTester": "以测试员身份登录",
    "selectRole": "选择角色",

    "forgotPassword": "忘记密码？",
    "register": "注册",
    "rememberMe": "记住我",
    "twoFactorCode": "双重认证码",
    "captcha": "输入验证码",
    "vipCode": "贵宾码",

    "thirdparty": "或通过以下方式登录",
    "thirdpartyTips": "本地无法模拟，请结合您自己的业务进行模拟！！！",

    "loginSuccess": "登录成功",
    "loginFailed": "登录失败"
  },
  "validation": {
    "general": {
      "notNameAdmin": "禁止使用此名称",
      "required": "必填字段",
      "minLength": "至少{min}个字符",
      "email": "无效的邮箱",
      "phone": "无效的电话格式",
      "match": "必须与{field}匹配",
      "specialChars": "至少需要{min}个特殊字符",
      "notMatch": "密码不能与{field}相同",
      "passwordNotEmail": "密码不能与邮箱相同",
      "passwordNotName": "密码不能与名称相同",
      "matchPassword": "密码必须一致"
    },
    "fields": {
      "password": "密码",
      "phone": "电话",
      "email": "邮箱",
      "name": "名称"
    },
    "rules": {
      "role": { "required": "需要角色" },
      "name": { "required": "需要名称" },
      "sex": { "required": "需要性别" },
      "email": {
        "required": "需要邮箱",
        "type": "请输入有效的邮箱"
      },
      "password": {
        "placeholder": "输入密码",
        "required": "需要密码",
        "minLength": "密码不能包含少于6位数字"
      },
      "confirmPassword": {
        "required": "需要确认密码",
        "mismatched": "密码不匹配！"
      },
      "twoFactor": {
        "required": "需要双重认证码",
        "pattern": "验证码必须是6位数字",
        "placeholder": "请输入6位验证码"
      },
      "captcha": {
        "required": "需要输入验证码",
        "invalid": "验证码错误"
      },
      "phone": {
        "required": "需要电话号码",
        "pattern": "电话格式无效"
      },
      "vipCode": {
        "required": "需要贵宾码",
        "pattern": "贵宾码必须是 VIP-XXXXXXXX 格式"
      },
      "accessory": {
        "fields": {
          "name": { "required": "名称必填" },
          "model": { "required": "型号必填" },
          "type_id": { "required": "请选择设备类型" },
          "brand_id": { "required": "请选择品牌" }
        }
      }
    }
  },
  "permission": {
    "search": "搜索权限...",
    "actions": {
      "addRole": "添加角色权限",
      "editPermission": "编辑权限",
      "delete": "删除",
      "confirm": "确认",
      "cancel": "取消"
    },
    "messages": {
      "unsavedChanges": "您有未保存的更改。不保存就关闭？",
      "noPermissionsSelected": "未选择任何权限。继续？",
      "editPermissionForForm": "编辑权限为",
      "switchRoles": "切换角色",
      "tips": "某些情况下不适合使用v-role/v-permission（例如Element Tab组件或el-table-column），请手动使用v-if和checkRole/checkPermission。"
    },
    "errors": {
      "noUserData": "未找到用户数据",
      "cantEditAdmin": "无法为管理员用户修改权限"
    },
    "table": {
      "edit": { "user": "编辑访问权限" },
      "rolePermissions": { "name": "继承自角色" },
      "userPermissions": {
        "name": {
          "menu": "附加菜单",
          "permissions": "附加权限"
        }
      },
      "elMessageBox": {
        "confirmButtonText": "确认",
        "cancelButtonText": "取消",
        "warning": "警告",
        "continue": "继续？",
        "confirm1": { "message": "将永久删除该用户" }
      },
      "elMessage": {
        "update": {
          "success": { "message": "权限更新成功" },
          "error": { "message": "更新权限时发生错误" }
        },
        "delete": {
          "success": { "message": "删除完成" },
          "canceled": { "message": "删除已取消" }
        },
        "newUser": {
          "success": {
            "message": {
              "part1": "新用户",
              "part2": "已成功创建。"
            }
          }
        },
        "confirmPermission": {
          "success": { "message": "权限更新成功" }
        }
      }
    }
  },
  "table": {
    "general": {
      "description": "描述",
      "dynamicTips1": "固定表头，按表头顺序排序",
      "dynamicTips2": "不固定表头，按点击顺序排序",
      "dragTips1": "默认顺序",
      "dragTips2": "拖拽后顺序",
      "title": "标题",
      "importance": "重要性",
      "type": "类型",
      "remark": "备注",
      "search": "搜索",
      "add": "添加",
      "filterReset": "重置所有筛选",
      "export": "导出",
      "reviewer": "审核人",
      "id": "ID",
      "date": "日期",
      "author": "作者",
      "readings": "阅读量",
      "status": "状态",
      "actions": "操作",
      "buttons": { "actions": "操作列表" },
      "edit": "编辑",
      "publish": "发布",
      "draft": "草稿",
      "delete": "删除",
      "cancel": "取消",
      "confirm": "确认"
    },
    "user": {
      "form": {
        "title": {
          "create": "创建新用户",
          "edit": "编辑用户"
        },
        "about_me": "关于我",
        "education": "教育",
        "skills": "技能",
        "tabs": {
          "timeline": "时间线",
          "account": "账户"
        },
        "fields": {
          "role": { "title": "角色", "placeholder": "选择角色" },
          "name": { "title": "名称", "placeholder": "您的名字" },
          "email": { "title": "邮箱", "placeholder": "您的邮箱" },
          "password": { "title": "密码", "placeholder": "输入密码" },
          "confirmPassword": { "title": "确认密码", "placeholder": "不能与名称或邮箱相同" },
          "sex": { "title": "性别", "placeholder": "" },
          "male": { "title": "男", "placeholder": "" },
          "female": { "title": "女", "placeholder": "" },
          "age": { "title": "年龄", "placeholder": "未指定出生日期" },
          "birthday": { "title": "生日", "placeholder": "选择出生日期" },
          "description": { "title": "描述", "placeholder": "写下关于您自己..." }
        }
      },
      "columns": {
        "id": "ID",
        "name": "名称",
        "email": "邮箱",
        "role": "角色"
      },
      "elMessageBox": {
        "deleteTitle": "删除用户！",
        "confirmButtonText": "接受",
        "cancelButtonText": "取消",
        "warning": "警告",
        "continue": "继续？",
        "confirm1": { "message@j": "这将永久删除用户。<br><strong>{name}</strong>" }
      },
      "elMessage": {
        "created": {
          "success": { "message": "用户已创建" },
          "error": { "message": "用户创建错误" }
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
  "tagsView": {
    "refresh": "刷新",
    "close": "关闭",
    "closeOthers": "关闭其他",
    "closeAll": "关闭所有"
  },
  "settings": {
    "title": "页面样式设置",
    "theme": "主题颜色",
    "tagsView": "启用标签视图",
    "fixedHeader": "固定头部",
    "sidebarLogo": "侧边栏Logo"
  },
  "user": {
    "profile": {
      "notfound": "用户未找到",
      "avatar": "头像",
      "about_me": "关于我",
      "education": "教育",
      "skills": "技能",
      "emailStatus": "邮箱状态",
      "tabs": {
        "timeline": "时间线",
        "account": "账户"
      },
      "elMessage": {
        "update": {
          "success": { "message": "用户信息已成功更新" }
        },
        "reverify": {
          "success": "重新验证邮件已发送到您的邮箱",
          "error": "发送邮件失败"
        }
      },
      "fields": {
        "role": { "title": "角色", "placeholder": "选择角色" },
        "name": { "title": "名称", "placeholder": "您的名字" },
        "email": {
          "title": "邮箱",
          "placeholder": "您的邮箱",
          "changeHint": "更改邮箱需要通过当前邮箱进行验证",
          "systemEmail": "系统邮箱 - 无需验证"
        },
        "email_verified": { "title": "邮箱状态" },
        "email_reverified": { "title": "最后重新验证" },
        "password": { "title": "密码", "placeholder": "输入密码" },
        "confirmPassword": { "title": "确认密码", "placeholder": "不能与名称或邮箱相同" },
        "sex": { "title": "性别", "placeholder": "" },
        "male": { "title": "男", "placeholder": "" },
        "female": { "title": "女", "placeholder": "" },
        "age": { "title": "年龄", "placeholder": "未指定出生日期" },
        "birthday": { "title": "生日", "placeholder": "选择出生日期" },
        "description": { "title": "描述", "placeholder": "写下关于您自己..." }
      },
      "actions": {
        "request_reverify": "请求重新验证"
      },
      "emailChange": {
        "title": "更改邮箱",
        "currentEmail": "当前邮箱",
        "newEmail": "新邮箱",
        "changeButton": "更改",
        "requestButton": "请求更改",
        "successMessage": "确认邮件已发送到您当前的邮箱",
        "errorMessage": "请求更改邮箱时出错",
        "cancelButton": "取消",
        "confirmButton": "确认",
        "infoText": "确认链接将发送到您当前的邮箱",
        "sameAsCurrent": "新邮箱不能与当前邮箱相同"
      }
    }
  },
  "roles": {
    "admin": "管理员",
    "user": "用户",
    "moderator": "版主",
    "name": "角色",
    "description": {
      "superadmin": "超级管理员。拥有对所有页面的访问权和完全权限，以及更多。",
      "admin": "管理员。拥有对所有页面的访问权和完全权限。",
      "manager": "经理。拥有对大多数页面的访问权和权限（权限页面除外）。",
      "editor": "编辑。可访问大多数页面，拥有对文章及相关资源的完全访问权限。",
      "user": "普通用户。可访问部分页面。",
      "visitor": "访客。可访问静态页面，无任何写入权限。",
      "moderator": "版主。可以审核内容和管理用户。",
      "vip": "贵宾。具有扩展功能的特权用户。"
    }
  },
  "switchLang": {
    "localName": "语言切换成功"
  },
  "form": {
    "button": {
      "save": "保存",
      "cancel": "取消"
    }
  },
  "accessory": {
    "form_title_edit": "编辑配件",
    "form_title_create": "创建配件",
    "tabs": {
      "main": {
        "title": "基本信息",
        "group": {
          "critical": "关键字段",
          "basicTech": "基础技术数据"
        }
      },
      "technical": {
        "title": "技术规格",
        "group": {
          "electrical": "电气参数",
          "construction": "结构特性"
        }
      },
      "operational": {
        "title": "操作参数",
        "group": { "safety": "安全和操作条件" }
      },
      "additional": {
        "title": "附加设备",
        "group": { "compatibility": "兼容性和控制" }
      }
    },
    "table": {
      "title": "配件列表",
      "add_button": "添加配件",
      "search_placeholder": "按型号、名称或品牌搜索...",
      "empty_text": "无数据",
      "total_items": "总记录数:",
      "actions": "操作",
      "columns": {
        "id": "ID",
        "name": "名称",
        "model": "型号",
        "brand": "品牌",
        "type": "类型",
        "compatible_models": "兼容型号",
        "cross_section": "电缆截面",
        "current_rating": "额定电流",
        "thickness": "厚度",
        "quantity_per_pack": "每包数量",
        "rated_diff_current": "差动电流",
        "voltage": "电压",
        "communication_protocol": "通讯协议",
        "remote_control": "遥控",
        "ip_rating": "防护等级",
        "mounting_type": "安装类型",
        "standards": "标准",
        "material": "材料",
        "edit": "编辑",
        "delete": "删除"
      }
    },
    "messages": {
      "delete_confirm": "您确定要删除此配件吗？此操作不可撤销。",
      "delete_confirm_title": "删除确认",
      "delete_success": "配件删除成功",
      "delete_error": "删除配件时出错: {error}"
    },
    "placeholders": {
      "name": "示例：远程控制模块",
      "model": "示例：ARA iC60",
      "description": "示例：配件详细描述",
      "series": "示例：Acti9",
      "voltage": "示例：230/400",
      "ip_rating": "示例：IP40",
      "mounting_type": "示例：模块化",
      "standards": "示例：IEC 60947",
      "material": "示例：热塑性塑料",
      "compatible_models": "示例：iC60, NG125",
      "communication_protocol": "示例：Ti24"
    },
    "fields": {
      "model": "型号",
      "name": "名称",
      "description": "描述",
      "brand_id": "品牌",
      "type_id": "设备类型",
      "series": "系列",
      "cross_section": "电缆截面",
      "cross_section_unit_id": "截面单位",
      "current_rating": "额定电流",
      "current_rating_unit_id": "电流单位",
      "thickness": "厚度",
      "thickness_unit_id": "厚度单位",
      "compatible_models": "兼容型号",
      "communication_protocol": "通信协议",
      "remote_control": "远程控制支持",
      "voltage": "电压",
      "voltage_unit_id": "电压单位",
      "ip_rating": "防护等级",
      "mounting_type": "安装类型",
      "standards": "标准",
      "material": "材料",
      "nominal_current": "标称电流",
      "trip_curve": "脱扣曲线",
      "breaking_capacity": "分断能力",
      "breaking_capacity_unit_id": "分断能力单位",
      "tripping_time": "脱扣时间",
      "tripping_time_unit_id": "脱扣时间单位",
      "temperature_range_min": "最低温度范围",
      "temperature_range_max": "最高温度范围",
      "temperature_range_min_unit_id": "最低温度单位",
      "temperature_range_max_unit_id": "最高温度单位",
      "quantity_per_pack": "每包数量",
      "quantity_per_pack_unit_id": "数量单位",
      "rated_diff_current": "额定差动电流",
      "rated_diff_current_unit_id": "差动电流单位"
    },
    "remote_control_status": {
      "true": "有",
      "false": "无"
    },
    "buttons": {
      "table": "到表格",
      "save": "保存配件",
      "create": "创建配件",
      "back": "返回",
      "cancel": "取消"
    }
  },
  "brand": {
    "table": {
      "title": "品牌列表",
      "add_button": "添加品牌",
      "search_placeholder": "按名称、国家或网站搜索...",
      "empty_text": "无数据",
      "total_items": "总记录数:",
      "actions": "操作",
      "per_page_selector": "每页记录数:",
      "columns": {
        "id": "ID",
        "name": "名称",
        "country": "国家",
        "website": "网站"
      },
      "item_actions": {
        "edit": "编辑",
        "delete": "删除"
      }
    },
    "form": {
      "add_title": "添加品牌",
      "edit_title": "正在编辑: {name}",
      "fields": {
        "name": { "label": "品牌名称", "placeholder": "例如: 施耐德电气" },
        "country": { "label": "生产国家", "placeholder": "例如: 法国" },
        "website": { "label": "网站", "placeholder": "https://example.com" },
        "description": { "label": "描述", "placeholder": "品牌简要描述" }
      },
      "rules": {
        "name_required": "名称必填",
        "website_required": "网站必填",
        "website_url": "请输入有效的网址"
      },
      "buttons": {
        "cancel": "取消",
        "add": "添加",
        "save": "保存"
      }
    },
    "messages": {
      "delete_confirm": "您确定要删除此品牌吗？此操作不可撤销。",
      "delete_confirm_title": "删除确认",
      "delete_success": "品牌删除成功",
      "add_success": "品牌添加成功",
      "update_success": "更改已保存",
      "error": "错误: {error}"
    }
  },
  "deviceType": {
    "table": {
      "title": "设备类型列表",
      "add_button": "添加类型",
      "search_placeholder": "按名称、代码或描述搜索...",
      "empty_text": "无数据",
      "total_items": "总记录数:",
      "per_page_selector": "每页记录数:",
      "actions": "操作",
      "columns": {
        "id": "ID",
        "name": "名称",
        "code": "代码",
        "description": "描述"
      },
      "item_actions": {
        "edit": "编辑",
        "delete": "删除"
      }
    },
    "form": {
      "add_title": "添加设备类型",
      "edit_title": "正在编辑: {name}",
      "fields": {
        "name": { "label": "类型名称", "placeholder": "例如: 断路器" },
        "code": { "label": "类型代码", "placeholder": "例如: CB" },
        "description": { "label": "描述", "placeholder": "设备类型简要描述" }
      },
      "rules": {
        "name_required": "名称必填",
        "code_required": "代码必填"
      },
      "buttons": {
        "cancel": "取消",
        "add": "添加",
        "save": "保存"
      }
    },
    "messages": {
      "delete_confirm": "您确定要删除此设备类型吗？此操作不可撤销。",
      "delete_confirm_title": "删除确认",
      "delete_success": "设备类型删除成功",
      "add_success": "设备类型添加成功",
      "update_success": "更改已保存",
      "error": "错误: {error}"
    }
  },
  "measurementUnit": {
    "table": {
      "title": "测量单位列表",
      "add_button": "添加单位",
      "search_placeholder": "按名称、符号、数量或类别搜索...",
      "empty_text": "无数据",
      "total_items": "总记录数:",
      "per_page_selector": "每页记录数:",
      "actions": "操作",
      "columns": {
        "id": "ID",
        "name": "名称",
        "display_symbol": "符号",
        "physical_quantity": "物理量",
        "category": "类别"
      },
      "item_actions": {
        "edit": "编辑",
        "delete": "删除"
      }
    },
    "form": {
      "add_title": "添加测量单位",
      "edit_title": "正在编辑: {name}",
      "fields": {
        "name": { "label": "名称", "placeholder": "例如: 安培" },
        "symbol": { "label": "符号（存储）", "placeholder": "例如: a (小写)" },
        "display_symbol": { "label": "显示符号", "placeholder": "例如: A" },
        "physical_quantity": { "label": "物理量", "placeholder": "例如: 电流" },
        "measurement_category_id": { "label": "类别", "placeholder": "选择类别" }
      },
      "rules": {
        "name_required": "名称必填",
        "symbol_required": "符号必填",
        "display_symbol_required": "显示符号必填",
        "physical_quantity_required": "物理量必填",
        "category_required": "类别必填"
      },
      "buttons": {
        "cancel": "取消",
        "add": "添加",
        "save": "保存"
      }
    },
    "messages": {
      "delete_confirm": "您确定要删除此测量单位吗？此操作不可撤销。",
      "delete_confirm_title": "删除确认",
      "delete_success": "测量单位删除成功",
      "add_success": "测量单位添加成功",
      "update_success": "更改已保存",
      "error": "错误: {error}"
    }
  },
  "common": {
    "noData": "暂无数据",
    "items": "项",
    "selected": "已选择",
    "warning": "警告",
    "submitting": "保存中...",
    "required": "必填字段",
    "view404": {
      "buttons": {
        "back": "返回",
        "backHome": "回家吧"
      },
      "OOPS": "哎呀！",
      "Message": "保镖说你不能进入这个页面...",
      "Info": "请检查您输入的URL是否正确。点击下面的按钮返回主页。",
      "CopyrightBy": "版权由",
      "ProjectInGithub": "Github中的项目"
    },
    "view401": {
      "buttons": {
        "back": "返回",
        "backHome": "回家吧"
      },
      "CanGo": "或者你可以去:",
      "OOPS": "哇！",
      "Permission": "您没有访问此页面的权限。",
      "MessageAdmin": "如果您不满意，请与管理员联系。",
      "JustLookingAroundHref": "https://www.google.com/",
      "JustLookingAround": "互联网搜索",
      "ShowPicture": "显示初始屏幕",
      "CasualLook": "访问被拒绝"
    },
    "units": {
      "A": "安",
      "V": "伏",
      "mm": "毫米",
      "mm²": "平方毫米",
      "°C": "摄氏度",
      "mA": "毫安",
      "kA": "千安",
      "ms": "毫秒",
      "шт": "个",
      "m": "米",
      "N": "牛",
      "Pa": "帕",
      "W": "瓦",
      "Hz": "赫兹",
      "kg": "千克",
      "l": "升"
    }
  },
  "error": {
    "loadPermissions": "加载权限出错"
  },
  "roles_description_admin": "系统管理员",
  "roles_description_superadmin": "超级管理员",

  // 👥 用户 — 账户状态管理（封禁/解封/恢复）
  "users": {
    "listTitle": "用户列表",
    "viewTitle": "查看用户",
    "deletedAt": "删除时间",
    "status": {
      "label": "状态",
      "all": "全部",
      "active": "🟢 活跃",
      "banned": "🔴 已封禁",
      "trashed": "⚫ 已删除",
      "unverified": "🟡 未验证"
    },
    "actions": {
      "ban": "封禁",
      "unban": "解除封禁",
      "restore": "恢复",
      "edit": "编辑",
      "delete": "删除",
      "view": "查看",
      "permissions": "权限",
      "cannotEditAdmin": "无法编辑",
      "adminEditHint": "个人资料可访问，权限受保护",
      "adminConfirmOld": "确认旧邮箱",
      "adminConfirmNew": "确认新邮箱",
      "adminQuickActions": "管理员操作",
      "adminQuickActionsHint": "跳过邮件发送直接确认邮箱更改",
      "confirmReason": "确认原因",
      "confirmReasonPlaceholder": "例如：用户无法访问旧邮箱，已通过护照核实身份"
    },
    "dialogs": {
      "banConfirm": "您确定要封禁用户 {name} 吗？",
      "banTitle": "确认封禁",
      "restoreConfirm": "恢复用户 {name}？",
      "restoreTitle": "确认恢复"
    },
    "messages": {
      "banSuccess": "用户已被封禁",
      "banError": "封禁失败",
      "unbanSuccess": "用户已解除封禁",
      "unbanError": "解除封禁失败",
      "restoreSuccess": "用户已恢复",
      "restoreError": "恢复失败",
      "adminConfirmSuccess": "操作成功完成",
      "adminConfirmError": "操作执行失败"
    },
    "permissions": {
      "tooltip": {
        "role_view": "Inherited from role — View",
        "role_manage": "Inherited from role — Manage",
        "user_view": "Additional — View",
        "user_manage": "Additional — Manage",
      }
    }
  },

  // 🔍 I18N CHECKER (翻译检查器)
  "i18nChecker": {
    // === 基础 ===
    "title": "i18n 翻译检查器",
    "subtitle": "检查和扫描翻译",

    // === 模式 ===
    "simpleMode": "简单检查",
    "simpleDesc": "检查已知键列表",
    "scannerMode": "代码扫描器",
    "scannerDesc": "自动搜索所有键",
    "validatorMode": "路径验证",

    // === 扫描器 ===
    "startScan": "启动扫描器",
    "scanning": "扫描中...",
    "scanComplete": "扫描完成！",
    "scanFailed": "扫描失败",
    "scanError": "扫描错误",
    "scanHint": "扫描器将找到代码中的所有键并与翻译进行比较",
    "keysInCode": "代码中的键",

    // === 验证器 ===
    "validating": "验证中...",
    "startValidation": "验证路径",
    "validateHint": "查找嵌套不正确的键",
    "validationComplete": "路径验证完成！",

    // === 统计 ===
    "totalKeys": "总计",
    "coverage": "覆盖率",
    "usedInCode": "已使用",
    "missingKeys": "缺失",
    "unusedKeys": "未使用",
    "duplicates": "重复项",
    "wrongPaths": "错误路径",
    "flatKeys": "扁平键",

    // === 筛选和搜索 ===
    "searchKey": "按关键字搜索...",
    "allFiles": "所有文件",
    "allCategories": "所有类别",
    "all": "全部",
    "statusFound": "✅ 已找到",
    "statusMissing": "❌ 缺失",
    "search": "搜索...",
    "refresh": "刷新",
    "exportMissing": "导出",

    // === 表格 ===
    "colKey": "键",
    "colCategory": "类别",
    "colPriority": "优先级",
    "colTranslation": "翻译",
    "colStatus": "状态",
    "key": "键",
    "priority": "优先级",
    "translation": "翻译",
    "files": "文件",
    "paths": "路径",
    "wrongPath": "错误路径",
    "correctPath": "正确路径",
    "usedIn": "使用于",

    // === 优先级 ===
    "priorityCritical": "关键",
    "priorityNormal": "普通",
    "priorityLow": "低",

    // === 状态 ===
    "ok": "正常",
    "miss": "缺失",
    "notTranslated": "未翻译",

    // === 部分 ===
    "missingIn": "缺失于",
    "unusedIn": "未使用于",
    "duplicatesFound": "发现重复项",
    "wrongPathsFound": "发现错误路径",
    "flatKeysFound": "发现扁平键",

    // === 复制 ===
    "copy": "复制",
    "copyFilteredKeys": "已筛选的键",
    "copyAllKeys": "所有键",
    "copyFilteredTemplate": "翻译模板（已筛选）",
    "copyAllTemplate": "翻译模板（全部）",
    "copiedCount": "已复制",
    "copyFailed": "复制失败",

    // === 简单模式 === 🔥 新增
    "total": "总计",
    "found": "已找到",
    "missing": "缺失",
    "showing": "显示",
    "from": "/",
    "entries": "条记录",

    // === 消息 ===
    "noMissing": "所有键都存在！",
    "exported": "已导出！",
    "copied": "键已复制！",
    "noIssues": "没有翻译问题！",
    "noPathIssues": "没有路径问题！",
    "clickToScan": "点击「启动扫描器」分析翻译",
    "clickToValidate": "点击「验证路径」分析结构",

    "language": "语言",
    "category": "类别",
    "status": "状态",
    "foundKeys": "已找到键",
    "byCategory": "按类别",
    "detailedResults": "详细结果",

     // === 页面样式设置 ===
    "settings": {
      // === 通用 ===
      "title": "I18nChecker 模块设置",
      "open": "设置",
      "cancel": "取消",
      "reset": "重置",
      "save": "保存",
      "success": "成功",
      "error": "错误",
      "saved": "设置已保存",
      "resetDone": "设置已重置",
      "saveFailed": "保存设置失败",

      // === 元数据（表单设置） ===
      "meta": {
        "toggle": "配置表单显示",
        "layout": "标签页布局",
        "layoutHorizontal": "↔ 水平",
        "layoutVertical": "↕ 垂直",
        "visibleTabs": "可见标签页",
        "tabIcons": "🎨 图标",
        "tabDisplay": "📊 显示",
        "tabBehavior": "⚙️ 行为"
      },

      // === 图标 ===
      "icons": {
        "title": "图标",
        "sourceTitle": "图标来源",
        "iconType": "图标类型",
        "iconTypeTip": "模块图标加载的来源",
        "bootstrapOption": "🅱️ Bootstrap 图标",
        "fenixOption": "🦊 Fenix SVG",
        "customOption": "🎨 自定义",
        "sizeColorTitle": "大小和颜色",
        "iconSize": "图标大小（px）",
        "iconColor": "图标颜色",
        "iconColorTip": "当前值：",
        "displayTitle": "显示",
        "showLabels": "在预览中显示标签",
        "useGradients": "使用渐变",
        "useGradientsTip": "将渐变应用于 SVG 图标（Fenix/自定义）",
        "previewTitle": "图标预览",
        "previewCount": "个图标"
      },

      // === 显示 ===
      "display": {
        "title": "显示",
        "tablesTitle": "表格",
        "tableHeight": "表格高度（px）",
        "fontSize": "字体大小（px）",
        "limitsTitle": "显示限制",
        "maxFilesPerRow": "每行最多文件数",
        "maxFilesPerRowTip": "表格每行显示多少个文件",
        "maxUnusedKeys": "最多未使用键数",
        "maxUnusedKeysTip": "列表中显示多少个未使用键",
        "maxFlatKeys": "最多平铺键数",
        "maxFlatKeysTip": "列表中显示多少个平铺键",
        "appearanceTitle": "外观",
        "compactMode": "紧凑模式",
        "compactModeTip": "减少边距和内边距，使显示更紧凑"
      },

      // === 行为 ===
      "behavior": {
        "title": "行为",
        "autoRunTitle": "自动运行",
        "autoRunScanner": "自动运行扫描器",
        "autoRunScannerTip": "切换到模式时自动启动扫描器",
        "autoRunValidator": "自动运行验证器",
        "autoRunValidatorTip": "切换到模式时自动启动验证器",
        "cacheTitle": "缓存",
        "cacheResults": "缓存结果",
        "cacheTTL": "缓存有效期（秒）",
        "cacheTTLTip": "多少秒后缓存将被视为过期",
        "cacheUsed": "从缓存",
        "cacheFresh": "最新数据",
        "cacheExpired": "缓存已过期",
        "uiTitle": "界面",
        "confirmExport": "导出前确认",
        "highlightSearch": "高亮搜索结果",
        "highlightSearchTip": "在表格中高亮找到的文本",
        "highlightColor": "高亮颜色",
        "highlightColorTip": "颜色自动选择对比文本",
        "highlightPreview": "预览",
        "confirm": "确认"
      }
    }
  },

  // 🌐 I18N VIEW (国际化示例)
  "i18nView": {
    "title": "国际化示例",
    "note": "添加和删除语言请参阅文档",
    "datePlaceholder": "选择日期",
    "selectPlaceholder": "选择",
    "default": "默认",
    "primary": "主要",
    "success": "成功",
    "info": "信息",
    "warning": "警告",
    "danger": "错误",
    "tableName": "名称",
    "tableDate": "日期",
    "tableAddress": "地址",
    "one": "一",
    "two": "二",
    "three": "三"
  },
};
