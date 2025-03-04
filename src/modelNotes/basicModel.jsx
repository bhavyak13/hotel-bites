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



************* Orders  ****************

{
    orderId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,// created -> attempted -> paymentdone? -> paid/captured 
      // -> created -> preparing -> out for delivery -> delivered
      allowNull: false
    },
    finalPrice: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
    },
    razorpayPaymentStatus: {
      type: DataTypes.STRING,
    },
    razorpayPaymentId: {
      type: DataTypes.STRING
    },
    userId,
    purchasedItems:[]
  }

************* storerazorpaysuccesspayments  ****************

  const storerazorpaysuccesspayments = sequelizeClient.define('storerazorpaysuccesspayments', {
    razorpayPaymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    razorpaySignature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderId,
  }


*/