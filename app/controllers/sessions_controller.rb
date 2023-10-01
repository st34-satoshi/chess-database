# frozen_string_literal: true

class SessionsController < ApplicationController
  include SessionsHelper
  require 'googleauth/id_tokens/verifier'
  protect_from_forgery except: :google_auth_callback

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

  def google_auth_callback
    # verify_g_csrf_token
    if cookies['g_csrf_token'].blank? || params[:g_csrf_token].blank? || cookies['g_csrf_token'] != params[:g_csrf_token]
      flash[:danger] = 'ログインに失敗しました'
      redirect_to login_path
      return
    end

    payload = Google::Auth::IDTokens.verify_oidc(params[:credential],
                                                 aud: Rails.application.config.google_auth_client_id)
    user = User.find_or_create_by(email: payload['email']) do |u|
      u.g_name = payload['name']
      u.password = SecureRandom.hex(10) # password is required but notused. So random string is OK.
    end
    unless user.save
      flash[:danger] = 'ログインに失敗しました'
      redirect_to login_path
      return
    end
    log_in user
    flash[:success] = 'ログインしました'
    redirect_to games_path
  end
end
