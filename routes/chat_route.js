exports.index = async (ctx) => {
  await ctx.render('chat', {
    page_title: '聊天室'
  });
};
