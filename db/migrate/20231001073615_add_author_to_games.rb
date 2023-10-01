class AddAuthorToGames < ActiveRecord::Migration[7.0]
  def change
    add_reference :games, :user, optional: true, foreign_key: true
  end
end
