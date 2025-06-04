export default {
  "route": {
    "dashboard": "仪表盘",
    "permission": "权限管理",
    "pagePermission": "页面权限",
    "rolePermission": "角色权限",
    "directivePermission": "指令权限",
    "charts": "图表",
    "keyboardChart": "键盘图表",
    "lineChart": "折线图",
    "mixChart": "混合图表",
    "table": "表格",
    "form": "表单",
    "errorPages": "错误页面",
    "page401": "401",
    "page404": "404",
    "administrator": "管理员",
    "UserList": "用户列表",
    "userProfile": "用户资料",
    "guide": "网站指南",
    "entity": "参考数据和组件",
    "brands": "品牌",
    "DeviceType": "设备类型",
    "MeasurementUnit": "计量单位",
    "Accessories": "电气配件",
    "AccessoriesList": "配件清单",
    "AccessoryCreate": "创建电气配件",
    "AccessoryEdit": "编辑电气配件"
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
  "login": {
    "title": "系统登录",
    "logIn": "登录",
    "username": "用户名",
    "password": "密码",
    "any": "任意",
    "thirdparty": "第三方登录",
    "thirdpartyTips": "本地无法模拟，请根据业务需求实现！",
    "email": "邮箱",
    "loginSuccess": "登录成功"
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
      "role": {
        "required": "需要角色"
      },
      "name": {
        "required": "需要名称"
      },
      "sex": {
        "required": "需要性别"
      },
      "email": {
        "required": "需要邮箱",
        "type": "请输入有效的邮箱"
      },
      "password": {
        "placeholder": "输入密码",
        "required": "需要密码",
        "minLength": "密码不能包含少于6位数字。"
      },
      "confirmPassword": {
        "required": "确认密码",
        "mismatched": "密码不匹配！"
      },
      "accessory": {
        "fields": {
          "name": {
            "required": "名称必填"
          },
          "model": {
            "required": "型号必填"
          },
          "type_id": {
            "required": "请选择设备类型"
          },
          "brand_id": {
            "required": "请选择品牌"
          }
        }
      }
    }
  },
  "permission": {
    "actions": {
      "addRole": "添加角色权限",
      "editPermission": "编辑权限",
      "delete": "删除",
      "confirm": "确认",
      "cancel": "取消"
    },
    "messages": {
      "editPermissionForForm": "编辑权限为",
      "switchRoles": "切换角色",
      "tips": "某些情况下不适合使用v-role/v-permission（例如Element Tab组件或el-table-column），请手动使用v-if和checkRole/checkPermission。"
    },
    "table": {
      "edit": {
        "user": "编辑访问权限"
      },
      "rolePermissions": {
        "name": "继承自角色"
      },
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
        "confirm1": {
          "message": "将永久删除该用户"
        }
      },
      "elMessage": {
        "update": {
          "success": {
            "message": "权限更新成功"
          }
        },
        "delete": {
          "success": {
            "message": "删除完成"
          },
          "canceled": {
            "message": "删除已取消"
          }
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
          "success": {
            "message": "权限更新成功"
          }
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
          "role": {
            "title": "角色",
            "placeholder": "选择角色"
          },
          "name": {
            "title": "名称",
            "placeholder": "您的名字"
          },
          "email": {
            "title": "邮箱",
            "placeholder": "您的邮箱"
          },
          "password": {
            "title": "密码",
            "placeholder": "输入密码"
          },
          "confirmPassword": {
            "title": "确认密码",
            "placeholder": "不能与名称或邮箱相同"
          },
          "sex": {
            "title": "性别",
            "placeholder": ""
          },
          "male": {
            "title": "男",
            "placeholder": ""
          },
          "female": {
            "title": "女",
            "placeholder": ""
          },
          "age": {
            "title": "年龄",
            "placeholder": "未指定出生日期"
          },
          "birthday": {
            "title": "生日",
            "placeholder": "选择出生日期"
          },
          "description": {
            "title": "描述",
            "placeholder": "写下关于您自己..."
          }
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
        "confirm1": {
          "message": "这将永久删除用户。<br><strong>{name}</strong>"
        }
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
          "success": {
            "message": "用户已成功删除"
          },
          "error": {
            "message": "用户删除错误"
          },
          "canceled": {
            "message": "删除已取消"
          }
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
      "tabs": {
        "timeline": "时间线",
        "account": "账户"
      },
      "elMessage": {
        "update": {
          "success": {
            "message": "用户的信息已成功更新"
          }
        }
      },
      "fields": {
        "role": {
          "title": "角色",
          "placeholder": "选择角色"
        },
        "name": {
          "title": "名称",
          "placeholder": "您的名字"
        },
        "email": {
          "title": "邮箱",
          "placeholder": "您的邮箱"
        },
        "password": {
          "title": "密码",
          "placeholder": "输入密码"
        },
        "confirmPassword": {
          "title": "确认密码",
          "placeholder": "不能与名称或邮箱相同"
        },
        "sex": {
          "title": "性别",
          "placeholder": ""
        },
        "male": {
          "title": "男",
          "placeholder": ""
        },
        "female": {
          "title": "女",
          "placeholder": ""
        },
        "age": {
          "title": "年龄",
          "placeholder": "未指定出生日期"
        },
        "birthday": {
          "title": "生日",
          "placeholder": "选择出生日期"
        },
        "description": {
          "title": "描述",
          "placeholder": "写下关于您自己..."
        }
      }
    }
  },
  "roles": {
    "name": "角色",
    "description": {
      "superadmin": "超级管理员：拥有所有页面和功能的完全访问权限。",
      "admin": "管理员：拥有所有页面的完全访问权限。",
      "manager": "经理：除权限页面外的大部分页面访问权限。",
      "editor": "编辑：可访问文章和相关资源。",
      "user": "用户：仅限访问特定页面。",
      "visitor": "访客：仅限访问静态页面。"
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
        "group": {
          "safety": "安全和操作条件"
        }
      },
      "additional": {
        "title": "附加设备",
        "group": {
          "compatibility": "兼容性和控制"
        }
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
      "yes": "有",
      "no": "无"
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
        "name": {
          "label": "品牌名称",
          "placeholder": "例如: 施耐德电气"
        },
        "country": {
          "label": "生产国家",
          "placeholder": "例如: 法国"
        },
        "website": {
          "label": "网站",
          "placeholder": "https://example.com"
        },
        "description": {
          "label": "描述",
          "placeholder": "品牌简要描述"
        }
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
        "name": {
          "label": "类型名称",
          "placeholder": "例如: 断路器"
        },
        "code": {
          "label": "类型代码",
          "placeholder": "例如: CB"
        },
        "description": {
          "label": "描述",
          "placeholder": "设备类型简要描述"
        }
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
        "name": {
          "label": "名称",
          "placeholder": "例如: 安培"
        },
        "symbol": {
          "label": "符号（存储）",
          "placeholder": "例如: a (小写)"
        },
        "display_symbol": {
          "label": "显示符号",
          "placeholder": "例如: A"
        },
        "physical_quantity": {
          "label": "物理量",
          "placeholder": "例如: 电流"
        },
        "measurement_category_id": {
          "label": "类别",
          "placeholder": "选择类别"
        }
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
    "submitting": "保存中...",
    "required": "必填字段",
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
  }
};
