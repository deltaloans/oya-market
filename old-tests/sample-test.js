const { expect } = require("chai");
const OyaOrder = require('../artifacts/OyaOrder');
const OyaController = require('../artifacts/OyaController');
const Token = require('../artifacts/Token');

describe("Controller", function() {
  it("Controller should be able to deploy order contract", async function() {
    const [oya, buyer, seller, arbitrator, updater] = await ethers.getSigners();
    const provider = ethers.getDefaultProvider();
    buyerAddress = await buyer.getAddress();
    sellerAddress = await seller.getAddress();
    arbitratorAddress = await arbitrator.getAddress();
    updaterAddress = await updater.getAddress();
    const Dai = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const LinkToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaControllerFactory = new ethers.ContractFactory(
      OyaController.abi,
      OyaController.bytecode,
      oya
    );

    const daiToken = await Dai.deploy("Dai", "DAI");
    await daiToken.deployed();

    await daiToken.mint(buyerAddress, 100);
    let buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);

    const linkToken = await LinkToken.deploy("Link", "LINK");
    await linkToken.deployed();

    const oyaToken = await OyaToken.deploy("Oya", "OYA");
    await oyaToken.deployed();

    const controller = await OyaControllerFactory.deploy(updaterAddress);
    await controller.deployed();
    await controller.connect(updater).setToken(oyaToken.address);
    await controller.connect(updater).setArbitrator(arbitratorAddress);
    await controller.connect(updater).setRewardAmount(10);

    await oyaToken.connect(oya).grantRole(
      ethers.utils.id("MINTER_ROLE"),
      controller.address
    );

    await daiToken.connect(buyer).approve(controller.address, 100);

    let orderAddress;

    let tx = await controller.connect(buyer).createOrder(
      buyerAddress,
      sellerAddress,
      daiToken.address,
      100,
      linkToken.address
    );

    controller.on("OrderCreated", (newOrder, event) => {
      orderAddress = newOrder;
      event.removeListener();
    });

    await tx.wait(1);

    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(0);

    controllerBalance = await daiToken.balanceOf(controller.address);
    expect(controllerBalance).to.equal(0);

    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(100);
  });
});

describe("Order", function() {
  it("Seller should be able to set tracking information", async function() {
    const [oya, buyer, seller, arbitrator, updater] = await ethers.getSigners();
    const provider = ethers.getDefaultProvider();
    buyerAddress = await buyer.getAddress();
    sellerAddress = await seller.getAddress();
    arbitratorAddress = await arbitrator.getAddress();
    updaterAddress = await updater.getAddress();
    const Dai = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const LinkToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaControllerFactory = new ethers.ContractFactory(
      OyaController.abi,
      OyaController.bytecode,
      oya
    );

    const daiToken = await Dai.deploy("Dai", "DAI");
    await daiToken.deployed();

    await daiToken.mint(buyerAddress, 100);
    let buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);

    const linkToken = await LinkToken.deploy("Link", "LINK");
    await linkToken.deployed();

    const oyaToken = await OyaToken.deploy("Oya", "OYA");
    await oyaToken.deployed();

    const controller = await OyaControllerFactory.deploy(updaterAddress);
    await controller.deployed();
    await controller.connect(updater).setToken(oyaToken.address);
    await controller.connect(updater).setArbitrator(arbitratorAddress);
    await controller.connect(updater).setRewardAmount(10);

    await oyaToken.connect(oya).grantRole(
      ethers.utils.id("MINTER_ROLE"),
      controller.address
    );

    await daiToken.connect(buyer).approve(controller.address, 100);

    let orderAddress;

    let tx = await controller.connect(buyer).createOrder(
      buyerAddress,
      sellerAddress,
      daiToken.address,
      100,
      linkToken.address
    );

    controller.on("OrderCreated", (newOrder, event) => {
      orderAddress = newOrder;

      event.removeListener();
    });

    await tx.wait(1);

    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(0);

    controllerBalance = await daiToken.balanceOf(controller.address);
    expect(controllerBalance).to.equal(0);

    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(100);

    const order = new ethers.Contract(orderAddress, OyaOrder.abi, provider);

    await order.connect(seller).setTracking(
      ethers.utils.formatBytes32String("USPS"),
      ethers.utils.formatBytes32String("954901983837217")
    );

    const trackingInfo = await order.connect(buyer).getTracking();
    expect(ethers.utils.parseBytes32String(trackingInfo[0])).to.equal("USPS");
    expect(ethers.utils.parseBytes32String(trackingInfo[1])).to.equal("954901983837217");

    let sellerBalance = await daiToken.balanceOf(sellerAddress);
  });

  it("Buyer should be able to cancel order", async function() {
    const [oya, buyer, seller, arbitrator, updater] = await ethers.getSigners();
    const provider = ethers.getDefaultProvider();
    buyerAddress = await buyer.getAddress();
    sellerAddress = await seller.getAddress();
    arbitratorAddress = await arbitrator.getAddress();
    updaterAddress = await updater.getAddress();
    const Dai = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const LinkToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaControllerFactory = new ethers.ContractFactory(
      OyaController.abi,
      OyaController.bytecode,
      oya
    );

    const daiToken = await Dai.deploy("Dai", "DAI");
    await daiToken.deployed();

    await daiToken.mint(buyerAddress, 100);
    let buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);

    const linkToken = await LinkToken.deploy("Link", "LINK");
    await linkToken.deployed();

    const oyaToken = await OyaToken.deploy("Oya", "OYA");
    await oyaToken.deployed();

    const controller = await OyaControllerFactory.deploy(updaterAddress);
    await controller.deployed();
    await controller.connect(updater).setToken(oyaToken.address);
    await controller.connect(updater).setArbitrator(arbitratorAddress);
    await controller.connect(updater).setRewardAmount(10);

    await oyaToken.connect(oya).grantRole(
      ethers.utils.id("MINTER_ROLE"),
      controller.address
    );

    await daiToken.connect(buyer).approve(controller.address, 100);

    let orderAddress;

    let tx = await controller.connect(buyer).createOrder(
      buyerAddress,
      sellerAddress,
      daiToken.address,
      100,
      linkToken.address
    );

    controller.on("OrderCreated", (newOrder, event) => {
      orderAddress = newOrder;
      event.removeListener();
    });

    await tx.wait(1);

    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(0);

    controllerBalance = await daiToken.balanceOf(controller.address);
    expect(controllerBalance).to.equal(0);

    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(100);

    const order = new ethers.Contract(orderAddress, OyaOrder.abi, provider);

    await order.connect(buyer).cancelOrder();
    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);
    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(0);

    let sellerBalance = await daiToken.balanceOf(sellerAddress);
  });

  it("Seller should be able to cancel order", async function() {
    const [oya, buyer, seller, arbitrator, updater] = await ethers.getSigners();
    const provider = ethers.getDefaultProvider();
    buyerAddress = await buyer.getAddress();
    sellerAddress = await seller.getAddress();
    arbitratorAddress = await arbitrator.getAddress();
    updaterAddress = await updater.getAddress();
    const Dai = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const LinkToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaControllerFactory = new ethers.ContractFactory(
      OyaController.abi,
      OyaController.bytecode,
      oya
    );

    const daiToken = await Dai.deploy("Dai", "DAI");
    await daiToken.deployed();

    await daiToken.mint(buyerAddress, 100);
    let buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);

    const linkToken = await LinkToken.deploy("Link", "LINK");
    await linkToken.deployed();

    const oyaToken = await OyaToken.deploy("Oya", "OYA");
    await oyaToken.deployed();

    const controller = await OyaControllerFactory.deploy(updaterAddress);
    await controller.deployed();
    await controller.connect(updater).setToken(oyaToken.address);
    await controller.connect(updater).setArbitrator(arbitratorAddress);
    await controller.connect(updater).setRewardAmount(10);

    await oyaToken.connect(oya).grantRole(
      ethers.utils.id("MINTER_ROLE"),
      controller.address
    );

    await daiToken.connect(buyer).approve(controller.address, 100);

    let orderAddress;

    let tx = await controller.connect(buyer).createOrder(
      buyerAddress,
      sellerAddress,
      daiToken.address,
      100,
      linkToken.address
    );

    controller.on("OrderCreated", (newOrder, event) => {
      orderAddress = newOrder;
      event.removeListener();
    });

    await tx.wait(1);

    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(0);

    controllerBalance = await daiToken.balanceOf(controller.address);
    expect(controllerBalance).to.equal(0);

    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(100);

    const order = new ethers.Contract(orderAddress, OyaOrder.abi, provider);

    await order.connect(seller).cancelOrder();
    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);
    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(0);

    let sellerBalance = await daiToken.balanceOf(sellerAddress);
  });

  it("Seller should be able to get paid if buyer accepts item", async function() {
    const [oya, buyer, seller, arbitrator, updater] = await ethers.getSigners();
    const provider = ethers.getDefaultProvider();
    buyerAddress = await buyer.getAddress();
    sellerAddress = await seller.getAddress();
    arbitratorAddress = await arbitrator.getAddress();
    updaterAddress = await updater.getAddress();
    const Dai = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const LinkToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaControllerFactory = new ethers.ContractFactory(
      OyaController.abi,
      OyaController.bytecode,
      oya
    );

    const daiToken = await Dai.deploy("Dai", "DAI");
    await daiToken.deployed();

    await daiToken.mint(buyerAddress, 100);
    let buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);

    const linkToken = await LinkToken.deploy("Link", "LINK");
    await linkToken.deployed();

    const oyaToken = await OyaToken.deploy("Oya", "OYA");
    await oyaToken.deployed();

    const controller = await OyaControllerFactory.deploy(updaterAddress);
    await controller.deployed();
    await controller.connect(updater).setToken(oyaToken.address);
    await controller.connect(updater).setArbitrator(arbitratorAddress);
    await controller.connect(updater).setRewardAmount(10);

    await oyaToken.connect(oya).grantRole(
      ethers.utils.id("MINTER_ROLE"),
      controller.address
    );

    await daiToken.connect(buyer).approve(controller.address, 100);

    let orderAddress;

    let tx = await controller.connect(buyer).createOrder(
      buyerAddress,
      sellerAddress,
      daiToken.address,
      100,
      linkToken.address
    );

    controller.on("OrderCreated", (newOrder, event) => {
      orderAddress = newOrder;
      event.removeListener();
    });

    await tx.wait(1);

    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(0);

    controllerBalance = await daiToken.balanceOf(controller.address);
    expect(controllerBalance).to.equal(0);

    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(100);

    const order = new ethers.Contract(orderAddress, OyaOrder.abi, provider);

    await order.connect(buyer).acceptItem();

    let sellerBalance = await daiToken.balanceOf(sellerAddress);
    expect(sellerBalance).to.equal(100);
    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(0);

    let sellerRewards = await oyaToken.balanceOf(sellerAddress);
    expect(sellerRewards).to.equal(10);
    let buyerRewards = await oyaToken.balanceOf(buyerAddress);
    expect(buyerRewards).to.equal(10);
  });

  it("Buyer should be able to get paid if arbitrator rules in their favor", async function() {
    const [oya, buyer, seller, arbitrator, updater] = await ethers.getSigners();
    const provider = ethers.getDefaultProvider();
    buyerAddress = await buyer.getAddress();
    sellerAddress = await seller.getAddress();
    arbitratorAddress = await arbitrator.getAddress();
    updaterAddress = await updater.getAddress();
    const Dai = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const LinkToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaControllerFactory = new ethers.ContractFactory(
      OyaController.abi,
      OyaController.bytecode,
      oya
    );

    const daiToken = await Dai.deploy("Dai", "DAI");
    await daiToken.deployed();

    await daiToken.mint(buyerAddress, 100);
    let buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);

    const linkToken = await LinkToken.deploy("Link", "LINK");
    await linkToken.deployed();

    const oyaToken = await OyaToken.deploy("Oya", "OYA");
    await oyaToken.deployed();

    const controller = await OyaControllerFactory.deploy(updaterAddress);
    await controller.deployed();
    await controller.connect(updater).setToken(oyaToken.address);
    await controller.connect(updater).setArbitrator(arbitratorAddress);
    await controller.connect(updater).setRewardAmount(10);

    await oyaToken.connect(oya).grantRole(
      ethers.utils.id("MINTER_ROLE"),
      controller.address
    );

    await daiToken.connect(buyer).approve(controller.address, 100);

    let orderAddress;

    let tx = await controller.connect(buyer).createOrder(
      buyerAddress,
      sellerAddress,
      daiToken.address,
      100,
      linkToken.address
    );

    controller.on("OrderCreated", (newOrder, event) => {
      orderAddress = newOrder;
      event.removeListener();
    });

    await tx.wait(1);

    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(0);

    controllerBalance = await daiToken.balanceOf(controller.address);
    expect(controllerBalance).to.equal(0);

    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(100);

    const order = new ethers.Contract(orderAddress, OyaOrder.abi, provider);

    await order.connect(seller).acceptOrder();
    await order.connect(buyer).demandRefund();
    await order.connect(arbitrator).settleDispute(buyerAddress);

    let sellerBalance = await daiToken.balanceOf(sellerAddress);
    expect(sellerBalance).to.equal(0);
    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);
    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(0);
  });

  it("Seller should be able to get paid if arbitrator rules in their favor", async function() {
    const [oya, buyer, seller, arbitrator, updater] = await ethers.getSigners();
    const provider = ethers.getDefaultProvider();
    buyerAddress = await buyer.getAddress();
    sellerAddress = await seller.getAddress();
    arbitratorAddress = await arbitrator.getAddress();
    updaterAddress = await updater.getAddress();
    const Dai = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const LinkToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaToken = new ethers.ContractFactory(
      Token.abi,
      Token.bytecode,
      oya
    );
    const OyaControllerFactory = new ethers.ContractFactory(
      OyaController.abi,
      OyaController.bytecode,
      oya
    );

    const daiToken = await Dai.deploy("Dai", "DAI");
    await daiToken.deployed();

    await daiToken.mint(buyerAddress, 100);
    let buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(100);

    const linkToken = await LinkToken.deploy("Link", "LINK");
    await linkToken.deployed();

    const oyaToken = await OyaToken.deploy("Oya", "OYA");
    await oyaToken.deployed();

    const controller = await OyaControllerFactory.deploy(updaterAddress);
    await controller.deployed();
    await controller.connect(updater).setToken(oyaToken.address);
    await controller.connect(updater).setArbitrator(arbitratorAddress);
    await controller.connect(updater).setRewardAmount(10);

    await oyaToken.connect(oya).grantRole(
      ethers.utils.id("MINTER_ROLE"),
      controller.address
    );

    await daiToken.connect(buyer).approve(controller.address, 100);

    let orderAddress;

    let tx = await controller.connect(buyer).createOrder(
      buyerAddress,
      sellerAddress,
      daiToken.address,
      100,
      linkToken.address
    );

    controller.on("OrderCreated", (newOrder, event) => {
      orderAddress = newOrder;
      event.removeListener();
    });

    await tx.wait(1);

    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(0);

    controllerBalance = await daiToken.balanceOf(controller.address);
    expect(controllerBalance).to.equal(0);

    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(100);

    const order = new ethers.Contract(orderAddress, OyaOrder.abi, provider);

    await order.connect(seller).acceptOrder();
    await order.connect(buyer).demandRefund();
    await order.connect(arbitrator).settleDispute(sellerAddress);

    let sellerBalance = await daiToken.balanceOf(sellerAddress);
    expect(sellerBalance).to.equal(100);
    buyerBalance = await daiToken.balanceOf(buyerAddress);
    expect(buyerBalance).to.equal(0);
    orderBalance = await daiToken.balanceOf(orderAddress);
    expect(orderBalance).to.equal(0);
  });
});