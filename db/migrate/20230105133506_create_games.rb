# frozen_string_literal: true

class CreateGames < ActiveRecord::Migration[7.0]
  def change
    create_table :games do |t|
      t.integer :white_id
      t.integer :black_id
      t.text :moves
      t.text :comment
      t.string :time
      t.string :result
      t.date :date
      t.text :move_comments

      t.timestamps
    end
  end
end
