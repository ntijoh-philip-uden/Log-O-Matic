require 'bundler'
Bundler.require

require_relative 'Login'
require_relative 'db/seeder'

run(QotdApi)