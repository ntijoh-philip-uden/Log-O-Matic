require 'bcrypt'
require 'sinatra'
require 'time'
require 'jwt'
require 'debug'
require 'dotenv/load'

class Main < Sinatra::Base

  # Gå igenom hela applikationen

  def initialize
    super
    @db = SQLite3::Database.new('db/log-o-matic.db')
    @db.results_as_hash = true
  end

  helpers do

    def authenticated?
      jwt_bearer_token = env.fetch('HTTP_AUTHORIZATION', '').slice(7..-1)
      return false unless jwt_bearer_token
      p "JWT bearer | #{jwt_bearer_token}"
      begin
        @token = JWT.decode(jwt_bearer_token, ENV['JWT_SECRET_SIGNING_KEY'], false)
        @user = @db.execute("SELECT * FROM users WHERE id = ?", @token.first['id']).first
        return !!@user
      rescue JWT::DecodeError => ex
        return false
      end
    end

    def unauthorized_response
      halt 401, { error: 'Unauthorized' }.to_json
    end

  end

  configure do
    enable :cross_origin
  end

  before do
    response.headers['Access-Control-Allow-Origin'] = '*'
    content_type :json
    sleep 1 #simulate slow internet connection
  end

  options "*" do
    response.headers["Access-Control-Allow-Methods"] = "GET, PUT, POST, PATCH, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Location, Accept, X-User-Email, X-Auth-Token"
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Expose-Headers"] = "Location, Link"
    200
  end

  get '/api/v1/users/?' do
    p "Getting all users"
    if authenticated?
      @db.execute('SELECT id, username FROM users').to_json
    else
      unauthorized_response
    end
  end

  get '/api/v1/users/:id/?' do
    p "Getting user: #{id}"
    if authenticated?
      @db.execute('SELECT id, username FROM users WHERE id = ? LIMIT 1', params['id']).first.to_json
    else
      unauthorized_response
    end
  end

  post '/api/v1/users/signin' do
    p "Signing in"
    user_data = JSON.parse(request.body.read)
    user = @db.execute('SELECT * FROM users WHERE email = ?', user_data['email']).first
    if user && BCrypt::Password.new(user['password']) == user_data['password']
      token = JWT.encode({ id: user['id'], issued_at: Time.now }, ENV['JWT_SECRET_SIGNING_KEY'])
      { token: token, role: user['role'] }.to_json
    else
      unauthorized_response
    end
  end
end
