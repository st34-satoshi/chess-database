# frozen_string_literal: true

Rails.application.routes.draw do
  resources :games
  resources :players
  resources :users, only: %i[index new create]
  root to: 'games#index'

  # session
  get 'signup' => 'users#new'
  get 'sessions/new'
  get 'login' => 'sessions#new'
  post 'login' => 'sessions#create'
  delete 'logout' => 'sessions#destory'
  # google auth
  post '/google_login_api/callback', to: 'sessions#google_auth_callback'
end
