class GamesController < ApplicationController
  def index
    # 닉네임과 지역 입력 화면
  end

  def play
    # 게임 플레이 화면
  end

  def rankings
    @current_score = params[:score].to_i
    @current_nickname = params[:nickname]
    @current_region = params[:region]
    
    # 전체 플레이어 수와 현재 플레이어보다 높은 점수를 가진 플레이어 수 계산
    @total_players = Player.count
    @players_above = Player.where('score > ?', @current_score).count
    
    # 현재 플레이어의 순위 (동점자는 같은 순위로 처리)
    @current_rank = @players_above + 1
    
    # 상위 % 계산 (소수점 첫째자리까지)
    @percentile = ((@players_above.to_f / @total_players) * 100).round(1)
    
    # 지역 내 순위 계산
    if @current_region.present?
      @region_total_players = Player.where(region: @current_region).count
      @region_players_above = Player.where('score > ? AND region = ?', @current_score, @current_region).count
      @region_rank = @region_players_above + 1
      @region_percentile = ((@region_players_above.to_f / @region_total_players) * 100).round(1)
    end
    
    # 전체 TOP 10
    @top_players = Player.order(score: :desc).limit(10)
    
    # 해당 지역의 TOP 10
    if @current_region.present?
      @region_top_players = Player.where(region: @current_region)
                                 .order(score: :desc)
                                 .limit(10)
    end
  end
end
