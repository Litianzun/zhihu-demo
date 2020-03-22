const User = require('../models/users')
const Question = require('../models/questions')
const jsonwebtoken = require('jsonwebtoken')
const { secret } = require('../config')

class UsersCtrl{
    async find(ctx){
        ctx.verifyParams({
            limit: { type: 'number', required: true },
            offset: { type: 'number', required: true },
        })
        const limit = ctx.request.body.limit
        const offset = ctx.request.body.offset
        // ctx.body = await User.find({ limit, offset });
        const page = Math.max(offset * 1, 1) -1;
        const perPage = Math.max(limit * 1, 1);
        ctx.body = await User.find({ name: new RegExp(ctx.request.body.q)}).select('+introduction').limit(perPage).skip(page * perPage)
    }
    async findById(ctx){
        const user = await User.findById(ctx.params.id).populate('following locations business employments.company employments.job educations.school educations.major')
        if(!user){
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user;
    }
    async create(ctx){
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true
            },
            password: { type: 'string', required: true }
        })
        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({ name });
        if(repeatedUser){ ctx.throw(409,'用户已经被占用') }
        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
    async checkOwner(ctx,next){
        if(ctx.params.id !== ctx.state.user._id){
            ctx.throw(403,'没有权限!')
        }
        await next();
    }
    async checkUserExist(ctx, next){
        const user = await User.findById(ctx.params.id);
        if(!user){ ctx.throw(404, '用户不存在') }
        await next()
    }
    async update(ctx){
        ctx.verifyParams({
            name: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            business: { type: 'string', required: false },
            employments: { type: 'array', itemType: 'object', required: false },
            educations: { type: 'array', itemType: 'object', required: false }
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        if( !user ){
            ctx.throw(404,'用户不存在')
        }
        ctx.body = user;
    }
    async delete(ctx){
        const user = await User.findByIdAndRemove(ctx.params.id)
        if(!user){
            ctx.throw(404,'用户不存在')
        }
        ctx.status = 204;
    }
    async login(ctx){
        ctx.verifyParams({
            name: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const user = await User.findOne(ctx.request.body)
        if(!user){ ctx.throw(401, '用户名或密码不正确') }
        const { _id, name } = user
        const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d'})
        ctx.body = {token}
    }
    async listFollowing(ctx){
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if(!user){ ctx.throw(404, '用户不存在'); }
        ctx.body = user.following;
    }
    async listFollowers(ctx){
        const users = await User.find({ following: ctx.params.id });
        ctx.body = users
    }
    async follow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+following')
        if(!me.following.map( id => id.toString() ).includes(ctx.params.id)){
            me.following.push(ctx.params.id)
            me.save()
        }else {
            ctx.throw(403, '已关注过此人!')
        }
        ctx.status = 204;
    }
    async unfollow(ctx){
        const me = await User.findById(ctx.state.user._id).select('+following')
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.following.splice(index,1)
            me.save()
        }
        ctx.status = 204;
    }
    async followTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        if(!me.followingTopics.map( id => id.toString() ).includes(ctx.params.id)){
            me.followingTopics.push(ctx.params.id)
            me.save()
        }else {
            ctx.throw(403, '已关注过此话题!')
        }
        ctx.status = 204;
    }
    async unfollowTopic(ctx){
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
        if(index > -1){
            me.followingTopics.splice(index,1)
            me.save()
        }
        ctx.status = 204;
    }
    async listFollowingTopics(ctx){
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
        if(!user){ ctx.throw(404, '用户不存在'); }
        ctx.body = user.followingTopics;
    }
    async listQuestions(ctx){
        const questions = await Question.find({questioner: ctx.params.id});
        ctx.body = questions
    }
}

module.exports = new UsersCtrl()