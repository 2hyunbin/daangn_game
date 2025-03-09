require "test_helper"

class PlayersControllerTest < ActionDispatch::IntegrationTest
  test "should get create" do
    get players_create_url
    assert_response :success
  end
end
