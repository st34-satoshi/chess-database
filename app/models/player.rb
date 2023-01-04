class Player < ApplicationRecord
     # TODO: ncs or fide must be exist
    validates :ncs_id, uniqueness: true, allow_nil: true, allow_blank: true
    validates :fide_id, uniqueness: true, allow_nil: true, allow_blank: true
end
