# frozen_string_literal: true

# Pin npm packages by running ./bin/importmap

pin 'application', preload: true

pin 'bootstrap', preload: true
pin 'jquery', to: 'https://ga.jspm.io/npm:jquery@3.6.0/dist/jquery.js', preload: true

pin 'record/index', preload: true
pin 'game/show', preload: true
pin 'game/index', preload: true
pin 'game/new', preload: true
pin 'game/edit', preload: true
pin 'game/chessboard', preload: true
pin 'game/chessboard2', preload: true
pin 'game/chess-1-0-0beta-6', preload: true
pin 'player/index', preload: true
pin 'player/show', preload: true
