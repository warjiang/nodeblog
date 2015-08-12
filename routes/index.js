var express = require('express');
var router = express.Router();
var crypto = require('crypto'),
	User = require('../models/user.js'),
	Post = require('../models/post.js');


/* GET home page. */
router.get('/', function (req, res, next) {
	Post.get(null,function(err,posts){
		if(err){
			posts = [];
		}
		res.render('index',{
			title: '主页',
			user: req.session.user,
			posts: posts,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});
router.route('/reg')
	.get(function (req, res) {
		console.dir(req.query);
		res.render('reg', {
			title: '注册',
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	})
	.post(function(req,res){
		//console.log(req.body);
		var name = req.body['name'],
			password = req.body['password'],
			password_re = req.body['password-repeat'];
		if(password_re != password){
			console.log('different');
			req.flash('error','两次输入的密码不一致');
			return res.redirect('/reg');
		}
		var md5 = crypto.createHash('md5'),
			passwordMD5 = md5.update(req.body['password']).digest('hex');
		var newUser = new User({
			name: name,
			password: passwordMD5,
			email: req.body['email']
		});
		User.get(newUser.name, function(err,user){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			if(user){
				req.flash('error','用户已存在');
				return res.redirect('/reg');
			}
			newUser.save(function(err,user){
				if(err){
					req.flash('error',err);
					return res.redirect('/reg');
				}
				req.session.user = user;
				req.flash('success','注册成功');
				res.redirect('/');
			});
		});
	});


router.route('/login')
	.get(function (req, res) {
		res.render('login', {
			title: '登录',
			user: req.session.user,
			success:req.flash('success').toString(),
			error:req.flash('error').toString(),
		});
	})
	.post(function (req, res) {
		var md5 = crypto.createHash('md5'),
			password = md5.update(req.body['password']).digest('hex');
		User.get(req.body['name'],function(err, user){
			if(!user){
				req.flash('error','用户不存在!');
				return res.redirect('/login');
			}
			if(user.password != password){
				req.flash('error','密码错误!');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success','登录成功!');
			res.redirect('/');
		});
	});

router.route('/post')
	.get(function (req, res) {
		res.render('post', {
			title: '日志',
			user: req.session.user,
			success: req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	})
	.post(function (req, res) {
		//console.dir(req.session.user);
		var currentUser = req.session.user,
			post = new Post(currentUser.name, req.body['title'],req.body['post']);
		post.save(function(err){
			if(err){
				req.flash('error',err);
				return res.redirect('/');
			}
			req.flash('success','发布成功');
			res.redirect('/');
		});
	});
router.get('/logout', function (req, res) {
	req.session.user = null;
	req.flash('success','登出成功');
	res.redirect('/');
});

module.exports = router;
