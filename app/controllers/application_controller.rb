# frozen_string_literal: true

class ApplicationController < ActionController::Base
    def current_user
        @current_user = view_context.current_user
    end
end
