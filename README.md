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

## Browser analysis

`/analysis` accepts a pasted FEN or a single standard-chess PGN (main line).
Stockfish.js 19.0.1 lite runs in a local Web Worker; no position is sent to an
engine service. Serve `public/engine/*.wasm` as `application/wasm` and keep the
matching JavaScript beside it. The bundled single-threaded engine needs no
cross-origin isolation headers. License and upstream source links are in
`public/engine/README.txt`; the full license is in `public/engine/COPYING.txt`.

- Scores are from White's perspective; candidates are ranked for the side to move.
- Candidate count defaults to 3, is configurable from 1 to 20, and is saved locally.
- Analysis streams intermediate depths up to depth 24 and can be paused/resumed.
- Click a piece and destination to move; promotion choice is below the board.
- Editing permits arbitrary relocation (switches turn), addition/deletion (keeps
  turn), and a turn switch. Occupied destinations are replaced. Editing resets
  castling/en-passant rights and the halfmove clock. Invalid positions remain
  editable but are not sent to the engine.
- Back/forward restores full FEN snapshots. A new move/edit after going back
  replaces the forward history; paste the original PGN again to restore its line.

Run analysis unit tests, including the bundled WASM smoke test, with Node 20+:
`node --test test/javascript/analysis.test.mjs`.
Run the anonymous page integration test with:
`bundle exec rails test test/controllers/analysis_controller_test.rb`.
