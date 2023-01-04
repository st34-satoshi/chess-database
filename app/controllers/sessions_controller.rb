class SessionsController < ApplicationController
  include SessionsHelper
  def new
  end

  def create
    user = User.find_by(name: params[:session][:name])
    if user && user.authenticate(params[:session][:password])
      # success login
      log_in user
      redirect_to users_path
    else
      # fail login
      flash.now[:alert] = 'Invalid name/password combination'
      render 'new'
    end
  end

  def destory
  end
end
