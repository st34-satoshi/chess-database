# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password

  validates :name, uniqueness: true, allow_nil: true
  validates :email, uniqueness: true, allow_nil: true
end
