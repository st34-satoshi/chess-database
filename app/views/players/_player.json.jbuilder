json.extract! player, :id, :name, :ncs_id, :fide_id, :created_at, :updated_at
json.url player_url(player, format: :json)
