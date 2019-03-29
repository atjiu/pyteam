exports.index = async (ctx) => {
  await ctx.redirect('/admin/user/list');
};
