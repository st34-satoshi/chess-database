# frozen_string_literal: true

class GamesController < ApplicationController
  before_action :set_game, only: %i[show edit update destroy iframe]
  before_action :current_user, only: %i[new]
  after_action :allow_iframe, only: %i[iframe]

  def index
    @games = Game.all.order(date: :desc)
  end

  def show; end

  def iframe; end

  def new
    @game = if @current_user
              @current_user.games.new
            else
              Game.new
            end
    @players = Player.all
    @player_hash = Player.name_id_hash
  end

  def edit
    @players = Player.all
    @player_hash = Player.name_id_hash
  end

  def create
    @game = Game.new(game_params)
    @game.create_both_player(params[:game][:white_name], params[:game][:black_name])

    respond_to do |format|
      if @game.save
        format.html { redirect_to game_url(@game), notice: 'Game was successfully created.' }
      else
        @players = Player.all
        @player_hash = Player.name_id_hash
        format.html { render :new, status: :unprocessable_entity }
      end
    end
  end

  def update
    @game.assign_attributes(game_params)
    @game.create_both_player(params[:game][:white_name], params[:game][:black_name])
    if @game.save
      flash[:success] = 'Game was successfully updated.'
      redirect_to game_path(@game)
    else
      @players = Player.all
      @player_hash = Player.name_id_hash
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @game.destroy

    respond_to do |format|
      format.html { redirect_to games_url, notice: 'Game was successfully destroyed.' }
    end
  end

  private

  def set_game
    @game = Game.find_by(public_uid: params[:id])
    raise ActionController::RoutingError.new('Not Found') if @game.nil?
  end

  def game_params
    params.require(:game).permit(:white_id, :black_id, :moves, :comment, :time, :result, :date, :move_comments,
                                 :user_id)
  end
end
