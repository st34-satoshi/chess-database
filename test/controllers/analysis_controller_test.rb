# frozen_string_literal: true

require 'test_helper'

class AnalysisControllerTest < ActionDispatch::IntegrationTest
  # This anonymous, client-side page does not need application fixtures.
  self.fixture_table_names = []

  test 'analysis is available without signing in' do
    get analysis_url
    assert_response :success
    assert_select '#analysis-board'
    assert_select 'textarea#position-input'
    assert_select 'input#candidate-count[value="3"]'
    assert_select 'input[type="file"]', count: 0
  end
end
