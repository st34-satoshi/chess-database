# frozen_string_literal: true

Rails.application.routes.draw do
  resources :games
  resources :players
  resources :users
  root to: 'games#index'

  # session
  get 'signup' => 'users#new'
  get 'sessions/new'
  get 'login' => 'sessions#new'
  post 'login' => 'sessions#create'
  delete 'logout' => 'sessions#destory'
end
