<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => ':attribute должен быть принят.',
    'active_url' => ':attribute не является действительным URL.',
    'after' => ':attribute должен быть датой после :date.',
    'after_or_equal' => ':attribute должен быть датой после или равным :date.',
    'alpha' => ':attribute может содержать только буквы.',
    'alpha_dash' => ':attribute может содержать только буквы, числа, тире и подчеркивание.',
    'alpha_num' => ':attribute может содержать только буквы и цифры.',
    'array' => ':attribute должен быть массивом.',
    'before' => ':attribute должен быть датой до :date.',
    'before_or_equal' => ':attribute должен быть датой до или равным :date.',
    'between' => [
        'array' => ':attribute должен иметь между :min и :max элементы.',
        'file' => ':attribute должен быть между :min и :max килобит.',
        'numeric' => ':attribute должен быть между :min и :max.',
        'string' => ':attribute должен быть между :min и :max символов.',
    ],
    'boolean' => 'Поле :attribute должно быть истинным или ложным.',
    'confirmed' => ':attribute подтверждение не совпадает.',
    'date' => ':attribute не является действительной датой.',
    'date_equals' => ':attribute должен быть датой, равной :date.',
    'date_format' => ':attribute не соответствует формату :format.',
    'different' => ':attribute и :other должно быть разным.',
    'digits' => ':attribute должен быть :digits цифры.',
    'digits_between' => ':attribute должен быть между :min и :max цифр.',
    'dimensions' => ':attribute имеет недопустимые размеры изображения.',
    'distinct' => 'Поле :attribute имеет дубликатное значение.',
    'email' => ':attribute должен быть действительным адресом электронной почты.',
    'ends_with' => ':attribute должен закончиться одним из следующих: :values.',
    'exists' => 'Выбранный :attribute недействителен.',
    'file' => ':attribute должен быть файл.',
    'filled' => 'Поле :attribute должно иметь значение.',
    'gt' => [
        'array' => ':attribute должен иметь больше, чем :value элементы.',
        'file' => ':attribute должен быть больше, чем :value килобиты.',
        'numeric' => ':attribute должен быть больше, чем :value.',
        'string' => ':attribute должен быть больше, чем :value символы.',
    ],
    'gte' => [
        'array' => ':attribute должен иметь :value элементы или более.',
        'file' => ':attribute должен быть больше или равен :value килобит.',
        'numeric' => ':attribute должен быть больше или равным :value.',
        'string' => ':attribute должен быть больше или равных :value символов.',
    ],
    'image' => ':attribute должен быть изображением.',
    'in' => 'Выбранный :attribute недействителен.',
    'in_array' => 'Поле :attribute не существует в :other.',
    'integer' => ':attribute должен быть целым числом.',
    'ip' => ':attribute должен быть действительным IP -адресом.',
    'ipv4' => ':attribute должен быть действительный адрес IPv4.',
    'ipv6' => ':attribute должен быть действительный адрес IPv6.',
    'json' => ':attribute должен быть действительной строкой JSON.',
    'lt' => [
        'array' => ':attribute должен иметь меньше, чем :value элементы.',
        'file' => ':attribute должен быть меньше :value килобит.',
        'numeric' => ':attribute должен быть меньше :value.',
        'string' => ':attribute должен быть меньше :value символов.',
    ],
    'lte' => [
        'array' => ':attribute не должен иметь больше, чем :value элементы.',
        'file' => ':attribute должен быть меньше или равным :value килобит.',
        'numeric' => ':attribute должен быть меньше или равным :value.',
        'string' => ':attribute должен быть меньше или равным :value символов.',
    ],
    'max' => [
        'array' => ':attribute может не иметь больше, чем :max элементы.',
        'file' => ':attribute не может быть больше :max килобит.',
        'numeric' => ':attribute не может быть больше :max.',
        'string' => ':attribute может быть не больше :max символов.',
    ],
    'mimes' => ':attribute должен быть файл типа: :values.',
    'mimetypes' => ':attribute должен быть файл типа: :values.',
    'min' => [
        'array' => ':attribute должен иметь как минимум :min элементы.',
        'file' => ':attribute должен быть как минимум :min килобиты.',
        'numeric' => ':attribute должен быть как минимум :min.',
        'string' => ':attribute должен быть как минимум :min символы.',
    ],
    'not_in' => 'Выбранный :attribute недействителен.',
    'not_regex' => ':attribute формат недействителен.',
    'numeric' => ':attribute должен быть номер.',
    'password' => 'Пароль неверный.',
    'present' => 'Поле :attribute должно присутствовать.',
    'regex' => ':attribute формат недействителен.',
    'required' => 'Поле :attribute требуется.',
    'required_if' => 'Поле :attribute требуется, когда :other IS :value.',
    'required_unless' => 'Поле :attribute требуется, если :other не находится в :values.',
    'required_with' => 'Поле :attribute требуется, когда :values присутствует.',
    'required_with_all' => 'Поле :attribute требуется, когда :values присутствуют.',
    'required_without' => 'Поле :attribute требуется, когда :values нет.',
    'required_without_all' => 'Поле :attribute требуется, когда ни один из :values присутствует.',
    'same' => ':attribute и :other должно соответствовать.',
    'size' => [
        'array' => ':attribute должен содержать :size элементы.',
        'file' => ':attribute должен быть :size килобиты.',
        'numeric' => ':attribute должен быть :size.',
        'string' => ':attribute должен быть :size символы.',
    ],
    'starts_with' => ':attribute должен начинаться с одного из следующих: :values.',
    'string' => ':attribute должен быть строкой.',
    'timezone' => ':attribute должен быть действительной зоной.',
    'unique' => ':attribute уже взят.',
    'uploaded' => ':attribute не удалось загрузить.',
    'url' => ':attribute формат недействителен.',
    'uuid' => ':attribute должен быть действительным UUID.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
        'password' => [
            'not_match' => [
                'email' => ':attribute не должен совпадать с email',
                'name' => ':attribute не должен совпадать с именем',
            ],
            'match' => 'Пароли должны совпадать',
        ],
        'attribute-name' => [
            'rule-name' => 'Пользовательский-Message',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */

    'attributes' => [],

];
