require 'bcrypt'
require 'sinatra'
require 'time'
require 'jwt'
require 'dotenv/load'
require 'sqlite3'

class Main < Sinatra::Base
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

    def user_email_exist?(email)
      !!@db.execute('SELECT * FROM users WHERE email = ?', email).first
    end

    def is_teacher?(teacher_id)
      !!@db.execute("SELECT * FROM users WHERE id = ? and role <= ?", [teacher_id, 2]).first
    end

    def is_student?(student_id)
      !!@db.execute("SELECT * FROM users WHERE id = ? and role = ?", [student_id, 3]).first
    end

    def unauthorized_response
      halt 401, { error: 'Unauthorized' }.to_json
    end

    def unfulfilled_requirements
      halt 400, { error: 'Not all requirements were met.' }.to_json
    end

    def fetch_logs_by_conditions(conditions)
      base_query = "SELECT * FROM logs WHERE"
      conditions_query = []
      values = []
    
      conditions.each do |key, value|
        next unless value # Skip if the condition value is nil
    
        case key
        when :log_id
          conditions_query << "id = ?"
          values << value
        when :user_id
          conditions_query << "user_id = ?"
          values << value
        when :week
          conditions_query << "strftime('%W', timestamp) = ?"
          values << value
        when :year
          conditions_query << "strftime('%Y', timestamp) = ?"
          values << value
        when :month
          conditions_query << "strftime('%m', timestamp) = ?"
          values << value
        when :day
          conditions_query << "strftime('%d', timestamp) = ?"
          values << value
        when :week_day
          conditions_query << "strftime('%w', timestamp) = ?"
          values << value
        end
      end
    
      # If no conditions were provided, return an empty result
      return [] if conditions_query.empty?
    
      # Construct the final query and pass the entire array of values as a single parameter
      query = "#{base_query} #{conditions_query.join(' AND ')}"
      @db.execute(query, values)
    end    

    def fetch_associated_data(log_ids)
      log_answers = @db.execute("SELECT * FROM logsanswers WHERE log_id IN (#{log_ids.join(',')})")
      question_ids = log_answers.map { |answer| answer['question_id'] }.uniq
      log_questions = @db.execute("SELECT * FROM questions WHERE id IN (#{question_ids.join(',')})")
      log_comments = @db.execute("SELECT * FROM comments WHERE log_id IN (#{log_ids.join(',')})")
      comment_ids = log_comments.map { |comment| comment['id'] }.uniq
      read_comments = @db.execute("SELECT * FROM readcomments WHERE comment_id IN (#{comment_ids.join(',')})")
    
      { answers: log_answers, questions: log_questions, comments: log_comments, readcomments: read_comments }
    end
  end

  configure do
    enable :cross_origin
  end

  before do
    response.headers['Access-Control-Allow-Origin'] = '*'
    content_type :json
  end

  options "*" do
    response.headers["Access-Control-Allow-Methods"] = "GET, PUT, POST, PATCH, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Location, Accept, X-User-Email, X-Auth-Token"
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Expose-Headers"] = "Location, Link"
    200
  end

  # Define routes

  # GET users
  get '/api/v1/users/?' do
    p "Getting all users"
    if authenticated?
      @db.execute('SELECT id, username, email, role, teacher_id FROM users').to_json
    else
      unauthorized_response
    end
  end

  # GET user by ID
  get '/api/v1/users/:id/?' do
    p "Getting user: #{params['id']}"
    if authenticated?
      @db.execute('SELECT id, username FROM users WHERE id = ? LIMIT 1', params['id']).first.to_json
    else
      unauthorized_response
    end
  end

  # Get all teachers
  get '/api/v1/teachers/?' do
    p "Getting all teachers"
    if authenticated?
      @db.execute('SELECT id, username FROM users WHERE role <= ?', 2).to_json
    else
      unauthorized_response
    end
  end

  # Get all students
  get '/api/v1/students/?' do
    p "Getting all students"
    if authenticated?
      @db.execute('SELECT id, username FROM users WHERE role = ?', 3).to_json
    else
      unauthorized_response
    end
  end

  # Fetch logs
  get '/api/v1/log' do
    log_id = params['id']
    user_id = params['user']
    week = params['week']
    week_day = params['weekDay']
    year = params['year']
    month = params['month']
    day = params['day']
  
    if authenticated?
      if log_id
        log_data = @db.execute("SELECT * FROM logs WHERE id = ?", log_id).first
        if log_data.nil?
          return { status: 'error', message: 'Log not found' }.to_json
        end
        associated_data = fetch_associated_data([log_id])
        return { status: 'success', data: { log: log_data, **associated_data } }.to_json
      end
  
      conditions = { user_id: user_id, week: week, month: month, day: day, year: year, week_day: week_day }
      log_data = fetch_logs_by_conditions(conditions)
  
      if log_data.empty?
        return { status: 'error', message: 'No logs found for the specified criteria' }.to_json
      end
  
      log_ids = log_data.map { |log| log['id'] }
      associated_data = fetch_associated_data(log_ids)
  
      return { status: 'success', data: { logs: log_data, **associated_data } }.to_json
    else
      return { status: 'error', message: 'Unauthorized' }.to_json
    end
  end
  
  post '/api/v1/users' do
    p "Adding user"
    if authenticated?(1)
      user_data = JSON.parse(request.body.read)
      if !user_data['email'] || !user_data['name'] || !user_data['password'] || !user_data['role'] || user_email_exist?(user_data['email'])
        return unfulfilled_requirements
      end

      encrypted_password = BCrypt::Password.create(user_data['password'])
      @db.execute('INSERT INTO users (username, password, email, role, teacher_id) VALUES (?, ?, ?, ?, ?)', [user_data['name'], encrypted_password, user_data['email'], user_data['role'], user_data['teacherId']])
    else
      unauthorized_response
    end
  end

  # User Sign-in
  post '/api/v1/users/signin' do
    p "Signing in"
    user_data = JSON.parse(request.body.read)
    user = @db.execute('SELECT * FROM users WHERE email = ?', user_data['email']).first
    if user && BCrypt::Password.new(user['password']) == user_data['password']
      token = JWT.encode({ id: user['id'], issued_at: Time.now }, ENV['JWT_SECRET_SIGNING_KEY'])
      { token: token, username: user['username'], id: user['id'], role: user['role'] }.to_json
    else
      unauthorized_response
    end
  end

  # Additional routes like `resetPassword` and `changeTeacher`
  post '/api/v1/user/resetPassword/?' do
    p "Reset user password"
    if authenticated?(1)
      user_data = JSON.parse(request.body.read)
  
      if !user_data['id'] || !user_data['password'] || !user_id_exist?(user_data['id'])
        return unfulfilled_requirements
      end

      encrypted_password = BCrypt::Password.create(user_data['password'])
      p user_data['id']
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

end
