/*

blue lays


********* Product ******

  SKU: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    // allowNull: false
  },
  productImages: {
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
  status: {//active or non-active
    type: DataTypes.STRING,
    // allowNull: false,
  },
  variants : [Variant]




************* variant  ****************

{
  title: { //title -> wieght / size
    type: DataTypes.STRING,
    // allowNull: false
  },
  name: { // 200gm ...
    type: DataTypes.STRING,
    // allowNull: false
  },
  priceOffer: {
    type: DataTypes.DOUBLE,
  },
  priceOriginal: {
    type: DataTypes.DOUBLE,
    // allowNull: false
  },
  inventoryQuantity: {
    type: DataTypes.DOUBLE,
    // allowNull: false
  },
  status: {//active or nonactive
    type: DataTypes.STRING,
    // allowNull: false
  },
  SKU: {
    type: DataTypes.STRING,
    allowNull: false
  }
}



************* shopping cart  ****************

{
  quantity: {
    type: DataTypes.DOUBLE,
    allowNull: false
  },
  anonymousUserId: {
    type: DataTypes.STRING,
  }
  userId: {}
  VariantId: {}
  ProductId: {}
}



************* variant  ****************
************* variant  ****************

*/