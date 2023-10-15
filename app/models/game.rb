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

  def to_param
    public_uid
  end

  def generate_public_uid
    SecureRandom.alphanumeric(10) # A-Z, a-z, 0-9. 62^10=6*10^17 patterns
  end
end
