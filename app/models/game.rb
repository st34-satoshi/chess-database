# frozen_string_literal: true

class Game < ApplicationRecord
  belongs_to :white, class_name: "Player", foreign_key: "white_id"
  belongs_to :black, class_name: "Player", foreign_key: "black_id"
  belongs_to :user

  def white_win?
    result == "White Win"
  end

  def black_win?
    result == "Black Win"
  end

  def draw?
    result == "Draw"
  end

  def unknown?
    result == "Unknown"
  end
end
