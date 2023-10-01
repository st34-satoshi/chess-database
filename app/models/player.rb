# frozen_string_literal: true

class Player < ApplicationRecord
  # TODO: ncs or fide must be exist
  validates :ncs_id, uniqueness: true, allow_nil: true, allow_blank: true
  validates :fide_id, uniqueness: true, allow_nil: true, allow_blank: true

  has_many :white_games, class_name: 'Game', foreign_key: 'white_id', dependent: :restrict_with_error
  has_many :black_games, class_name: 'Game', foreign_key: 'black_id', dependent: :restrict_with_error

  def games
    white_games + black_games
  end

  def self.name_id_hash
    h = {}
    Player.all.each do |player|
      h[player.name] = player.id
    end
    h
  end
end
