# frozen_string_literal: true

class SessionsController < ApplicationController
  include SessionsHelper
  def new; end

  def create
    user = User.find_by(name: params[:session][:name])
    if user&.authenticate(params[:session][:password])
      # success login
      log_in user
      redirect_to root_path
    else
      # fail login
      flash.now[:danger] = 'Invalid name/password combination'
      render 'new', status: :unauthorized
    end
  end

  def destory
    log_out
    redirect_to root_path
  end
end
