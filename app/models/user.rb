# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  has_many :games, dependent: :nullify

  validates :name, uniqueness: true, allow_nil: true
  validates :email, uniqueness: true, allow_nil: true
end
