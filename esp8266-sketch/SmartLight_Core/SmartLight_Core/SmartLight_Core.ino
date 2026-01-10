#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

// ===== ГЛОБАЛЬНЫЕ НАСТРОЙКИ =====
// Пины
const int CONTROL_PIN = D1;    // Пин управления светом (GPIO5)
const int ANALOG_PIN = A0;     // Пин для измерения напряжения

// Параметры по умолчанию
float CRITICAL_VOLTAGE = 3.2;   // Критическое напряжение (В)
int SLEEP_INTERVAL = 600;      // Интервал сна в нормальном режиме (сек)
int EMERGENCY_SLEEP_INTERVAL = 3600; // Экстренный сон (сек)

// Данные устройства
String DEVICE_ID = "";
String API_KEY = "";
String SERVER_URL = "https://your-laravel-domain.ru/api/smart-light"; // Замените на ваш домен!

// Параметры Wi-Fi (временно для теста)
const char* WIFI_SSID = "YOUR_WIFI_SSID";     // Замените на ваш SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Замените на пароль

// ===== ИНИЦИАЛИЗАЦИЯ =====
void setup() {
  // Инициализация Serial
  Serial.begin(115200);
  delay(1000); // Ждём стабилизации Serial
  Serial.println("\n=== SmartLight Core v1.0 ===");
  Serial.println("Инициализация системы...");
  
  // Инициализация EEPROM
  EEPROM.begin(512);
  
  // Настройка пинов
  pinMode(CONTROL_PIN, OUTPUT);
  digitalWrite(CONTROL_PIN, LOW); // Свет выключен по умолчанию
  pinMode(LED_BUILTIN, OUTPUT);   // Встроенный светодиод для индикации
  digitalWrite(LED_BUILTIN, LOW);
  
  // Загрузка сохранённых данных
  loadCredentials();
  
  // Регистрация нового устройства при первом запуске
  if (DEVICE_ID == "" || API_KEY == "") {
    registerDevice();
  }
  
  // Измерение напряжения ДО подключения к Wi-Fi
  float voltage = readBatteryVoltage();
  Serial.println("Измеренное напряжение: " + String(voltage, 2) + "В");
  
  // Проверка критического заряда
  if (voltage < CRITICAL_VOLTAGE) {
    handleCriticalVoltage(voltage);
    return; // Уходим в сон без подключения к сети
  }
  
  // Загрузка настроек с сервера
  loadSettings();
  
  // Подключение к Wi-Fi
  connectToWiFi();
  
  // Отправка телеметрии
  sendTelemetry(voltage, "OFF", 100);
  
  // Проверка команд
  checkCommands();
  
  // Переход в сон
  enterDeepSleep(SLEEP_INTERVAL);
}

void loop() {
  // Всё происходит в setup() с последующим переходом в сон
}

// ===== РАБОТА С EEPROM =====
void loadCredentials() {
  char deviceId[20] = {0};
  char apiKey[33] = {0};
  
  // Чтение DEVICE_ID из EEPROM (адреса 0-19)
  for (int i = 0; i < 19; i++) {
    deviceId[i] = EEPROM.read(i);
  }
  
  // Чтение API_KEY из EEPROM (адреса 20-51)
  for (int i = 0; i < 32; i++) {
    apiKey[i] = EEPROM.read(20 + i);
  }
  
  DEVICE_ID = String(deviceId);
  API_KEY = String(apiKey);
  
  Serial.println("Загружены сохранённые данные:");
  Serial.println("DEVICE_ID: " + (DEVICE_ID.length() > 0 ? DEVICE_ID : "не задан"));
  Serial.println("API_KEY: " + (API_KEY.length() > 0 ? "******" : "не задан"));
}

void saveCredentials(const String& deviceId, const String& apiKey) {
  // Очистка EEPROM
  for (int i = 0; i < 52; i++) {
    EEPROM.write(i, 0);
  }
  
  // Сохранение DEVICE_ID
  for (int i = 0; i < deviceId.length() && i < 19; i++) {
    EEPROM.write(i, deviceId[i]);
  }
  
  // Сохранение API_KEY
  for (int i = 0; i < apiKey.length() && i < 32; i++) {
    EEPROM.write(20 + i, apiKey[i]);
  }
  
  EEPROM.commit();
  Serial.println("Данные сохранены в EEPROM");
}

// ===== РЕГИСТРАЦИЯ УСТРОЙСТВА =====
void registerDevice() {
  Serial.println("Регистрация нового устройства...");
  
  // Генерация временного MAC-адреса
  String mac = WiFi.macAddress();
  mac.replace(":", "");
  
  // Генерация временного ID
  String tempDeviceId = "TEMP_" + mac;
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/register");
  http.addHeader("Content-Type", "application/json");
  
  // Формирование JSON для регистрации
  String json = "{\"mac_address\":\"" + mac + 
                "\", \"device_type\":\"node_mcu_v3\"}";
  
  Serial.println("Отправка запроса регистрации:");
  Serial.println(json);
  
  int httpCode = http.POST(json);
  
  if (httpCode > 0) {
    Serial.println("Код ответа: " + String(httpCode));
    
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
      String payload = http.getString();
      Serial.println("Ответ сервера: " + payload);
      
      DynamicJsonDocument doc(256);
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error && doc.containsKey("device_id") && doc.containsKey("api_key")) {
        DEVICE_ID = doc["device_id"].as<String>();
        API_KEY = doc["api_key"].as<String>();
        
        saveCredentials(DEVICE_ID, API_KEY);
        Serial.println("Успешная регистрация!");
        Serial.println("DEVICE_ID: " + DEVICE_ID);
        Serial.println("API_KEY: " + API_KEY);
      } else {
        Serial.println("Ошибка парсинга JSON ответа");
        Serial.println("Ошибка: " + String(error.c_str()));
      }
    } else {
      Serial.println("Ошибка регистрации. Сервер вернул: " + String(httpCode));
    }
  } else {
    Serial.println("Ошибка HTTP запроса: " + String(httpCode));
  }
  
  http.end();
  
  // Если регистрация не удалась - используем временные данные
  if (DEVICE_ID == "" || API_KEY == "") {
    DEVICE_ID = tempDeviceId;
    API_KEY = "TEMP_KEY_" + String(millis());
    saveCredentials(DEVICE_ID, API_KEY);
    Serial.println("Используются временные данные для автономной работы");
  }
}

// ===== ЗАГРУЗКА НАСТРОЕК =====
void loadSettings() {
  if (DEVICE_ID == "" || API_KEY == "") {
    Serial.println("Нет данных для загрузки настроек");
    return;
  }
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/" + DEVICE_ID + "/settings");
  http.addHeader("X-Device-Key", API_KEY);
  
  Serial.println("Запрос настроек с: " + String(SERVER_URL) + "/" + DEVICE_ID + "/settings");
  
  int httpCode = http.GET();
  
  if (httpCode > 0) {
    Serial.println("Код ответа настроек: " + String(httpCode));
    
    if (httpCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println("Ответ сервера (настройки): " + payload);
      
      DynamicJsonDocument doc(512);
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error) {
        // Обновление глобальных настроек
        if (doc.containsKey("critical_voltage")) {
          CRITICAL_VOLTAGE = doc["critical_voltage"].as<float>();
          Serial.println("Установлено критическое напряжение: " + String(CRITICAL_VOLTAGE, 2) + "В");
        }
        
        if (doc.containsKey("sleep_interval")) {
          SLEEP_INTERVAL = doc["sleep_interval"].as<int>();
          Serial.println("Установлен интервал сна: " + String(SLEEP_INTERVAL) + " сек");
        }
        
        if (doc.containsKey("emergency_sleep_interval")) {
          EMERGENCY_SLEEP_INTERVAL = doc["emergency_sleep_interval"].as<int>();
          Serial.println("Установлен экстренный интервал сна: " + String(EMERGENCY_SLEEP_INTERVAL) + " сек");
        }
        
        if (doc.containsKey("server_url")) {
          String newServerUrl = doc["server_url"].as<String>();
          if (newServerUrl != SERVER_URL) {
            SERVER_URL = newServerUrl;
            Serial.println("Обновлён URL сервера: " + SERVER_URL);
          }
        }
        
        // Обновление Wi-Fi настроек
        if (doc.containsKey("wifi_ssid") && doc.containsKey("wifi_password")) {
          // Для продакшена: сохранить в EEPROM и переподключиться
          Serial.println("Получены настройки Wi-Fi (в будущих версиях)");
        }
      } else {
        Serial.println("Ошибка парсинга JSON настроек: " + String(error.c_str()));
      }
    } else {
      Serial.println("Ошибка загрузки настроек. Сервер вернул: " + String(httpCode));
    }
  } else {
    Serial.println("Ошибка HTTP запроса настроек: " + String(httpCode));
  }
  
  http.end();
}

// ===== ИЗМЕРЕНИЕ НАПРЯЖЕНИЯ =====
float readBatteryVoltage() {
  /*
   * Схема делителя напряжения для 3.7В аккумулятора:
   *   Аккумулятор (+) --[100k]-- A0 --[100k]-- GND
   *   Макс. напряжение на A0 при 4.2В: 4.2V / 2 = 2.1V
   *   Поправочный коэффициент: 1.135 (для точности)
   */
  int adcValue = analogRead(ANALOG_PIN);
  float voltage = (adcValue * 3.3 / 1023.0) * 2 * 1.135; // Поправочный коэффициент
  return voltage;
}

// ===== ОБРАБОТКА КРИТИЧЕСКОГО ЗАРЯДА =====
void handleCriticalVoltage(float voltage) {
  Serial.println("!!! КРИТИЧЕСКИЙ ЗАРЯД !!!");
  Serial.println("Текущее напряжение: " + String(voltage, 2) + "В");
  Serial.println("Критический порог: " + String(CRITICAL_VOLTAGE, 2) + "В");
  
  // Принудительное отключение нагрузки
  digitalWrite(CONTROL_PIN, LOW);
  digitalWrite(LED_BUILTIN, HIGH); // Включаем встроенный светодиод как индикатор
  
  // Экстренная отправка телеметрии (если есть связь)
  if (WiFi.status() == WL_CONNECTED) {
    sendEmergencyTelemetry(voltage);
  }
  
  // Переход в экстренный сон
  Serial.println("Переход в ЭКСТРЕННЫЙ СОН на " + String(EMERGENCY_SLEEP_INTERVAL) + " секунд");
  enterDeepSleep(EMERGENCY_SLEEP_INTERVAL);
}

void sendEmergencyTelemetry(float voltage) {
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/" + DEVICE_ID + "/telemetry");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", API_KEY);
  
  String json = "{\"voltage\":" + String(voltage, 2) + 
                ",\"status\":\"LOW_POWER\"," +
                "\"intensity\":0," +
                "\"emergency\":true}";
  
  Serial.println("Отправка экстренной телеметрии: " + json);
  
  int httpCode = http.POST(json);
  
  if (httpCode > 0) {
    Serial.println("Экстренная телеметрия отправлена. Код: " + String(httpCode));
  } else {
    Serial.println("Ошибка отправки экстренной телеметрии: " + String(httpCode));
  }
  
  http.end();
}

// ===== ПОДКЛЮЧЕНИЕ К Wi-Fi =====
void connectToWiFi() {
  Serial.println("Подключение к Wi-Fi: " + String(WIFI_SSID));
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  uint32_t start = millis();
  int attempts = 0;
  
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nПодключено к Wi-Fi!");
    Serial.println("IP адрес: " + WiFi.localIP().toString());
    digitalWrite(LED_BUILTIN, HIGH); // Кратковременная индикация
    delay(200);
    digitalWrite(LED_BUILTIN, LOW);
  } else {
    Serial.println("\nОшибка подключения к Wi-Fi");
    Serial.println("Код состояния: " + String(WiFi.status()));
    Serial.println("Попытка работы в автономном режиме");
  }
}

// ===== ОТПРАВКА ТЕЛЕМЕТРИИ =====
void sendTelemetry(float voltage, String status, int intensity) {
  Serial.println("Отправка телеметрии...");
  Serial.println("Напряжение: " + String(voltage, 2) + "В");
  Serial.println("Статус: " + status);
  Serial.println("Интенсивность: " + String(intensity) + "%");
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/" + DEVICE_ID + "/telemetry");
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", API_KEY);
  
  String json = "{\"voltage\":" + String(voltage, 2) + 
                ",\"status\":\"" + status + "\"," +
                "\"intensity\":" + String(intensity) + "}";
  
  Serial.println("Тело запроса: " + json);
  
  int httpCode = http.POST(json);
  
  if (httpCode > 0) {
    Serial.println("Телеметрия отправлена. Код: " + String(httpCode));
    
    if (httpCode != HTTP_CODE_OK && httpCode != HTTP_CODE_CREATED) {
      String response = http.getString();
      Serial.println("Ответ сервера: " + response);
    }
  } else {
    Serial.println("Ошибка отправки телеметрии: " + String(httpCode));
  }
  
  http.end();
}

// ===== ПРОВЕРКА КОМАНД =====
void checkCommands() {
  Serial.println("Проверка команд от сервера...");
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + "/" + DEVICE_ID + "/commands");
  http.addHeader("X-Device-Key", API_KEY);
  
  int httpCode = http.GET();
  
  if (httpCode > 0) {
    Serial.println("Код ответа команд: " + String(httpCode));
    
    if (httpCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println("Ответ сервера (команды): " + payload);
      
      DynamicJsonDocument doc(256);
      DeserializationError error = deserializeJson(doc, payload);
      
      if (!error && doc.containsKey("command")) {
        String command = doc["command"].as<String>();
        Serial.println("Получена команда: " + command);
        
        if (command == "ON") {
          int intensity = doc.containsKey("intensity") ? doc["intensity"].as<int>() : 100;
          digitalWrite(CONTROL_PIN, HIGH);
          Serial.println("Светильник ВКЛЮЧЕН (интенсивность: " + String(intensity) + "%)");
          
          // Для будущих версий: управление ШИМ для интенсивности
        } 
        else if (command == "OFF") {
          digitalWrite(CONTROL_PIN, LOW);
          Serial.println("Светильник ВЫКЛЮЧЕН");
        } 
        else if (command == "EMERGENCY_SLEEP") {
          Serial.println("Получена команда ЭКСТРЕННОГО СНА!");
          enterDeepSleep(EMERGENCY_SLEEP_INTERVAL);
        }
      } else {
        Serial.println("Нет новых команд для выполнения");
      }
    } else {
      Serial.println("Ошибка получения команд. Сервер вернул: " + String(httpCode));
    }
  } else {
    Serial.println("Ошибка HTTP запроса команд: " + String(httpCode));
  }
  
  http.end();
}

// ===== УПРАВЛЕНИЕ СНОМ =====
void enterDeepSleep(int seconds) {
  Serial.println("Подготовка к переходу в Deep Sleep...");
  
  // Отключение Wi-Fi для экономии энергии
  Serial.println("Отключение Wi-Fi...");
  WiFi.mode(WIFI_OFF);
  WiFi.forceSleepBegin();
  delay(100); // Ждём завершения операций
  
  // Индикация перед сном
  digitalWrite(LED_BUILTIN, HIGH);
  delay(100);
  digitalWrite(LED_BUILTIN, LOW);
  
  Serial.println("Уход в Deep Sleep на " + String(seconds) + " секунд");
  Serial.flush(); // Отправляем все данные в Serial
  
  ESP.deepSleep(seconds * 1000000); // Переводим секунды в микросекунды
}