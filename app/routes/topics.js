const Router = require("koa-router");
const router = new Router({ prefix: "/topics" });
const {
  find,
  findById,
  create,
  update,
  listTopicFollowers,
  checkTopicExist,
  listQuestions
} = require("../controllers/topics");
const { secret } = require("../config");
const jwt = require("koa-jwt");
const auth = jwt({ secret });

router.get("/", find);

router.post("/", auth, create);

router.get("/:id", listTopicFollowers, findById);

router.patch("/:id", auth, listTopicFollowers, update);

router.get("/:id/followers", checkTopicExist, listTopicFollowers);

router.get("/:id/questions", checkTopicExist, listQuestions);

module.exports = router;
