# frozen_string_literal: true

class Game < ApplicationRecord
  belongs_to :white, class_name: 'Player', foreign_key: 'white_id'
  belongs_to :black, class_name: 'Player', foreign_key: 'black_id'
  belongs_to :user, optional: true

  before_create -> { self.public_uid = generate_public_uid }

  def white_win?
    result == 'White Win'
  end

  def black_win?
    result == 'Black Win'
  end

  def draw?
    result == 'Draw'
  end

  def unknown?
    result == 'Unknown'
  end

  def create_both_player(white_name, black_name)
    if self.white_id.blank? && white_name.present?
      white = Player.find_or_create_by(name: white_name)
      self.white_id = white.id
    end
    if self.black_id.blank? && black_name.present?
      black = Player.find_or_create_by(name: black_name)
      self.black_id = black.id
    end
  end

  def to_param
    public_uid
  end

  def generate_public_uid
    SecureRandom.alphanumeric(10) # A-Z, a-z, 0-9. 62^10=6*10^17 patterns
  end
end
