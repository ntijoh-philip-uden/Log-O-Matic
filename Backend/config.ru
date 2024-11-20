require 'bundler'
Bundler.require

require_relative 'qotd_api'
require_relative 'db/seeder'

run(QotdApi)