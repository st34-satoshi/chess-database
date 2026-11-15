# chess-database
Web site. Save chess games.

## See
[Chess Database](https://chess-database.stu345.com)

## Get Started
- `docker-compose build`
- `docker-compose run web rails db:create`
- `docker-compose run web rails db:migrate`
- `docker-compose up`
- `open http://localhost:3001`

### In Production
- copy config/master.key (this file is ignored from git)
    - or you can recreate credentials.yml.enc and master.key:
        - `rm credentials.yml.enc`
        - `docker-compose run -e EDITOR=vim web rails credentials:edit`
            - you need to set `Rails.application.credentials` variables
- `docker-compose -f docker-compose.production.yml build`
- `docker-compose -f docker-compose.production.yml run web rails db:create RAILS_ENV=production DISABLE_DATABASE_ENVIRONMENT_CHECK=1`
- `docker-compose -f docker-compose.production.yml up -d`
- when nginx exit before web started: `docker-compose -f docker-compose.production.yml up -d nginx`

## Development
- generate Home controller `docker-compose run web rails g controller Users`

### after you change something
- `docker-compose run web bundle install`
- `docker-compose up --build`

### before Pull Request
- `docker-compose run web rubocop -A`
- `docker-compose run web rails test`

### sitemap
We use [sitemap_generator](https://github.com/kjvarga/sitemap_generator#rails).

Generate public/sitemap.xml.gz file by 
1. `rake sitemap:install`.
1. `rake sitemap:refresh`.

This file is ignored by git.

### create players DB
from chess ranking site
`docker-compose run web rake player:fetch_players`

or from csv file

1. `mv lib/runner/players.tmp.csv lib/runner/players.csv`
1. `docker-compose run web rails runner lib/runner/adder.rb`


### pry
1. set `binding.pry`
1. check container id: `docker ps`
1. docker attach container_id
1. open browser
1. `exit`
1. Ctrl + q

## images
ogp: https://unsplash.com/ja/%E5%86%99%E7%9C%9F/G1yhU1Ej-9A

## iframe example
[iframe parent page](./doc/iframe.html)

## Backup Database
1. `docker-compose run web bash`
1. `pg_dump -h db -p 5432 -U postgres chess_database_development > /chess_database/backup/2023-11-14.psql`

restore
1. `create database chess_database_development` (or do it using rails)
1. `psql -h db -p 5432 -U postgres d2 < /chess_database/backup.psql`
