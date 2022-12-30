Rails.application.routes.draw do
  resources :records, only: %i[index]
  get '/' => 'records#index'
end
