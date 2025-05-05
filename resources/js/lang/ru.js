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
  permission: {
    addRole: 'Добавить разрешение для редактирования',
    editPermission: 'Редактировать разрешения',
    roles: 'Ваши роли',
    switchRoles: 'Поменяйтесь ролями',
    tips: 'In some cases it is not suitable to use v-role/v-permission, such as element Tab component or el-table-column and other asynchronous rendering dom cases which can only be achieved by manually setting the v-if with checkRole or/and checkPermission.',
    delete: 'Удалить',
    confirm: 'Применить',
    cancel: 'Отмена',
    table: {
        edit: {
            user: 'Edit Permissions'
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
    export: 'Экспорт',
    reviewer: 'рецензент',
    id: 'Номер - ID',
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
            user: 'Create new user'
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
    skills: 'Навыки'
  },
  roles: {
    name: 'Name',
    description: {
      admin: 'Super Administrator. Иметь доступ и полное разрешение на доступ ко всем страницам.',
      manager: 'Manager. Иметь доступ и разрешения на большинство страниц, за исключением страницы разрешений.',
      editor: 'Editor. Иметь доступ к большинству страниц, полное разрешение на доступ к статьям и связанным с ними ресурсам.',
      user: 'Normal user. Иметь доступ к некоторым страницам.',
      visitor: 'Visitor. Иметь доступ к статическим страницам, не иметь никаких разрешений на запись.',
    },
  },
  switchLang: {
    localName: 'Успешный переход на другой язык',
  },
  form: {
    button: {
        save: 'Сохранить',
    }
  }
};
