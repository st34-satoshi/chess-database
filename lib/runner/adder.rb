# frozen_string_literal: true

require 'csv'
module Runner
  class Adder
    def self.read_players
      CSV.foreach('lib/runner/players.csv', headers: false) do |row|
        ncs_id = row[1]
        name = row[2]
        Player.create(name:, ncs_id:)
      end
    end
  end
end

puts 'hello add players'
Runner::Adder.read_players
