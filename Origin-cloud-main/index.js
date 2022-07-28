// const connectToMongo = require('./db');
const express = require('express');


const app = express()
var cors = require('cors')
const jwt = require('jsonwebtoken')
const LocalStorage = require("node-localstorage").LocalStorage
localStorage = new LocalStorage('./Cookies');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const flash = require('connect-flash');
const authUser = require('./middleware/authUser');
const cookieparser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
// const mongoose = require('mongoose')
const FacebookStrategy = require('passport-facebook').Strategy
const GoogleStrategy = require('passport-google-oauth2').Strategy
const User = require('./models/user.model')
// require("dotenv").config()
// Routes
const address = require("address")
// const iplocate = require("iplocation")
const ipLocate = require("node-iplocate")

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs')

const userpostRoute = require('./routes/userpost_routes')
const userRoute = require('./routes/user.route')
const groupRoute = require('./routes/group.route')
const postRoute = require('./routes/post.route')

// const PORT = process.env.PORT
const DB_URI = process.env.DB_URI
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(require("express-session")({
    secret: "The milk would do that",
    resave: false,
    saveUninitialized: false
}));

app.use(session({
	secret: process.env.SECRET
}))

app.use(flash());
app.use(function (req, res, next) {
    res.locals.message = req.flash();
    next();
});






// Middleware



require('dotenv').config();
const mongoURI = process.env.DATABASE;

const connectToMongo = () => {
    mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log("Connected");
}
// connected with database
connectToMongo();

app.use(passport.initialize())
app.use(passport.session())

// const mongostring = process.env.DATABASE_URL

// mongoose.connect(mongostring,{useNewUrlParser: true},{useUnifiedTopology: true})

// const database = mongoose.connection

// database.on('error', (error) => {
//     console.log(error)
// })

// database.once('connected', () => {
//     console.log('Database Connected');
// })

// ipLocate(address.ip()).then(function(results) {
// 	console.log(JSON.stringify(results, null, 2));
//   });

// iplocate("8.8.8.8").then(function(result) {
// 	console.log(result) // "Some User token"
// })

// console.log(address.ip())

// (async () => {
// 	await ipLocation(address.ip());
// 	//=> { latitude: -33.8591, longitude: 151.2002, region: { name: "New South Wales" ... } ... }
// })();

const queroutes = require("./routes/queroutes.js")

const adroutes = require("./routes/ads_routes.js")

const adminroutes = require("./routes/admin_routes.js")

// app.use("/",routes)
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
	done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
	  done(err, user);
	});
  });
  app.use(express.json());

passport.use(new GoogleStrategy(
	{
		clientID: process.env.GGL_CLIENT_ID,
		clientSecret: process.env.GGL_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/user/auth/google/callback',
		userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
		passReqToCallback: true		
	},
	async (req,accessToken, refreshToken, profile, done) => {
		console.log(profile.email)
		try {
			const user = await User.findOne({email:profile.email})
			console.log(profile.email)
			if (user) { 
				console.log(user._id)
			    req.user=user
				done(null, user)
			} else {
				const newUser = new User({
					email:profile.email,
					avatar:profile.picture,
					name:profile.displayName,
					gender:profile.gender
				})
				await newUser.save()
				console.log(newUser)
				req.user=newUser
				// const currentUser = await User.findOne({email})
				done(null, newUser)
			}
		} catch(error) {
			// done(error)
		}
	}
))





passport.use(new FacebookStrategy(
	{
		clientID: process.env.FB_CLIENT_ID,
		clientSecret: process.env.FB_CLIENT_SECRET,
		callbackURL: 'http://localhost:3000/user/auth/callback/facebook',
		profileFields: [ 'id', 'displayName', 'gender', 'email', 'picture.type(large)' ]
	},
	async (req,token, refreshToken, profile, done) => {
		try {
			const email = profile.emails[0].value
			const user = await User.findOne({ email })
			if (user) {
				req.user = user
				done(null, user)
			} else {
				const newUser = new User({
					name: profile.displayName,
					email: email,
					gender: profile.gender,
					birthday: profile.birthday,
					avatar: profile.photos[0].value
				})
				await newUser.save()
				req.user=newUser
				done(null, user)
			}
		} catch(error) {
			done(error)
		}
	}
))


// passport.serializeUser((user, done) => {
// 	done(null, user)
// })

// passport.deserializeUser((user, done) => {
// 	done(null, {...user, uid: user._id})
// })
app.use('/admin', adminroutes)
app.use('/ad', adroutes)
app.use('/', queroutes)
app.use('/userpost', userpostRoute)
app.use('/user', userRoute)
app.use('/groups', groupRoute)
app.use('/post', postRoute)

// app.get('/grouphome', (req, res) => {
// 	// console.log(req.user)
// 	res.render("user-groups")
// })

// app.get('/grouptimeline', (req, res) => {
// 	console.log(req.user)
// 	res.render("groups-timeline")
// })

// app.get('/groupfollowers', (req, res) => {
// 	console.log(req.user)
// 	res.render("group-followers")
// })

// app.get('/userfollowers', (req, res) => {
// 	console.log(req.user)
// 	res.render("user-followers")
// })

// app.get('/usertimeline', (req, res) => {
// 	console.log(req.user)
// 	res.render("user-timeline")
// })

// app.get('/viewprofile', (req, res) => {
// 	console.log(req.user)
// 	res.render("view-profile")
// })

app.get("/pro",function(req,res){
    res.render("pro")
})

app.listen(port, () => {
    console.log(`App is listening on port http://localhost:${port}`);
})




// mongoose.connect(DB_URI,{useNewUrlParser: true,
// 	useUnifiedTopology: true})
// 		console.log('Connected to database.')
		// const server = app.listen(port, () => {
		// 	console.log('Server listening on port:', port)
		// })

		// const gracefulShutdown = signal => {
		// 	process.on(signal, async () => {
		// 		server.close()
		// 		await mongoose.disconnect()
		// 		console.log('Database Disconnected.')
		// 		console.log('Server Closed:', signal)
		// 		process.exit(0)
		// 	})
		// }

		// ["SIGTERM", "SIGINT"].forEach(signal => gracefulShutdown(signal))



// require('dotenv').config()
// const express = require('express')


// const app = express()
// app.use(express.json())
// app.use(cookieparser())
// app.use(session({
// 	secret: process.env.SECRET
// }))
// app.use(passport.initialize())
// app.use(passport.session())

// passport.use(new FacebookStrategy(
// 	{
// 		clientID: process.env.FB_CLIENT_ID,
// 		clientSecret: process.env.FB_CLIENT_SECRET,
// 		callbackURL: '/api/user/callback/facebook',
// 		profileFields: [ 'id', 'displayName', 'gender', 'email', 'picture.type(large)' ]
// 	},
// 	async (token, refreshToken, profile, done) => {
// 		try {
// 			const email = profile.emails[0].value
// 			const user = await User.findOne({ email })
// 			if (user) {
// 				done(null, user)
// 			} else {
// 				const newUser = new User({
// 					name: profile.displayName,
// 					email: email,
// 					gender: profile.gender,
// 					birthday: profile.birthday,
// 					avatar: profile.photos[0].value
// 				})
// 				await newUser.save()
// 				done(null, user)
// 			}
// 		} catch(error) {
// 			done(error)
// 		}
// 	}
// ))

// passport.use(new GoogleStrategy(
// 	{
// 		clientID: process.env.GGL_CLIENT_ID,
// 		clientSecret: process.env.GGL_CLIENT_SECRET,
// 		callbackURL: '/api/user/callback/google',
// 		passReqToCallback: true,
// 		profileFields: [ 'id', 'displayName', 'gender', 'email', 'picture.type(large)' ]
// 	},
// 	async (request, token, refreshToken, profile, done) => {
// 		const { email, picture: avatar } = profile
// 		try {
// 			const user = await User.findOne({ email })
// 			if (user) {
// 				done(null, user)
// 			} else {
// 				const newUser = new User({
// 					email,
// 					avatar
// 				})
// 				await newUser.save()
// 				done(null, newUser)
// 			}
// 		} catch(error) {
// 			done(error)
// 		}
// 	}
// ))

// passport.serializeUser((user, done) => {
// 	done(null, user)
// })

// passport.deserializeUser((user, done) => {
// 	done(null, {...user, uid: user._id})
// })

// app.use('/api/user', userRoute)
// app.use('/api/group', groupRoute)
// app.use('/api/post', postRoute)

// app.get('/grouphome', (req, res) => {
// 	console.log(req.user)
// 	res.json({
// 		message: "Home"
// 	})
// })

// mongoose.connect(DB_URI, error => {
// 	if (error) {
// 		console.log('Failed to connect to database.')
// 	} else {
// 		console.log('Connected to database.')
// 		const server = app.listen(port, () => {
// 			console.log('Server listening on port:', port)
// 		})

// 		const gracefulShutdown = signal => {
// 			process.on(signal, async () => {
// 				server.close()
// 				await mongoose.disconnect()
// 				console.log('Database Disconnected.')
// 				console.log('Server Closed:', signal)
// 				process.exit(0)
// 			})
// 		}

// 		["SIGTERM", "SIGINT"].forEach(signal => gracefulShutdown(signal))
// 	}
// })