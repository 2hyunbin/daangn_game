class CreatePlayers < ActiveRecord::Migration[7.1]
  def change
    create_table :players do |t|
      t.string :nickname
      t.string :region
      t.integer :score

      t.timestamps
    end
  end
end
