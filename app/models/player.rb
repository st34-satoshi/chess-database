# frozen_string_literal: true

class Player < ApplicationRecord
  # TODO: ncs or fide must be exist
  validates :ncs_id, uniqueness: true, allow_nil: true, allow_blank: true
  validates :fide_id, uniqueness: true, allow_nil: true, allow_blank: true

  has_many :games, dependent: :restrict_with_error
end
