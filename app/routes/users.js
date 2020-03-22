const Router = require("koa-router");
const router = new Router({ prefix: "/users" });
const {
  find,
  findById,
  create,
  update,
  delete: del,
  login,
  checkOwner,
  listFollowing,
  follow,
  unfollow,
  listFollowers,
  checkUserExist,
  followTopic,
  unfollowTopic,
  listFollowingTopics,
  listQuestions
} = require("../controllers/users");
const { checkTopicExist } = require("../controllers/topics");
const { secret } = require("../config");
const jwt = require("koa-jwt");

const auth = jwt({ secret });

router.post("/", find);

router.post("/", create);

router.get("/:id", findById);

router.patch("/:id", auth, checkOwner, update);

router.delete("/:id", auth, checkOwner, del);

router.post("/login", login);

router.get("/:id/following", listFollowing);

router.get("/:id/followers", listFollowers);

router.put("/following/:id", auth, checkUserExist, follow);

router.delete("/following/:id", auth, checkUserExist, unfollow);

router.get("/:id/followingTopics", listFollowingTopics);//用户的id

router.put("/followingTopics/:id", auth, checkTopicExist, followTopic);//关注话题的id

router.delete("/followingTopics/:id", auth, checkTopicExist, unfollowTopic);

router.get('/:id/questions',listQuestions)

module.exports = router;
