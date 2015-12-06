var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config');
var jsonwebtoken = require('jsonwebtoken')

var secretKey = config.secretKey;

function createToken(user) {
	var token = jsonwebtoken.sign({
		id: user._id,
		name: user.name,
		username: user.username
	}, secretKey, { 
		expiresIn: 1440
	});

	return token;
}

module.exports = function(app, express, io) {

	var api = express.Router();

	/* Layer A */
	api.get('/all_stories', function(request, response) {
		Story.find({}, function(error, stories) {
			if (error) {
				response.send(error);
				return;
			}
			response.json(stories);
		});
	});

	api.post('/signup', function(request, response) {

		var user = new User({
			name: request.body.name,
			username: request.body.username,
			password: request.body.password
		});

		var token = createToken(user);

		user.save(function(error) {			
			
			if(error) {
				response.send(error);
				return;
			}

			response.json({ 
				success: true,
				message: 'User has been created.',
				token: token 
			});
		});
	});

	api.get('/users', function(request, response) {
		User.find({}, function(error, users) {
			if (error) {
				response.send(error);
				return;
			}
			response.json(users);
		});
	});

	api.post('/login', function(request, response) {

		User.findOne({
			username: request.body.username
		}).select('name username password').exec(function(error, user) {

			if (error) throw error;

			if (!user) {
				response.send({ message: "User doesn't exist." });
			} else if (user) {
				var validPassword = user.comparePassword(request.body.password);

				if (!validPassword) {
					response.send({ message: "Invalid password." });
				} else {

					var token = createToken(user);

					response.json({
						success: true,
						message: 'Login successful.',
						token: token
					});
				}
			}
		});
	});

	/* Middle-ware */
	api.use(function(request, response, next) {
		console.log('Somebody just used our app.');

		var token = request.body.token ||
					request.headers['x-access-token'];

		if (token) {
			jsonwebtoken.verify(token, secretKey, function(error, decoded) {
				if (error) {
					response.status(403).send({
						success: false,
						message: 'Failed to authenticate user.'
					});
				} else {
					request.decoded = decoded;
					next();
				}
			});
		} else {
			response.status(403).send({
				success: false,
				message: 'No token provided.'
			});
		}
	});

	/* Layer B */
	api.route('/')

		.post(function(request, response) {
			var story = new Story({
				creator: request.decoded.id,
				content: request.body.content
			});

			story.save(function(error, newStory) {
				if (error) {
					response.send(error);
					return
				}
				io.emit('story', newStory);
				response.json({ message: 'New story created.' });
			});
		})

		.get(function(request, response) {
			Story.find({ creator: request.decoded.id }, function(error, stories) {
				if (error) {
					response.send(error);
					return;
				}
				response.json(stories);
			});
		});

		api.get('/me', function(request, response) {
			response.json(request.decoded);
		});
	return api;
};