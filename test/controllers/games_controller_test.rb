require "test_helper"

class GamesControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get games_index_url
    assert_response :success
  end

  test "should get play" do
    get games_play_url
    assert_response :success
  end

  test "should get rankings" do
    get games_rankings_url
    assert_response :success
  end
end
