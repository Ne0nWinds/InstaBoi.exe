const app = require('express')();
const session = require('express-session');
const fs = require('fs');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

app.use(session({secret: "tfEamRXNdr"}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const multer = require('multer');
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + "-" + Date.now())
	}
});
const upload = multer({storage:storage});

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/instaspam', { useNewUrlParser: true });

const ImgSchema = new mongoose.Schema({
	Data: Buffer,
	Size: Number,
	Type: {type: String, match: /image\/.+/},
	Likes: []
});
const UserSchema = new mongoose.Schema({
	Email: {type: String, required: true, match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/},
	Username: {type: String, required: true, match: /(?!.*@)\w{4,}/},
	Password: {type: String, required: true, minlength: 4},
	Photos: [ImgSchema],
});

mongoose.model('Img', ImgSchema);
mongoose.model('User', UserSchema);
const Img = mongoose.model('Img');
const User = mongoose.model('User');

app.listen(8000, function() {
	console.log("running");
})

app.post("/upload", upload.single('image'), function(request,response) {
	if (request.session.user == undefined) {
		response.json({ msg : "Error" });
	} else {
		User.findOne({_id:request.session.user})
		.then(this_user => {
		const newImg = new Img();
		newImg.Data = fs.readFileSync(request.file.path);
		newImg.Type = request.file.mimetype;
		newImg.Size = request.file.size;
		this_user.Photos.push(newImg);
		this_user.save((err) => (err) ? response.json(err) : console.log("sucess"));
		console.log("http://localhost:8000/photo/" + request.session.user +  "/" + newImg._id);
		fs.unlink(request.file.path, (err) => {});
		})
	}
});

app.get('/photo/:userId/:photoId', (request,response) => {
	User.findOne({_id:request.params.userId}, (err,user) => {
		if (!err && user !== null) {
				const img = user.Photos.id(request.params.photoId)
				if (img !== null) {
					response.setHeader('Content-Type', img.Type);
					response.setHeader('Content-Length', img.Size);
					response.send(img.Data);
				}
		}
	});
});

app.post('/register', (request,response) => {
	let newUserData = request.body;
	User.findOne({Email:request.body.Email},  function (err, data) {
		if (data === null)
			bcrypt.genSalt(10, function (err,salt) {
				if (err) 
					response.json({ msg: "Error Hashing Password"})
				else
					bcrypt.hash(newUserData.Password, salt, function (err, hash) {
						if (err) {
							response.json({ msg: "Error Hashing Password"})
						} else {
							newUserData.Email = newUserData.Email.toLowerCase();
							newUserData.Password = hash;
							let user = new User(newUserData);
							user.save((err,data) => {
								if (!err) {
									request.session.user = data._id;
									response.json({ msg : "Account Created Successfully"});
								} else
									response.json(err);
							});
						}
					})
			})
		else
			response.json({ msg: "Duplicate Email" });
    })
});

app.post('/login', (request,response) => {
	let login = {};
	if (/.*@.*/.test(request.body.Login))
		login.Email = request.body.Login.toLowerCase();
	else
		login.Username = request.body.Login;

	User.findOne(login, function (err,userData) {
		if (!userData)
			if ('Email' in login)
				response.json({ msg : "Email Not Found" });
			else
				response.json({ msg : "Username Not Found" });
		else
			bcrypt.compare(request.body.Password, userData.Password, (err,isMatch) => {
				if (isMatch) {
					request.session.user = userData._id;
					response.json({ msg : "Login Successful"});
				} else
					response.json({ msg : "Incorrect Password"});
			});
	});
});

app.get('/logout', (request,response) => {
	request.session.destroy();
	response.json({ msg : "User Logged Out" });
});

app.post('/findUser', (request,response) => {
	let login = {};
	if (/.*@.*/.test(request.body.Login))
		login.Email = request.body.Login;
	else
		login.Username = request.body.Login;

	User.findOne(login, function (err,userData) {
		response.json({ userExists : (userData != null)});
	});
});

app.post('/searchUsers/', async (request, response) => {
	let name = request.body.Login;
	let EmailData = await User.find({Email: {$regex: new RegExp('^' + name), $options: '$i'}}, {Email: 1}).lean();
	let Usernamedata = await User.find({Username: {$regex: new RegExp('^' + name), $options: '$i'}}, {Username: 1}).lean();

	response.json({users:[...EmailData,...Usernamedata]});

});

app.get('/profile/', async (request,response) => {
	if (request.session.user == undefined) {
		response.json({ msg : "Error" });
	} else {
		const user = await User.findOne({_id:request.session.user}, {_id: 1, Username: 1, Photos: 1}).lean();
		user.Photos.sort((a,b) => (a._id < b._id));
		if (user) response.json(user);
		else response.json({ msg : "Error"});
	}
});

app.get('/photos/:number', async (request,response) => {
/*	if (request.session.user == undefined) {
		response.json({ msg : "Error" });
	} else { */
		let number = (request.params.number) ? request.params.id : 1;
		let output = {};
		output.users = await User.find({}, {_id: 1,Username: 1,Photos: {$slice: [-1,1]}}).sort({_id : -1}).lean();
		output.this_user = request.session.user;
		response.json(output);
//	}
});

app.get('/like/:UserId/:photoId', async (request, response) => {
	if (request.session.user == undefined) {
		response.json({ msg : "Error" });
	} else {
	const user = await User.findOne({_id:request.params.UserId});
	if (user != undefined) {
		const img = user.Photos.id(request.params.photoId);
		let hasLiked = false;
		let i = 0; let len = img.Likes.length;
		for (;i < len;i++) {
			if (img.Likes[i] == request.params.UserId) {
				img.Likes.splice(i,1);
				hasLiked = true;
				break;
			}
		}
		if (!hasLiked) img.Likes.push(request.session.user);
		user.save();
		response.json({ liked: !hasLiked });
	}
	}
});
