const router = require('express').Router()
const passport = require('passport')
const User = require('../models/user.model')
const {followUser,authorize,authenticate, signupUser, loginUser, updateUser, logoutUser,userFollower } = require('../controllers/user.controller')
const { UserRefreshClient } = require('googleapis-common')
const {createMentor,createMentee} = require('../controllers/mentor_mentee_controller')
var MongoClient = require('mongodb').MongoClient;

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/timeline',authenticate, async (req, res) => {
     const user_id = req.user.uid
	 var mongoose = require('mongoose');
     var id = mongoose.Types.ObjectId(user_id);
    console.log(user_id);
	const new_user = await User.findById({_id:id})
	console.log(new_user);
	res.render('user-timeline',{User:new_user})
	// MongoClient.connect('mongodb://localhost:27017', function(err, client) {
    //     if(err) throw err;
    //     var db =client.db("openDB")
    //     var collection = db.collection('users');
	// 	collection.findOne({_id:id},function(founduser){
	// 		console.log(founduser);
	// 		res.render('user-timeline')
	// 	})
		
	// })
    
})

router.get('/register', (req, res) => {
    res.render('register')
})


router.get('/notifications/:id',authenticate, async (req, res) => {
	user_id=req.params.id
    const user = await User.findById({_id:user_id})
	console.log(user);
    res.render('notifications',{User:user})
})

router.get("/viewprofile/:id", async (req,res)=>{
	user_id=req.params.id
       const user = await User.findById({_id:user_id})
	res.render("view-profile",{User:user})
})

router.post('/signup', signupUser)
router.post('/login', loginUser)
router.post('/update/:id', authenticate, updateUser)

router.get('/login/facebook', passport.authenticate('facebook', { scope: 'email' }))
router.get('/callback/facebook', passport.authenticate('facebook', {
	successRedirect: '/',
	failureRedirect: '/api/user/failed/facebook'
}))

router.get("/editprofile/:id",authenticate,async function(req,res){
	const user = await User.findById({_id:req.params.id})
	res.render("edit-profile",{User:user})
})

router.post("/followuser/:id",authenticate,followUser)

router.get("/followers/:id",async function(req,res){
	const user_id = req.params.id
	const user = await User.findById({_id:user_id})
	console.log(user);
	res.render("user-followers",{User:user})
})

router.get('/login/google', passport.authenticate('google', { scope: 'email' }))
router.get('/callback/google', passport.authenticate('google', {
	successRedirect: '/',
	failureRedirect: '/api/user/failed/google'
}))

router.get('/failed/facebook', (req, res)=>res.json({ error: 'Failed to authenticate' }))
router.get('/failed/google', (req, res)=>res.json({ error: 'Failed to authenticate' }))

router.get('/logout',authorize, logoutUser)

router.get("/mentee",authenticate, async function(req,res){
	const user = await User.findById({_id:req.user.uid})
	res.render("pro",{User:user})
})

router.get("/mentor",authenticate,async function(req,res){
	const user = await User.findById({_id:req.user.uid})
	res.render("mentor",{User:user})
})

router.post("/creatementee",authenticate,createMentee)

router.post("/creatementor",authenticate,createMentor)



module.exports = router