require 'bundler';
Bundler.require;

require_relative 'server.rb';
require_relative 'db/seeder';

run(Main);