class PlayersController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]

  def create
    @player = Player.new(player_params)
    
    if @player.save
      render json: { success: true, player_id: @player.id, score: @player.score }
    else
      render json: { success: false, errors: @player.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def player_params
    params.require(:player).permit(:nickname, :region, :score)
  end
end
