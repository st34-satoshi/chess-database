# frozen_string_literal: true

class Game < ApplicationRecord
  belongs_to :white, class_name: "Player", foreign_key: "white_id"
  belongs_to :black, class_name: "Player", foreign_key: "black_id"
end
