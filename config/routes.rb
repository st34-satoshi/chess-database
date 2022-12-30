# frozen_string_literal: true

Rails.application.routes.draw do
  resources :records, only: %i[index]
  get '/' => 'records#index'
end
