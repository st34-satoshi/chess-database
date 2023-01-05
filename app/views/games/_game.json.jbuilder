# frozen_string_literal: true

json.extract! game, :id, :white, :black, :moves, :comment, :time, :result, :date, :move_comments, :created_at,
              :updated_at
json.url game_url(game, format: :json)
