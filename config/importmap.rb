# frozen_string_literal: true

# Pin npm packages by running ./bin/importmap

pin 'application', preload: true
pin '@hotwired/turbo-rails', to: 'turbo.min.js', preload: true
pin '@hotwired/stimulus', to: 'stimulus.min.js', preload: true
pin '@hotwired/stimulus-loading', to: 'stimulus-loading.js', preload: true
pin_all_from 'app/javascript/controllers', under: 'controllers'

pin 'bootstrap', preload: true
pin 'jquery', to: 'https://ga.jspm.io/npm:jquery@3.6.0/dist/jquery.js', preload: true

pin 'record/index', preload: true
pin 'game/show', preload: true
pin 'game/index', preload: true
pin 'game/new', preload: true
pin 'game/chessboard', preload: true
pin 'game/chessboard2', preload: true
pin 'game/chess-0-13-4', preload: true
pin 'player/index', preload: true
pin 'player/show', preload: true
