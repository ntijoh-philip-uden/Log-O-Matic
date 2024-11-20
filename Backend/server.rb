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

    def authenticated?(required_roles = -1)
      jwt_bearer_token = env.fetch('HTTP_AUTHORIZATION', '').slice(7..-1)
      return false unless jwt_bearer_token
      p "JWT bearer | #{jwt_bearer_token}"
      begin
        @token = JWT.decode(jwt_bearer_token, ENV['JWT_SECRET_SIGNING_KEY'], false)
        @user = @db.execute("SELECT * FROM users WHERE id = ?", @token.first['id']).first

        if required_roles == -1
          return !!@user
        elsif required_roles.is_a?(Integer) && @user["role"] <= required_roles
          return !!@user
        elsif required_roles.is_a?(Array) && required_roles.include?(@user["role"])
          return !!@user
        end

        return false
      rescue JWT::DecodeError => ex
        return false
      end
    end

    def user_id_exist?(id)
      !!@db.execute('SELECT * FROM users WHERE id = ?', id).first
    end

    def is_teacher?(teacher_id)
      !!@db.execute("SELECT * FROM users WHERE id = ? and role <= ?", teacher_id, 2).first
    end

    def is_student?(student_id)
      !!@db.execute("SELECT * FROM users WHERE id = ? and role = ?", student_id, 3).first
    end

    def unauthorized_response
      halt 401, { error: 'Unauthorized' }.to_json
    end

    def unfulfilled_requirements
      halt 400, { error: 'Not all requirements were met.' }.to_json
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
    p "Getting user: #{params['id']}"
    if authenticated?
      @db.execute('SELECT id, username FROM users WHERE id = ? LIMIT 1', params['id']).first.to_json
    else
      unauthorized_response
    end
  end

  get '/api/v1/teachers/?' do
    p "Getting all teachers"
    if authenticated?
      @db.execute('SELECT id, username FROM users WHERE role <= ?', 2).to_json
    else
      unauthorized_response
    end
  end
  
  get '/api/v1/students/?' do
    p "Getting all students"
    if authenticated?
      @db.execute('SELECT id, username FROM users WHERE role = ?', 3).to_json
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
      { token: token, username: user['username'], role: user['role'] }.to_json
    else
      unauthorized_response
    end
  end

  post '/api/v1/user/resetPassword/?' do
    p "Reset user password"
    if authenticated?(1)
      user_data = JSON.parse(request.body.read)
  
      if !user_data['id'] || !user_data['password'] || !user_id_exist?(user_data['id'])
        return unfulfilled_requirements
      end
  
      encrypted_password = BCrypt::Password.create(user_data['password'])
  
      begin
        @db.execute('UPDATE users SET password = ? WHERE id = ?', [encrypted_password, user_data['id']])
        { message: 'Password successfully reset' }.to_json
      rescue SQLite3::ConstraintException
        halt 400, { error: 'Password reset failed: Unable to update the database.' }.to_json
      end
    else
      unauthorized_response
    end
  end

  post '/api/v1/student/changeTeacher/?' do
    p "Change student's teacher"
    if authenticated?(1)
      user_data = JSON.parse(request.body.read)
  
      if !user_data['id'] || !user_data['teacherId'] || !is_student?(user_data['id']) || !is_teacher?(user_data['teacherId'])
        return unfulfilled_requirements
      end
  
      begin
        @db.execute('UPDATE users SET teacher_id = ? WHERE id = ?', [user_data['teacherId'], user_data['id']])
        { message: 'Teacher successfully changed' }.to_json
      rescue SQLite3::ConstraintException => e
        halt 400, { error: 'Failed to change teacher: User ID or teacher ID may not exist.' }.to_json
      end
    else
      unauthorized_response
    end
  end
  

  post '/api/v1/users/?' do
    p "Add user"
    if authenticated?(1)
      user_data = JSON.parse(request.body.read)
      if !user_data['username'] || !user_data['password'] || !user_data['email'] || !user_data['role']
        return unfulfilled_requirements
      end
  
      if user_data['role'] > 3 || user_data['role'] < 1
        return unfulfilled_requirements
      end
  
      if user_data['role'] == 3 && !user_data['teacherId']
        return unfulfilled_requirements
      end
  
      encrypted_password = BCrypt::Password.create(user_data['password'])
      teacher_id = user_data['role'] == 3 ? user_data['teacherId'] : nil
  
      begin
        @db.execute('INSERT INTO users (username, password, email, role, teacher_id) VALUES (?, ?, ?, ?, ?)',
                    [user_data['username'], encrypted_password, user_data['email'], user_data['role'], teacher_id])
      rescue SQLite3::ConstraintException => e
        halt 400, { error: 'User creation failed: Username or email may already exist.' }.to_json
      end
    else
      unauthorized_response
    end
  end
end
