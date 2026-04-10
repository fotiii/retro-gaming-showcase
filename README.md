# Indie Frame

Журнал и **галерея пиксель-ассетов** для инди-разработчиков: все PNG из ваших архивов с превью и фильтрами.

## Страницы

- `index.html` — журнал / вводная
- `references.html` — галерея (сетка + карусель)

## Y2K-оформление

В репозитории лежит **выборка** из пака *235 Y2K Shapes, Icons and Elements* (holo-текстуры + часть фигур PNG) в `assets/img/y2k/`. Полный архив не коммитится — см. `assets/y2k-pack/` в `.gitignore`.

## Каталог ассетов

- `assets/catalog.json` — список всех файлов (id, путь в репо, тип, коллекция, исходный путь в zip)
- `assets/img/forest-pack/pack-000001.png` … — **все** PNG из **Pack 01 (Pixel Art)** (193 файла)
- `assets/img/woods-tileset.png` — лист **pixel_16_woods v2 free**

Чтобы пересобрать каталог после добавления архива, распакуйте в `assets/pack01-tar` и выполните у себя скрипт копирования (см. историю коммита) или расширьте `catalog.json` вручную.

## Stack

- HTML / CSS / JS — `fetch('./assets/catalog.json')` для списка ассетов

## Локальный просмотр

Откройте `index.html` или поднимите статический сервер (для `fetch` с `file://` может понадобиться локальный сервер).

## Deploy

Vercel / GitHub Pages как static site.

## Где искать ассеты

- [OpenGameArt](https://opengameart.org/)
- [itch.io — Game assets](https://itch.io/game-assets)
- [Kenney](https://kenney.nl/assets)
- [Craftpix freebies](https://craftpix.net/freebies/)
- [Lospec](https://lospec.com/)

У каждого пака своя лицензия — проверяйте перед релизом.
