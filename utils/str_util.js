exports.randomNum = (min, max) => {
  // Math.random() => [0, 1)
  let num = Math.random() * max + min; // [min, max)
  // Math.ceil();  向上取整
  // Math.floor();  向下取整
  // Math.round();  四舍五入
  return Math.floor(num);
};
