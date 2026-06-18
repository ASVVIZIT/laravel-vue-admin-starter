export default {
    "route": {
        "Dashboard": "Главная панель управления",
        "Permission": "Разрешение (Permission)",
        "PagePermission": "Разрешение для страниц (Page Permission)",
        "RolePermission": "Разрешение для роли (Role Permission)",
        "DirectivePermission": "Директивы",
        "Charts": "Графики",
        "KeyboardChart": "Диаграмма (Keyboard Chart)",
        "LineChart": "Линейные Диаграммы (Line Chart)",
        "MixChart": "Mix Chart",
        "Table": "Таблица (Table)",
        "Form": "Форма",
        "ErrorPages": "Страницы с ошибками (Error Pages)",
        "Page401": "401",
        "Page404": "404",
        "Administrator": "Администратор",
        "UserList": "Пользователи",
        "UserProfile": "Профиль пользователя",
        "DynamicTable": "Динамическая таблица",
        "Guide": "Путеводитель по сайту",
        "Entity": "Справочники и компоненты",
        "Brands": "Бренды",
        "DeviceType": "Типы устройства",
        "MeasurementUnit": "Единицы измерений",
        "Accessories": "Аксессуар Электрики",
        "AccessoriesList": "Список аксессуаров",
        "AccessoryCreate": "Создание аксессуара электрики",
        "AccessoryEdit": "Редактирование аксессуара электрики"
    },
    "navbar": {
        "logOut": "Выйти из системы",
        "dashboard": "Админ панель (Dashboard)",
        "github": "Github страница",
        "theme": "Theme",
        "size": "Глобальный размер",
        "profile": "Профиль",
        "logout": "Выйти из системы",
        "home": "Домой"
    },
    "auth": {
        "forgotPasswordTitle": "Забыли пароль?",
        "forgotPasswordSubtitle": "Введите email и мы отправим ссылку для сброса",
        "sendResetLink": "Отправить ссылку",
        "emailSent": "Письмо отправлено!",
        "checkEmail": "Проверьте почту {email} для получения ссылки",
        "resetLinkSent": "Ссылка для сброса отправлена на вашу почту",
        "resetFailed": "Не удалось отправить ссылку",
        "backToLogin": "Вернуться к входу",

        "resetPasswordTitle": "Сброс пароля",
        "resetPasswordSubtitle": "Введите новый пароль",
        "resetPassword": "Сбросить пароль",
        "passwordResetSuccess": "Пароль успешно сброшен",
        "invalidResetLink": "Неверная или истёкшая ссылка",

        "registerTitle": "Создать аккаунт",
        "registerSubtitle": "Заполните форму для создания аккаунта",
        "register": "Зарегистрироваться",
        "registerSuccess": "Регистрация успешна! Проверьте вашу почту",
        "registerFailed": "Ошибка регистрации",
        "alreadyHaveAccount": "Уже есть аккаунт? Войти",
        "agreeTerms": "Я согласен с условиями использования",
        "mustAgreeTerms": "Пожалуйста, примите условия",

        "emailVerificationTitle": "Подтверждение Email",
        "emailVerificationSubtitle": "Мы отправили ссылку для подтверждения на вашу почту",
        "emailVerified": "Ваш email подтверждён!",
        "checkYourEmail": "Проверьте вашу почту:",
        "goToLogin": "Перейти к входу",
        "verificationResent": "Письмо отправлено повторно",
        "resendFailed": "Не удалось отправить письмо",
        "resendVerification": "Отправить письмо повторно",
        "resendCooldown": "Повтор через {seconds}с",
        "sending": "Отправка...",
        "verifying": "Проверяем...",
        "invalidVerificationLink": "Неверная ссылка подтверждения",
        "verificationFailed": "Ошибка подтверждения"
    },
    "login": {
        "title": "Вход в личный кабинет",
        "adminTitle": "Вход для администратора",
        "testerTitle": "Тестовый вход",
        "moderatorTitle": "Вход для модератора",
        "vipTitle": "VIP вход",

        "email": "Email",
        "username": "Имя пользователя",
        "password": "Пароль",
        "confirmPassword": "Подтвердите пароль",
        "any": "любой",

        "logIn": "Войти",
        "loginAsTester": "Войти как тестер",
        "selectRole": "Выберите роль",

        "forgotPassword": "Забыли пароль?",
        "register": "Регистрация",
        "rememberMe": "Запомнить меня",
        "twoFactorCode": "Код 2FA",
        "captcha": "Введите код с картинки",
        "vipCode": "VIP код",

        "thirdparty": "Или войдите через",
        "thirdpartyTips": "Невозможно эмулировать локально, интегрируйте свой бизнес-процесс!!!",

        "loginSuccess": "Успешный вход",
        "loginFailed": "Ошибка входа"
    },
    "validation": {
        "general": {
            "notNameAdmin": "Нельзя использовать это имя",
            "required": "Обязательное поле",
            "minLength": "Минимум {min} символа",
            "email": "Некорректный email",
            "phone": "Неверный формат телефона",
            "match": "Должно совпадать с {field}",
            "specialChars": "Требуется минимум {min} специальных символов",
            "notMatch": "Пароль не должен совпадать с {field}",
            "passwordNotEmail": "Пароль не должен совпадать с email",
            "passwordNotName": "Пароль не должен совпадать с именем",
            "matchPassword": "Пароли должны совпадать"
        },
        "fields": {
            "password": "паролем",
            "phone": "телефоном",
            "email": "электронной почтой",
            "name": "именем"
        },
        "rules": {
            "role": {
                "required": "Требуется роль"
            },
            "name": {
                "required": "Требуется указать имя"
            },
            "sex": {
                "required": "Требуется указать ваш пол"
            },
            "email": {
                "required": "Требуется электронная почта (Email)",
                "type": "Введите правильный Email"
            },
            "password": {
                "placeholder": "Введите пароль",
                "required": "Требуется ввести пароль",
                "minLength": "Пароль не может содержать менее 6 цифр"
            },
            "confirmPassword": {
                "required": "Требуется подтвердить пароль",
                "mismatched": "Пароль не совпадает!"
            },
            "twoFactor": {
                "required": "Требуется код двухфакторной аутентификации",
                "pattern": "Код должен состоять из 6 цифр",
                "placeholder": "Введите 6-значный код"
            },
            "captcha": {
                "required": "Требуется ввести код с картинки",
                "invalid": "Неверный код с картинки"
            },
            "phone": {
                "required": "Требуется указать телефон",
                "pattern": "Неверный формат телефона"
            },
            "vipCode": {
                "required": "Требуется VIP код",
                "pattern": "VIP код должен быть в формате VIP-XXXXXXXX"
            },
            "accessory": {
                "fields": {
                    "name": { "required": "Название обязательно" },
                    "model": { "required": "Модель обязательна" },
                    "type_id": { "required": "Выберите тип устройства" },
                    "brand_id": { "required": "Выберите бренд" }
                }
            }
        }
    },
    "permission": {
        "actions": {
            "addRole": "Добавить разрешение для редактирования",
            "editPermission": "Разрешения",
            "delete": "Удалить",
            "confirm": "Применить",
            "cancel": "Отмена"
        },
        "messages": {
            "editPermissionForForm": "Изменить разрешения для",
            "switchRoles": "Поменяйтесь ролями",
            "tips": "В некоторых случаях он не подходит для использования v-role/v-permission, например, элемент Tab component или el-table-column и другие случаи асинхронного рендеринга dom, которые могут быть достигнуты только путем ручной настройки v-if с checkRole или/и checkPermission."
        },
        "errors": {
            "cantEditAdmin": "Невозможно изменить разрешения для пользователей с правами администратора"
        },
        "table": {
            "edit": {
                "user": "Права доступа к редактированию"
            },
            "rolePermissions": {
                "name": "Унаследовано от роли"
            },
            "userPermissions": {
                "name": {
                    "menu": "Дополнительные меню",
                    "permissions": "Дополнительные разрешения"
                }
            },
            "elMessageBox": {
                "confirmButtonText": "Принять",
                "cancelButtonText": "Отмена",
                "warning": "Предупреждение",
                "continue": "Продолжать?",
                "confirm1": {
                    "message": "Это приведет к необратимому удалению пользователя."
                }
            },
            "elMessage": {
                "update": {
                    "success": { "message": "Обновление разрешений прошло успешно." },
                    "error": { "message": "При обновлении разрешений произошла ошибка." }
                },
                "delete": {
                    "success": { "message": "Удаление завершено." },
                    "canceled": { "message": "Удаление отменено." }
                },
                "newUser": {
                    "success": {
                        "message": {
                            "part1": "Новый пользователь",
                            "part2": "был успешно создан."
                        }
                    }
                },
                "confirmPermission": {
                    "success": { "message": "Разрешения были успешно обновлены." }
                }
            }
        }
    },
    "table": {
        "general": {
            "description": "Описание",
            "dynamicTips1": "Фиксированный заголовок, отсортированный по порядку заголовков",
            "dynamicTips2": "Не фиксированный заголовок, отсортированный по порядку кликов",
            "dragTips1": "Порядок по умолчанию",
            "dragTips2": "Порядок после перетаскивания",
            "title": "Название",
            "importance": "Imp",
            "type": "Тип",
            "remark": "Замечание",
            "search": "Поиск",
            "add": "Добавить",
            "filterReset": "Сброс фильтры",
            "export": "Экспорт",
            "reviewer": "рецензент",
            "id": "ID",
            "date": "Дата",
            "author": "Автор",
            "readings": "Readings",
            "status": "Статус",
            "actions": "Действия",
            "buttons": {
                "actions": "Список действий"
            },
            "edit": "Изменить",
            "publish": "Опубликовать",
            "draft": "Взять",
            "delete": "Удалить",
            "cancel": "Отмена",
            "confirm": "Применить"
        },
        "user": {
            "form": {
                "title": {
                    "create": "Создание нового пользователя",
                    "edit": "Изменение пользователя"
                },
                "about_me": "Обо мне",
                "education": "Образование",
                "skills": "Навыки",
                "tabs": {
                    "timeline": "Timeline",
                    "account": "Аккаунт"
                },
                "fields": {
                    "role": { "title": "Роль", "placeholder": "Пожалуйста, выберите роль" },
                    "name": { "title": "Имя", "placeholder": "Ваше имя" },
                    "email": { "title": "Email", "placeholder": "Ваша почта" },
                    "password": { "title": "Пароль", "placeholder": "Введите пароль" },
                    "confirmPassword": { "title": "Подтвердить пароль", "placeholder": "Не должен совпадать с именем и почтой)" },
                    "sex": { "title": "Пол", "placeholder": "" },
                    "male": { "title": "Мужчина", "placeholder": "" },
                    "female": { "title": "Женщина", "placeholder": "" },
                    "age": { "title": "Лет", "placeholder": "Дата рождения не указана" },
                    "birthday": { "title": "День рождения", "placeholder": "Выберите дату рождения" },
                    "description": { "title": "Описание", "placeholder": "Напишите о себе..." }
                }
            },
            "columns": {
                "id": "ID",
                "name": "Имя",
                "email": "Электронная почта",
                "role": "Роль"
            },
            "elMessageBox": {
                "deleteTitle": "Удаление пользователя!",
                "confirmButtonText": "Принять",
                "cancelButtonText": "Отмена",
                "warning": "Предупреждение",
                "continue": "Продолжать?",
                "confirm1": {
                    "message@j": "Это приведет к необратимому удалению пользователя<br><strong>{name}</strong>"
                }
            },
            "elMessage": {
                "created": {
                    "success": { "message": "Пользователь создан" },
                    "error": { "message": "Ошибка создания пользователя" }
                },
                "delete": {
                    "success": { "message": "Пользователь успешно удалён" },
                    "error": { "message": "Ошибка удаления пользователя" },
                    "canceled": { "message": "Удаление отменено" }
                },
                "newUser": {
                    "success": {
                        "message": {
                            "part1": "Новый пользователь",
                            "part2": "был успешно создан."
                        }
                    }
                }
            }
        }
    },
    "tagsView": {
        "refresh": "Обновить",
        "close": "Закрыть",
        "closeOthers": "Закрыть другие",
        "closeAll": "Закрыть все"
    },
    "settings": {
        "title": "Настройка стиля страницы",
        "theme": "Цвет темы",
        "tagsView": "Открыть Tags-View",
        "fixedHeader": "Фиксированный заголовок (Fixed Header)",
        "sidebarLogo": "Логотип боковой панели (Sidebar Logo)"
    },
    "user": {
        "profile": {
            "notfound": "Пользователь не найдет",
            "avatar": "Аватар",
            "about_me": "Обо мне",
            "education": "Образование",
            "skills": "Навыки",
            "tabs": {
                "timeline": "Timeline",
                "account": "Аккаунт"
            },
            "elMessage": {
                "update": {
                    "success": { "message": "Информация о пользователе была успешно обновлена" }
                }
            },
            "fields": {
                "role": { "title": "Роль", "placeholder": "Пожалуйста, выберите роль" },
                "name": { "title": "Имя", "placeholder": "Ваше имя" },
                "email": { "title": "Email", "placeholder": "Ваша почта" },
                "password": { "title": "Пароль", "placeholder": "Введите пароль" },
                "confirmPassword": { "title": "Подтвердить пароль", "placeholder": "Не должен совпадать с именем и почтой)" },
                "sex": { "title": "Пол", "placeholder": "" },
                "male": { "title": "Мужчина", "placeholder": "" },
                "female": { "title": "Женщина", "placeholder": "" },
                "age": { "title": "Лет", "placeholder": "Дата рождения не указана" },
                "birthday": { "title": "День рождения", "placeholder": "Выберите дату рождения" },
                "description": { "title": "Описание", "placeholder": "Напишите о себе..." }
            }
        }
    },
    "roles": {
        "admin": "Администратор",
        "user": "Пользователь",
        "moderator": "Модератор",
        "name": "Роль",
        "description": {
            "superadmin": "Super Administrator. Имеет доступ и полное разрешение на доступ ко всем страницам, и многое другое.",
            "admin": "Administrator. Имеет доступ и полное разрешение на доступ ко всем страницам.",
            "manager": "Manager. Имеет доступ и разрешения на большинство страниц, за исключением страницы разрешений.",
            "editor": "Editor. Имеет доступ к большинству страниц, полное разрешение на доступ к статьям и связанным с ними ресурсам.",
            "user": "Normal user. Имеет доступ к некоторым страницам.",
            "visitor": "Visitor. Имеет доступ к статическим страницам, не иметь никаких разрешений на запись.",
            "moderator": "Moderator. Может модерировать контент и управлять пользователями.",
            "vip": "VIP. Привилегированный пользователь с расширенными возможностями."
        }
    },
    "switchLang": {
        "localName": "Успешный переход на другой язык"
    },
    "form": {
        "button": {
            "save": "Сохранить",
            "cancel": "Отмена"
        }
    },
    "accessory": {
        "form_title_edit": "Редактирование аксессуара",
        "form_title_create": "Создание аксессуара",
        "tabs": {
            "main": {
                "title": "Основная информация",
                "group": {
                    "critical": "Критически важные поля",
                    "basicTech": "Основные технические данные"
                }
            },
            "technical": {
                "title": "Технические характеристики",
                "group": {
                    "electrical": "Электрические параметры",
                    "construction": "Конструктивные характеристики"
                }
            },
            "operational": {
                "title": "Эксплуатационные параметры",
                "group": { "safety": "Безопасность и условия эксплуатации" }
            },
            "additional": {
                "title": "Дополнительное оборудование",
                "group": { "compatibility": "Совместимость и управление" }
            }
        },
        "table": {
            "title": "Список аксессуаров",
            "add_button": "Добавить аксессуар",
            "search_placeholder": "Поиск по модели, названию или бренду...",
            "empty_text": "Нет данных",
            "total_items": "Всего записей:",
            "actions": "Действия",
            "columns": {
                "id": "ID",
                "name": "Название",
                "model": "Модель",
                "brand": "Бренд",
                "type": "Тип",
                "compatible_models": "Совместимые модели",
                "cross_section": "Сечение кабеля",
                "current_rating": "Ном. ток",
                "thickness": "Толщина",
                "quantity_per_pack": "Кол-во в упаковке",
                "rated_diff_current": "Диф. ток",
                "voltage": "Напряжение",
                "communication_protocol": "Протокол связи",
                "remote_control": "ДУ",
                "ip_rating": "IP класс",
                "mounting_type": "Тип монтажа",
                "standards": "Стандарты",
                "material": "Материал",
                "edit": "Редактировать",
                "delete": "Удалить"
            }
        },
        "messages": {
            "delete_confirm": "Вы уверены, что хотите удалить аксессуар? Это действие нельзя отменить.",
            "delete_confirm_title": "Подтверждение удаления",
            "delete_success": "Аксессуар успешно удален",
            "delete_error": "Ошибка при удалении аксессуара: {error}"
        },
        "placeholders": {
            "name": "Пример: Модуль дистанционного управления",
            "model": "Пример: ARA iC60",
            "description": "Пример: Подробное описание аксессуара",
            "series": "Пример: Acti9",
            "voltage": "Пример: 230/400",
            "ip_rating": "Пример: IP40",
            "mounting_type": "Пример: Модульный",
            "standards": "Пример: IEC 60947",
            "material": "Пример: Термопласт",
            "compatible_models": "Пример: iC60, NG125",
            "communication_protocol": "Пример: Ti24"
        },
        "fields": {
            "model": "Модель",
            "name": "Название",
            "description": "Описание",
            "brand_id": "Бренд",
            "type_id": "Тип устройства",
            "series": "Серия",
            "cross_section": "Сечение кабеля",
            "cross_section_unit_id": "Единица сечения кабеля",
            "current_rating": "Ном. ток",
            "current_rating_unit_id": "Единица ном. тока",
            "thickness": "Толщина",
            "thickness_unit_id": "Единица толщины",
            "compatible_models": "Совместимые модели",
            "communication_protocol": "Протокол связи",
            "remote_control": "Поддержка дистанционного управления",
            "voltage": "Напряжение",
            "voltage_unit_id": "Единица напряжения",
            "ip_rating": "Класс защиты IP",
            "mounting_type": "Тип монтажа",
            "standards": "Стандарты",
            "material": "Материал",
            "nominal_current": "Номинальный ток",
            "trip_curve": "Характеристика срабатывания",
            "breaking_capacity": "Отключающая способность",
            "breaking_capacity_unit_id": "Единица отключающей способности",
            "tripping_time": "Время срабатывания",
            "tripping_time_unit_id": "Единица времени срабатывания",
            "temperature_range_min": "Температурный диапазон min",
            "temperature_range_max": "Температурный диапазон max",
            "temperature_range_min_unit_id": "Единица температуры min",
            "temperature_range_max_unit_id": "Единица температуры max",
            "quantity_per_pack": "Количество в упаковке",
            "quantity_per_pack_unit_id": "Единица количества в упаковке",
            "rated_diff_current": "Дифференциальный ток",
            "rated_diff_current_unit_id": "Единица дифференциального тока"
        },
        "remote_control_status": {
            "true": "есть",
            "false": "нет"
        },
        "buttons": {
            "table": "К таблице",
            "save": "Сохранить аксессуар",
            "create": "Создать аксессуар",
            "back": "Назад",
            "cancel": "Отмена"
        }
    },
    "brand": {
        "table": {
            "title": "Список брендов",
            "add_button": "Добавить бренд",
            "search_placeholder": "Поиск по названию, стране или сайту...",
            "empty_text": "Нет данных",
            "total_items": "Всего записей:",
            "actions": "Действия",
            "per_page_selector": "Записей на странице:",
            "columns": {
                "id": "ID",
                "name": "Название",
                "country": "Страна",
                "website": "Веб-сайт"
            },
            "item_actions": {
                "edit": "Редактировать",
                "delete": "Удалить"
            }
        },
        "form": {
            "add_title": "Добавить бренд",
            "edit_title": "Редактирование: {name}",
            "fields": {
                "name": { "label": "Название бренда", "placeholder": "Например: Schneider Electric" },
                "country": { "label": "Страна производитель", "placeholder": "Например: Франция" },
                "website": { "label": "Веб-сайт", "placeholder": "https://example.com" },
                "description": { "label": "Описание", "placeholder": "Краткое описание бренда" }
            },
            "rules": {
                "name_required": "Название обязательно",
                "website_required": "Сайт обязателен",
                "website_url": "Введите корректный URL"
            },
            "buttons": {
                "cancel": "Отмена",
                "add": "Добавить",
                "save": "Сохранить"
            }
        },
        "messages": {
            "delete_confirm": "Вы уверены, что хотите удалить бренд? Это действие нельзя отменить.",
            "delete_confirm_title": "Подтверждение удаления",
            "delete_success": "Бренд успешно удален",
            "add_success": "Бренд успешно добавлен",
            "update_success": "Изменения сохранены",
            "error": "Ошибка: {error}"
        }
    },
    "deviceType": {
        "table": {
            "title": "Список типов устройств",
            "add_button": "Добавить тип",
            "search_placeholder": "Поиск по названию, коду или описанию...",
            "empty_text": "Нет данных",
            "total_items": "Всего записей:",
            "per_page_selector": "Записей на странице:",
            "actions": "Действия",
            "columns": {
                "id": "ID",
                "name": "Название",
                "code": "Код",
                "description": "Описание"
            },
            "item_actions": {
                "edit": "Редактировать",
                "delete": "Удалить"
            }
        },
        "form": {
            "add_title": "Добавить тип устройства",
            "edit_title": "Редактирование: {name}",
            "fields": {
                "name": { "label": "Название типа", "placeholder": "Например: Автоматический выключатель" },
                "code": { "label": "Код типа", "placeholder": "Например: CB" },
                "description": { "label": "Описание", "placeholder": "Краткое описание типа устройства" }
            },
            "rules": {
                "name_required": "Название обязательно",
                "code_required": "Код обязателен"
            },
            "buttons": {
                "cancel": "Отмена",
                "add": "Добавить",
                "save": "Сохранить"
            }
        },
        "messages": {
            "delete_confirm": "Вы уверены, что хотите удалить тип устройства? Это действие нельзя отменить.",
            "delete_confirm_title": "Подтверждение удаления",
            "delete_success": "Тип устройства успешно удален",
            "add_success": "Тип устройства успешно добавлен",
            "update_success": "Изменения сохранены",
            "error": "Ошибка: {error}"
        }
    },
    "measurementUnit": {
        "table": {
            "title": "Список единиц измерений",
            "add_button": "Добавить единицу",
            "search_placeholder": "Поиск по названию, символу, величине или категории...",
            "empty_text": "Нет данных",
            "total_items": "Всего записей:",
            "per_page_selector": "Записей на странице:",
            "actions": "Действия",
            "columns": {
                "id": "ID",
                "name": "Название",
                "display_symbol": "Символ",
                "physical_quantity": "Физическая величина",
                "category": "Категория"
            },
            "item_actions": {
                "edit": "Редактировать",
                "delete": "Удалить"
            }
        },
        "form": {
            "add_title": "Добавить единицу измерения",
            "edit_title": "Редактирование: {name}",
            "fields": {
                "name": { "label": "Название", "placeholder": "Например: Ампер" },
                "symbol": { "label": "Символ (хранится)", "placeholder": "Например: a (в нижнем регистре)" },
                "display_symbol": { "label": "Отображаемый символ", "placeholder": "Например: A" },
                "physical_quantity": { "label": "Физическая величина", "placeholder": "Например: ток" },
                "measurement_category_id": { "label": "Категория", "placeholder": "Выберите категорию" }
            },
            "rules": {
                "name_required": "Название обязательно",
                "symbol_required": "Символ обязателен",
                "display_symbol_required": "Отображаемый символ обязателен",
                "physical_quantity_required": "Физическая величина обязательна",
                "category_required": "Категория обязательна"
            },
            "buttons": {
                "cancel": "Отмена",
                "add": "Добавить",
                "save": "Сохранить"
            }
        },
        "messages": {
            "delete_confirm": "Вы уверены, что хотите удалить единицу измерения? Это действие нельзя отменить.",
            "delete_confirm_title": "Подтверждение удаления",
            "delete_success": "Единица измерения успешно удалена",
            "add_success": "Единица измерения успешно добавлена",
            "update_success": "Изменения сохранены",
            "error": "Ошибка: {error}"
        }
    },
    "common": {
        "submitting": "Сохранение...",
        "required": "Обязательное поле",
        "view404": {
            "buttons": {
                "back": "Назад",
                "backHome": "Назад Домой"
            },
            "OOPS": "Ууупс!",
            "Message": "Охрана сервиса сказала, что вы не можете зайти на эту страницу...",
            "Info": "Пожалуйста, проверьте правильность введенного вами URL-адреса. Нажмите на кнопку ниже, чтобы вернуться на главную страницу.",
            "CopyrightBy": "Copyright by",
            "ProjectInGithub": "Project in github"
        },
        "view401": {
            "buttons": {
                "back": "Назад",
                "backHome": "Назад Домой"
            },
            "CanGo": "Или ты можешь перейти:",
            "OOPS": "Ууупс!",
            "Permission": "У вас нет разрешения на переход на эту страницу.",
            "MessageAdmin": "Если вы не удовлетворены, пожалуйста, свяжитесь с администратором.",
            "JustLookingAroundHref": "https://www.google.com/",
            "JustLookingAround": "Поиск в интернете",
            "ShowPicture": "Показать заставку",
            "CasualLook": "Доступ запрещён"
        },
        "units": {
            "A": "А",
            "V": "В",
            "mm": "мм",
            "mm²": "мм²",
            "°C": "°C",
            "mA": "мА",
            "kA": "кА",
            "ms": "мс",
            "шт": "шт.",
            "m": "м",
            "N": "Н",
            "Pa": "Па",
            "W": "Вт",
            "Hz": "Гц",
            "kg": "кг",
            "l": "л"
        }
    },
    "error": {
        "loadPermissions": "Ошибка загрузки разрешений"
    },
    "roles_description_admin": "Администратор системы",
    "roles_description_superadmin": "Суперадминистратор"
};
