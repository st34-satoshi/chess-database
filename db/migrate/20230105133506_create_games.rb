# frozen_string_literal: true

class CreateGames < ActiveRecord::Migration[7.0]
  # rubocop:disable Metrics/MethodLength
  def change
    create_table :games do |t|
      t.integer :white
      t.integer :black
      t.text :moves
      t.text :comment
      t.string :time
      t.string :result
      t.date :date
      t.text :move_comments

      t.timestamps
    end
  end
  # rubocop:enable Metrics/MethodLength
end
