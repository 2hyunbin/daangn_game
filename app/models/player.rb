class Player < ApplicationRecord
  validates :nickname, presence: true
  validates :region, presence: true
  validates :score, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
