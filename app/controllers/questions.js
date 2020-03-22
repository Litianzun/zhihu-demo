const Question = require("../models/questions");

class QusetionsCtrl {
  async find(ctx) {
    const { per_page = 10 } = ctx.query;
    const page = Math.max(ctx.query.page * 1, 1) - 1;
    const perPage = Math.max(per_page * 1, 1);
    const q = new RegExp(ctx.request.q);
    ctx.body = await Question.find({
      $or: [{ title: q }, { description: q }]
    })
      .limit(perPage)
      .skip(page * perPage);
  }
  async findById(ctx) {
    ctx.body = await Question.findById(ctx.params.id).populate('topics questioner'); //查询包含questioner字段,questioner会展开（全部数据）
  }
  async checkQuestionExist(ctx, next) {
    const question = await Question.findById(ctx.params.id)
    if (!question) {
      ctx.throw(404, "问题不存在");
    }
    console.log(question)
    ctx.state.question = question;
    await next();
  }
  async checkQuestioner(ctx, next) {
    const { question } = ctx.state;
    // console.log(ctx.state.question)
    if (question.questioner.toString() !== ctx.state.user._id) {
      ctx.throw(403, "没有权限");
    }
    await next();
  }
  async create(ctx) {
    ctx.verifyParams({
      title: { type: "string", required: true },
      description: { type: "string", required: false }
    });
    const question = await new Question({
      ...ctx.request.body,
      questioner: ctx.state.user._id
    }).save();
    ctx.body = question;
  }
  async update(ctx) {
    ctx.verifyParams({
      title: { type: "string", required: true },
      description: { type: "string", required: false }
    });
    console.log(ctx.state)
    const question = await Question.findByIdAndUpdate(ctx.params.id, {
      ...ctx.request.body,
      questioner: ctx.params.id
    });
    ctx.body = question;
  }
  async delete(ctx) {
    const question = await Question.findByIdAndRemove(ctx.params.id);
    if (!question) {
      ctx.throw(404, "问题不存在");
    }
    ctx.status = 204;
  }
}

module.exports = new QusetionsCtrl();
