namespace :database do
  desc "add public uid"
  task add_public_uid: :environment do
    puts "start adding public uid"
    
    Game.all.each do |game|
      if game.public_uid.nil?
        game.public_uid = game.generate_public_uid 
        game.save
      end
    end
    puts "finish adding public uid"
  end
end
