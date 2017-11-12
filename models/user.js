module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: DataTypes.STRING,
    coins: DataTypes.INTEGER,
    breads: DataTypes.INTEGER,
    carrots: DataTypes.INTEGER,
    diamond: DataTypes.INTEGER,
  });

  return User;
};
