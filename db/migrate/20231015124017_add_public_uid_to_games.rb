class AddPublicUidToGames < ActiveRecord::Migration[7.0]
  def change
    add_column :games, :public_uid, :string
    add_index :games, :public_uid, unique: true
  end
end
