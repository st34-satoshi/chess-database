namespace :player do
  desc "fetch players form the chess ranking site"
  task fetch_players: :environment do
    puts "start fetch players"
    puts "player length = #{Player.all.length}"
    uri = URI.parse('https://chess-ranking.stu345.com/all_players')
    res = Net::HTTP.get(uri)
    players = JSON.parse(res)
    
    players.each do |player|
      ncs_id = player['ncs_id']
      name = player['name_en']
      p = Player.find_by(ncs_id: ncs_id)
      Player.create(name:, ncs_id:) if p.nil?
    end
    puts "finish fetch players"
    puts "player length = #{Player.all.length}"
  end

  desc "create a player"
  task create_player: :environment do
    ncs_id = "T20240331"
    name = "Player"
    p = Player.find_by(ncs_id: ncs_id)
    Player.create(name:, ncs_id:) if p.nil?
  end
end
