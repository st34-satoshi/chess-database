# frozen_string_literal: true

Rails.application.routes.draw do
  resources :users
  resources :records, only: %i[index]
  get '/' => 'records#index'

  # session
  get 'signup' => 'users#new'
  get 'sessions/new'
  get 'login' => 'sessions#new'
  post 'login' => 'sessions#create'
  delete 'logout' => 'sessions#destory'
end
