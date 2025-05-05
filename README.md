# Laravel Vue Admin Starter
[Laravel Vue Admin Starter](https://) is a beautiful dashboard combination of [Laravel](https://laravel.com/), [Vue3](https://github.com/vuejs/vue) and the UI Toolkit [Element Plus](https://element-plus.org/).
## Installing Manual
### № 1 Clone the project and run composer
```bash
git clone https://github.com/ASVVIZIT/laravel-vue-admin-starter.git
```
```bash
cd laravel-vue-admin-starter
```
#### Or clone Empty folder Set Dot
```bash 
git clone https://github.com/ASVVIZIT/laravel-vue-admin-starter.git .
```
### № 2 Run composer
#### Install dependency with composer
```bash
composer install
```
### № 3 Install dependency with NPM
```bash
npm install
```

### An example of the configuration of an "ENV file" is to copy the .env.dev or env.docker file to the .env file
### Generate key for APP_KEY .env
```bash
php artisan key:generate
```
### Create cache for system
```bash
php artisan config:cache
```
## DATABASE
### An example of the configuration of an "ENV file" is to copy the .env.dev or env.docker file to the .env file
### Migration and DB seeder (after changing your DB settings in .env)
```bash
php artisan migrate --seed
```
### or seeding command 
```bash
php artisan migrate:refresh --seed
```
### Create cache for system
```bash
php artisan config:cache
```

## For Backend
### Develop Start server
```bash
php artisan serve
```
http://localhost:8000 or http://127.0.0.1:8000

## For Frontend
### Develop Start
```sh
npm run watch
```
### Build on production
```sh
npm run build
```
### Docker
```sh
docker-compose up -d
```

Build static files within `Laravel` container with `npm`

```sh
docker exec -it laravel-vue-admin npm run watch
```

Open http://localhost:8000 (laravel container port declared in `docker-compose.yml`) to access Laravel Vue Admin.

## Built with

* [Laravel](https://laravel.com/) - The PHP Framework For Web Artisans
* [Laravel Sanctum](https://github.com/laravel/sanctum/) - Laravel Sanctum provides a featherweight authentication system for SPAs and simple APIs.
* [spatie/laravel-permission](https://github.com/spatie/laravel-permission) - Associate users with permissions and roles.
* [VueJS](https://vuejs.org/) - The Progressive JavaScript Framework
* [Element Plus](https://element-plus.org/) -A Vue.js 3 UI library
* [vue3-admin-ts](https://github.com/jzfai/vue3-admin-ts) - A minimal vue3 admin template with Element-Plus UI & axios & permission control & lint & hook

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE) file for details.

## Acknowledgements

* [Laravel](https://laravel.com/) - The PHP Framework For Web Artisans
* [VueJS](https://vuejs.org/) - The Progressive JavaScript Framework
* [vue3-admin-ts](https://panjiachen.github.io/vue-element-admin/#/) A minimal vue3 admin template with Element-Plus UI & axios & permission control & lint & hook
* [Echarts](http://echarts.apache.org/) - A powerful, interactive charting and visualization library for browser.
* [Cloudflare](https://https://www.cloudflare.com/) - A global network built for the cloud
