# frozen_string_literal: true

class User < ApplicationRecord
  has_secure_password
  # TODO: error message, creating the same name user
end
