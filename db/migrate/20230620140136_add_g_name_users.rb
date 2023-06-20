class AddGNameUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :g_name, :string
  end
end
