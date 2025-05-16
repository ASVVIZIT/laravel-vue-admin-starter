import {ElMessage, ElMessageBox} from "element-plus";

export default {
  route: {
    dashboard: 'Админ панель (Dashboard)',
    permission: 'Разрешение (Permission)',
    pagePermission: 'Разрешение для страниц ' +
        '(Page Permission)',
    rolePermission: 'Разрешение для роли ' +
        '(Role Permission)',
    directivePermission: 'Директивы',
    charts: 'Графики',
    keyboardChart: 'Диаграмма (Keyboard Chart)',
    lineChart: 'Линейные Диаграммы (Line Chart)',
    mixChart: 'Mix Chart',
    table: 'Таблица (Table)',
    form: 'Форма',
    errorPages: 'Страницы с ошибками (Error Pages)',
    page401: '401',
    page404: '404',
    administrator: 'Администратор',
    users: 'Пользователи',
    userProfile: 'Профиль пользователя',
    guide: 'Путеводитель по сайту',
  },
  navbar: {
    logOut: 'Выйти из системы',
    dashboard: 'Админ панель (Dashboard)',
    github: 'Github страница',
    theme: 'Theme',
    size: 'Глобальный размер',
    profile: 'Профиль',
    logout: 'Выйти из системы',
    home: 'Домой'
  },
  login: {
    title: 'Войдите в свой личный кабинет',
    logIn: 'Авторизоваться',
    username: 'Имя пользователя',
    password: 'Пароль',
    any: 'any',
    thirdparty: 'Или соединиться с',
    thirdpartyTips: 'Невозможно смоделировать локально, поэтому, пожалуйста, объедините вашу собственную бизнес-симуляцию!!!',
    email: 'Email',
    loginSuccess: 'Успешный вход в систему'
  },
  validateMassages: {
      "validation": {
          "required": "Обязательное поле",
          "minLength": "Минимум {min} символов",
          "email": "Некорректный email",
          "phone": "Неверный формат телефона",
          "match": "Должно совпадать с {field}",
          "specialChars": "Требуется минимум {min} специальных символов"
      },
      "fields": {
          "password": "паролем",
          "phone": "телефоном",
          "email": "электронной почтой"
      },
      rules: {
          role: {
              required: 'Требуется роль',
          },
          name: {
              required: 'Требуется указать имя',
          },
          sex: {
              required: 'Требуется указать ваш пол',
          },
          email: {
              required:'Требуется электронная почта (Email)',
              type:'Введите правильный Email',
          },
          password: {
              required: 'Требуется ввести пароль',
          },
          confirmPassword: {
              required: 'Требуется ввести пароль',
              mismatched: 'Пароль не совпадает!'
          },

      }
  },
  permission: {
    addRole: 'Добавить разрешение для редактирования',
    editPermission: 'Разрешения',
    editPermissionForForm: 'Изменить разрешения для',
    roles: 'Ваши роли',
    switchRoles: 'Поменяйтесь ролями',
    tips: 'В некоторых случаях он не подходит для использования v-role/v-permission, например, элемент Tab component или el-table-column и другие случаи асинхронного рендеринга dom, которые могут быть достигнуты только путем ручной настройки v-if с checkRole или/и checkPermission.',
    delete: 'Удалить',
    confirm: 'Применить',
    cancel: 'Отмена',
    table: {
        edit: {
            user: 'Права доступа к редактированию'
        },
        rolePermissions: {
            name: 'Унаследовано от роли'
        },
        userPermissions: {
            name: {
                menu: 'Дополнительные меню',
                permissions: 'Дополнительные разрешения',
            }
        },
        elMessageBox: {
            confirmButtonText: 'Принять',
            cancelButtonText: 'Отмена',
            warning: 'Предупреждение',
            continue: 'Продолжать?',
            confirm1: {
                message: 'Это приведет к необратимому удалению пользователя',
            },
            confirm2: '',
            confirm3: '',

        },
        elMessage: {
            update: {
                success: {
                    message: 'Обновление разрешений прошло успешно',
                },
            },
            delete: {
                success: {
                    message: 'Удаление завершено',
                },
                canceled: {
                    message: 'Удаление отменено'
                }
            },
            newUser: {
                success: {
                    message: {
                        part1: 'Новый пользователь',
                        part2: 'был успешно создан.',
                    },
                }
            },
            confirmPermission: {
                success: {
                    message: 'Разрешения были успешно обновлены',
                }
            }
        }
    }
  },
  table: {
    description: 'Описание',
    dynamicTips1: 'Фиксированный заголовок, отсортированный по порядку заголовков',
    dynamicTips2: 'Не фиксированный заголовок, отсортированный по порядку кликов',
    dragTips1: 'Порядок по умолчанию',
    dragTips2: 'Порядок после перетаскивания',
    title: 'Название',
    importance: 'Imp',
    type: 'Тип',
    remark: 'Замечание',
    search: 'Поиск',
    add: 'Добавить',
    filterReset: 'Сбросить все фильтры',
    export: 'Экспорт',
    reviewer: 'рецензент',
    id: 'ID',
    date: 'Дата',
    author: 'Автор',
    readings: 'Readings',
    status: 'Статус',
    actions: 'Действия',
    edit: 'Изменить',
    publish: 'Опубликовать',
    draft: 'Взять',
    delete: 'Удалить',
    cancel: 'Отмена',
    confirm: 'Применить',
    form: {
        create: {
            user: 'Создание нового пользователя',
            role: {
                select: {
                    placeholder: 'Пожалуйста, выберите роль'
                }
            }
        }
    },
    roleColumn: {
        label: {
            id: 'ID',
            name: 'Имя',
            email: 'Электронная почта',
            role: 'Роль',
        }
    }
  },
  tagsView: {
    refresh: 'Обновить',
    close: 'Закрыть',
    closeOthers: 'Закрыть другие',
    closeAll: 'Закрыть все',
  },
  settings: {
    title: 'Настройка стиля страницы',
    theme: 'Цвет темы',
    tagsView: 'Открыть Tags-View',
    fixedHeader: 'Фиксированный заголовок (Fixed Header)',
    sidebarLogo: 'Логотип боковой панели (Sidebar Logo)',
  },
  user: {
    avatar: 'Аватар',
    role: 'Роль',
    password: 'Пароль',
    confirmPassword: 'Подтвердить пароль',
    name: 'Имя',
    email: 'Email',
    sex: 'Пол',
    male: 'Мужчина',
    female: 'Женщина',
    age: 'Лет',
    birthday: 'День рождения',
    description: 'Описание',
    timeline: 'Timeline',
    account: 'Аккаунт',
    about_me: 'Обо мне',
    education: 'Образование',
    skills: 'Навыки',
  },
  roles: {
    name: 'Роль',
    description: {
      superadmin: 'Super Administrator. Имеет доступ и полное разрешение на доступ ко всем страницам, и многое другое.',
      admin: 'Administrator. Имеет доступ и полное разрешение на доступ ко всем страницам.',
      manager: 'Manager. Имеет доступ и разрешения на большинство страниц, за исключением страницы разрешений.',
      editor: 'Editor. Имеет доступ к большинству страниц, полное разрешение на доступ к статьям и связанным с ними ресурсам.',
      user: 'Normal user. Имеет доступ к некоторым страницам.',
      visitor: 'Visitor. Имеет доступ к статическим страницам, не иметь никаких разрешений на запись.',
    },
  },
  switchLang: {
    localName: 'Успешный переход на другой язык',
  },
  form: {
    button: {
        save: 'Сохранить',
        cancel: 'Отмена',
    }
  }
};
