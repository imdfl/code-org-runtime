import { ISJSTicker } from '../emulator/interfaces/sjs';
import { createWorld, createSprite, fill, noFill, noStroke, stroke, rect, ellipse,
	text, textFont, textSize, background, keyDown, keyWentDown, keyWentUp,
	mouseIsOver, mousePressedOver, mouseWentDown, drawSprites,
	getKeyValue, setKeyValue, log, playSound, randomNumber, strokeWeight } from "../emulator/api.js";

(function($: JQueryStatic, imagesPath: string) {
	$(() => {

		const World = createWorld(imagesPath);


		/************************* Begin client code ****************************** */


		playSound("2013-10-20_Preparation_2_-_David_Fesliyan.mp3", true);
		// TODO
		// 1. high score need to work! - ;) Done
		// reset all rocket cap and cooldown changes! - ;) Done
		// opening screen - ;) Done
		// adjust cooldown - ;) Done
		//
		// power Up Tnikiring
		//
		//
		//
		//
		var ndnPowerUpTypes = ["doubleShot", "shield"],
			PLAYING = 2,
			FINALLOSE = 4,
			FINALWIN = 3,
			STARTING = 1,
			OPENING = 0,
			ndnBombs = [],
			ndnRockets = [],
			ndndActivePowerUps = [],
			allButtons = [],
			pauseButton = myCreateButton("animation_1", 300, 18);

		var
			shotsNum = 1,
			shield = false,
			gameState = OPENING,
			bouns = false,
			startButton = false,
			openingDone,
			endMessage,
			rocketCap,
			gameSpeed = 1,
			endReason,
			superShip = myCreateSuperShip("enemyBlack1_1", 10, 15),
			ndnSprites = [],
			ndnOpeningSprites = [],
			endSound = false,
			// defY = 65,
			timer,
			superShipTimer,
			powerUpTimer,
			bombingCooldown,
			cooldownTimer,
			// startSprite = myCreateButton ("animation_4", 300, 18),
			score = 0,
			currentLevel,
			totalScore = 0,
			player,
			pauseSymbol,
			high = 0,
			pauseIndicator = false;

		currentLevel = -1;


		function initLevel() {
			currentLevel++;
			for (let i = 0; i < ndnSprites.length; i++) {
				ndnSprites[i].destroy();
			}
			ndnSprites = [];
			timer = 0;
			superShipTimer = 0;
			bombingCooldown = 0;
			cooldownTimer = 0;
			powerUpTimer = randomNumber(100, 200);
			if (!player) {
				createPlayer();
			}
			else {
				// player.destroy;
			}
			createSprites();
			gameState = PLAYING;
			rocketCap = 30 - currentLevel;
			totalScore += score;
			score = 0;
		}

		function initFirstLevel() {
			currentLevel++;
			for (let i = 0; i < ndnSprites.length; i++) {
				ndnSprites[i].destroy();
			}
			ndnSprites = [];
			timer = 0;
			superShipTimer = 0;
			bombingCooldown = 0;
			cooldownTimer = 0;
			if (!player) {
				createPlayer();
			}
			else {
				player.destroy;
			}
			// defY = 65;
			createSprites();
			gameState = PLAYING;
			rocketCap = 29;
			score = 0;
		}

		function myCreateSprite(name, x, y) {
			let sprite = createSprite(x, y);
			sprite.setAnimation(name);
			sprite.name = name;
			sprite.score = randomNumber(2, 11);
			sprite.scale = 0.25;
			sprite.velocityX = sprite.oldXSpeed = 3 * gameSpeed;
			ndnSprites.push(sprite);
			return sprite;
		}

		function myCreateOpeningSprite(name, x, y) {
			let sprite = createSprite(x, y);
			sprite.setAnimation(name);
			sprite.name = name;
			sprite.scale = 0.25;
			sprite.velocityX = sprite.oldXSpeed = 3 * gameSpeed;
			ndnOpeningSprites.push(sprite);
			return sprite;
		}

		function myCreateBomb(name, x, y) {
			let sprite = createSprite(x, y);
			sprite.setAnimation(name);
			sprite.name = name;
			sprite.scale = 0.3;
			sprite.oldYSpeed;
			sprite.velocityY = 3 * gameSpeed;
			ndnBombs.push(sprite);
			return sprite;
		}

		function myCreateRocket(name, x, y) {
			let sprite = createSprite(x, y);
			sprite.setAnimation(name);
			sprite.name = name;
			sprite.scale = 0.3;
			sprite.oldYSpeed;
			sprite.velocityY = -5 * gameSpeed;
			ndnRockets.push(sprite);
			return sprite;
		}

		function myCreatePlayer(name, x, y) {
			let sprite = createSprite(x, y);
			sprite.setAnimation(name);
			sprite.name = name;
			sprite.scale = 0.31;
			return sprite;
		}

		function myCreateSuperShip(name, x, y) {
			let sprite = createSprite(x, y);
			sprite.setAnimation(name);
			sprite.name = name;
			sprite.isDead = false;
			sprite.velocityX = 5 * gameSpeed;
			sprite.score = randomNumber(10, 30);
			sprite.scale = 0.31;
			return sprite;
		}

		function myCreateButton(name, x, y) {
			let sprite = createSprite(x, y);
			sprite.setAnimation(name);
			sprite.scale = 0.31;
			return sprite;
		}

		function myCreatePowerUp(name, x, y, type) {
			let sprite = createSprite(x, y);
			sprite.setAnimation(name);
			sprite.name = name;
			sprite.scale = 0.3;
			sprite.type = type;
			sprite.oldYSpeed;
			sprite.velocityY = 3.5 * gameSpeed;
			ndndActivePowerUps.push(sprite);
			return sprite;
		}


		//==================================

		/// Begin buttons

		function createButton(options) {
			let sprite = createSprite(options.x, options.y);
			let len = options.text.length;
			sprite.setAnimation("basic-button");
			sprite.width = len * 13;
			allButtons.push({
				name: options.name,
				command: options.command,
				text: options.text,
				sprite: sprite
			});
		}

		function doCommand(cmd) {
			if (cmd === "next-level") {
				deleteButtonByCommand(cmd);
			}
			else if (cmd === "try-again") {
				deleteButtonByCommand(cmd);
				currentLevel = 0;
				highScorer();
				totalScore = 0;
			}
		}

		function deleteButtonByCommand(cmd) {
			for (let i = 0; i < allButtons.length; i++) {
				if (allButtons[i].command === cmd) {
					allButtons[i].sprite.destroy();
					allButtons.splice(i, 1);
					initLevel();
					return;
				}
			}
		}

		function drawAndCheckButtons() {
			let i;
			let button;
			textSize(13);
			for (i = 0; i < allButtons.length; i++) {
				button = allButtons[i];
				fill("white");
				text(button.text, button.sprite.x - 13, button.sprite.y + 2);
			}
			for (i = allButtons.length - 1; i >= 0; i--) {
				button = allButtons[i];
				if (wasClicked(button.sprite)) {
					doCommand(button.command);
					openingDone = true;
				}
			}
		}

		//// End buttons

		function createPlayer() {
			player = myCreatePlayer("playerShip1_green_1", 200, 342);
		}

		// function createPause() {
		// 	let pause = my("animation_1", 200, 342);
		// 	return pause;
		// }

		//function createStart(){
		//  my ("animation_4", 300, 18);
		// startSprite = createSprite(200, 200, 40, 40);
		// startSprite.setAnimation("animation_4");
		//}

		function spritesGoDown(sprites) {
			let sprite;
			for (let i = 0; i < sprites.length; i++) {
				sprite = sprites[i];
				sprite.velocityX = -sprite.velocityX;
				//    sprite.x += sprite.velocityX;
				sprite.y += 10;
			}
			drawSprites();
		}



		function wallIsTouched(sprites) {
			if (sprites.length === 0) {
				return false;
			}
			let lastUsed = sprites[0];
			let sprite;
			let sprite2;
			let firstUsed = sprites[sprites.length - 1];
			for (let i = 0; i < sprites.length; i++) {
				sprite = sprites[i];
				if (sprite.x < lastUsed.x) {
					lastUsed = sprite;
				}
			}
			for (let j = 0; j < sprites.length; j++) {
				sprite2 = sprites[j];
				if (sprite2.x > firstUsed.x) {
					firstUsed = sprite2;
				}
			}
			return (lastUsed.x < 0 || firstUsed.x > 400 || lastUsed.y < 0 || firstUsed.y > 400);
		}


		// function wallIsTouched(sprites) {
		// 	let first = sprites[0];
		// 	let last = sprites[sprites.length - 1];
		// 	if (!first) {
		// 		return false;
		// 	}
		// 	return (first.x < 0 || last.x > 400 || first.y < 0 || last.y > 400);
		// }

		function shooter() {
			if (cooldownTimer <= 0 && keyWentDown("space") && rocketCap > 0) {
				for (let i = 0; i < shotsNum; i++) {
					myCreateRocket("jetpack_1", player.x + i * 10, player.y);
				}
				cooldownTimer += 140;
				rocketCap--;
			}
		}

		function checkKeyboardCommands(sprites) {
			let speedChange = 0;
			if (keyWentDown("up")) {
				gameSpeed++;
				speedChange = 5;
			}
			else if (keyWentDown("down")) {
				gameSpeed--;
				speedChange = -5;
			}
			if (speedChange != 0) {
				sprites.forEach(function (sprite) {
					let v = sprite.velocityX;
					if (v > 0) {
						v += speedChange;
					}
					else {
						v -= speedChange;
					}
					sprite.velocityX = v;
				});
			}
		}



		function movePlayer(player) {
			if (keyDown("left")) {
				player.x -= 3;
			}
			if (keyDown("right")) {
				player.x += 3;
			}
		}


		function fastanator(sprites) {
			for (let i = 0; i < sprites.length; i++) {
				sprites[i].velocityX *= 1.05;
			}
		}

		function addSprite(sprites) {
			let last = sprites[sprites.length - 1];
			let sprite = myCreateSprite(last.name, last.x + 30, last.y);
			sprite.velocityX = last.velocityX;
		}

		function missOperator() {
			if (timer > 0) {
				background("green");
			}
			else {
				background("navy");
			}
		}

		function floorReceiver(sprites) {
			let x;
			for (let i = 0; i < sprites.length; i++) {
				if (sprites[i].isTouching(floor)) {
					x = sprites[i].x;
					let sprite = createSprite(x, 357);
					sprite.setAnimation("alienBlue_badge_1");
					sprite.scale = 0.5;
					setTimeout(function () {
						bombDestroyer(sprites[i]);
						sprite.destroy();
					}, 1000);
				}
			}
		}


		function checkWall(sprites) {
			if (wallIsTouched(sprites)) {
				spritesGoDown(sprites);
			}
		}

		function enemyScore() {
			let sprite;
			for (let i = 0; i < ndnSprites.length; i++) {
				sprite = ndnSprites[i];
				fill("red");
				ellipse(sprite.x, sprite.y, 10, 10);
				fill("yellow");
				textSize(12);
				text(sprite.score, sprite.x - 5, sprite.y - 5);
			}

		}


		function superScore() {
			if (superShip && !superShip.isDead) {
				fill("red");
				ellipse(superShip.x, superShip.y, 10, 10);
				fill("yellow");
				textSize(12);
				text(superShip.score, superShip.x - 5, superShip.y - 5);
			}
		}

		function createSprites() {
			let defY = 65;
			function pickName() {
				let names = ["enemyBlack3_1"];
				return names[0];
			}
			for (let j = 0; j < 3; j++) {
				for (let i = 0; i < 6; i++) {
					myCreateSprite(pickName(), i * 30, defY);
				}
				defY += 30;
			}
		}

		function createOpeningSprites() {
			let defY = 65;
			function pickName() {
				let names = ["enemyBlack3_1"];
				return names[0];
			}
			for (let j = 0; j < 3; j++) {
				for (let i = 0; i < 6; i++) {
					myCreateOpeningSprite(pickName(), i * 30, defY);
				}
				defY += 30;
			}
		}

		function theMissManager(i) {
			score -= 1;
			addSprite(i);
		}

		function bombDestroyer(sprite) {
			for (let i = 0; i < ndnBombs.length; i++) {
				if (sprite === ndnBombs[i]) {
					ndnBombs.splice(i, 1);
					sprite.destroy();

					return true;
				}
			}
			return false;
		}




		function rocketDestroyer(sprite) {
			for (let i = 0; i < ndnRockets.length; i++) {
				if (sprite === ndnRockets[i]) {
					ndnRockets.splice(i, 1);
					sprite.destroy();

					return true;
				}
			}
			return false;
		}

		function spriteDestroyer(sprite) {
			for (let i = 0; i < ndnSprites.length; i++) {
				if (sprite === ndnSprites[i]) {
					playSound("sound://category_explosion/air_explode_bonus_5.mp3", false);
					sprite.setAnimation("powerup_wings_1");
					cooldownTimer = 0;
					ndnSprites.splice(i, 1);
					score += sprite.score;
					setTimeout(function () {
						sprite.destroy();
					}, 1000);

					return true;
				}
			}
			return false;
		}

		function superShipDestroyer() {
			if (superShip) {
				superShip.isDead = true;
				superShip.velocityX = 0;
				playSound("sound://category_explosion/melodic_loss_6.mp3", false);
				superShip.setAnimation("powerup_wings_1");
				cooldownTimer = 0;
				score += superShip.score;
				setTimeout(function () {
					superShip.destroy();
				}, 1000);
			}
		}



		function Bombing(sprites) {
			let sprite = randomNumber(0, sprites.length - 1);
			if (bombingCooldown < 29 && bombingCooldown > 26) {
				myCreateBomb("animation_3", sprites[sprite].x, sprites[sprite].y + 30);
				bombingCooldown = 0;
			}
		}


		// function Bombing(sprites) {
		// 	for (let i = 0; i < sprites.length; i++) {
		// 		if (timer2 < 29 & timer2 > 26) {
		// 			myCreateBomb("animation_3", ndnSprites[i].x, ndnSprites[i].y + 30);
		// 			timer2 = 0;
		// 		}
		// 	}
		// }

		function createFloor() {
			let box = createSprite(200, 378);
			box.setAnimation("animation_2");
			box.scale = 4;
			return box;

		}

		// first of all we check if it was NOT touched, then we double loop and check if touched

		function checkIfSpritesShot(enemies, rockets) {
			let enemy;
			let rocket;
			for (let z = 0; z < rockets.length; z++) {
				rocket = rockets[z];
				if (rocket.isTouching(superShip)) {
					superShipDestroyer();
					rocketDestroyer(rockets[z]);
				}
				else {
					for (let i = 0; i < enemies.length; i++) {
						enemy = enemies[i];
						if (rocket.isTouching(enemy)) {
							spriteDestroyer(enemies[i]);
							rocketDestroyer(rockets[z]);
							fastanator(ndnSprites);
							break;
						}
					}
				}
			}
			return false;
		}



		function checkIfRocketGone(rockets) {
			let rocket;
			for (let z = 0; z < rockets.length; z++) {
				rocket = rockets[z];
				if (rocket.y < 0) {
					rocketDestroyer(rocket);
				}

			}
		}


		function checkIfSpritesClicked(sprites) {
			let destroyed = false;
			let sprite;
			if (!mouseWentDown("leftButton")) {
				return false;
			}
			for (let i = 0; i < sprites.length; i++) {
				sprite = sprites[i];
				if (mousePressedOver(sprite)) {
					destroyed = spriteDestroyer(sprite);
					if (destroyed) {
						fastanator(ndnSprites);
					}
					return;
				}
			}
			// theMissManager (sprites);
		}

		function showHigh() {
			textSize(20);
			fill("red");
			rect(322, 0, 88, 50);
			fill("white");
			textSize(15);
			text("High Score", 322, 5, 200, 100);
			text(high, 344, 20, 200, 100);
		}
		function showScore() {
			textSize(20);
			fill("red");
			rect(0, 0, 35, 43);
			fill("white");
			textSize(12);
			text("Score", 0, 0, 200, 100);
			text(score, 15, 10, 200, 100);
			text("Level", 0, 20, 200, 100);
			text(currentLevel, 15, 30, 200, 100);
		}

		function showTotalScore() {
			textSize(12);
			text("Total score", 175, 5, 200, 100);
			text(totalScore, 175, 15, 200, 100);
		}

		function showCooldown() {
			textSize(20);
			fill("yellow");
			textSize(12);
			text("Cooldown", 40, 5, 200, 100);
			text(cooldownTimer, 40, 15, 200, 100);
		}

		function showRockets() {
			textSize(20);
			fill("red");
			textSize(12);
			text("Rockets left", 100, 5, 200, 100);
			text(rocketCap, 100, 15, 200, 100);
		}


		let floor = createFloor();
		scoreGet();
		highScorer();
		//createPause();
		//createStart();

		//function endcCheker() {
		//  if (gameState === PLAYING & player === null) {
		//    gameState = FINISHED;
		//    endText
		//  }
		//}

		//function endGame() {
		//   highScorer ();
		//   if (indicator === true) {
		//     text("winner winner chicken dinner", 100, 200);
		//   }
		//   else {
		//       text("bish bash won. NOOOOOOOOOO!!!!!!!", 100, 200);
		//   }
		// }

		function bodyCheker() {
			if (ndnSprites.length === 0) {
				endGame("winner winner chicken dinner", "there are no enemies left", true);
			}
		}


		function spaceInvaders(sprites) {
			let sprite;
			sprite = sprites[0];
			if (sprite && sprite.y >= 322) {
				endGame("bish bash won. NOOOOOOOOOO!!!!!!!", "they invaded your space", false);
			}
		}



		function endGame(message, reason, endState) {
			highScorer();
			endMessage = message;
			endReason = reason;
			if (endState) {
				gameState = FINALWIN;
				createButton({
					name: "sample button",
					command: "next-level",
					x: 200,
					y: 100,
					text: "next level"
				});
			}
			else {
				gameState = FINALLOSE;
				createButton({
					name: "sample button",
					command: "try-again",
					x: 200,
					y: 100,
					text: "Game over - try again"
				});
			}


		}


		function damageControl(torpedos) {
			let torpedo;
			for (let i = 0; i < torpedos.length; i++) {
				torpedo = torpedos[i];
				if (torpedo.isTouching(player)) {
					torpedo.isTouching(player);
					if (shield === false) {
						player.destroy();
						player = null;
						endGame("Game over", "You got hit", false);
						return true;
					}
					else {
						shield = false;
					}
				}
			}
		}


		function wasClicked(sprite) {
			return mouseWentDown("leftButton") && mousePressedOver(sprite);
		}

		function pauseSprite(sprite, pauseIt) {
			if (pauseIt) {
				sprite.pause();
			}
			else {
				sprite.play();
			}
		}

		function pauseSprites(rockets, bombs, enemies, pauseIt) {
			let i;
			for (i = 0; i < rockets.length; i++) {
				pauseSprite(rockets[i], pauseIt);
			}
			for (i = 0; i < bombs.length; i++) {
				pauseSprite(bombs[i], pauseIt);
			}
			for (i = 0; i < enemies.length; i++) {
				pauseSprite(enemies[i], pauseIt);
			}
		}

		function pauseControls() {
			if (wasClicked(pauseButton)) {
				pauseIndicator = !pauseIndicator;
				pauseSymbol.visible = pauseIndicator;
				pauseSprites(ndnSprites, ndnBombs, ndnRockets, pauseIndicator);
				if (pauseIndicator) {
					theDeccelerator(ndnSprites);
					theDeccelerator(ndnBombs);
					theDeccelerator(ndnRockets);
					pauseButton.setAnimation("animation_4");
				}
				else {
					theReAccelerator(ndnSprites);
					theReAccelerator(ndnBombs);
					theReAccelerator(ndnRockets);
					pauseButton.setAnimation("animation_1");
				}
			}
		}


		function theDeccelerator(sprites) {
			let sprite;
			for (let i = 0; i < sprites.length; i++) {
				sprite = sprites[i];
				sprite.oldXSpeed = sprite.velocityX;
				sprite.oldYSpeed = sprite.velocityY;
				sprite.velocityX = sprite.velocityY = 0;
			}
		}


		function theReAccelerator(sprites) {
			let sprite;
			for (let i = 0; i < sprites.length; i++) {
				sprite = sprites[i];
				sprite.velocityX = sprite.oldXSpeed;
				sprite.velocityY = sprite.oldYSpeed;
			}
		}

		function timerUpdinator() {
			if (cooldownTimer > 0) {
				cooldownTimer -= 1 * gameSpeed;
			}

			if (powerUpTimer > 0) {
				powerUpTimer -= 1 * gameSpeed;
			}

			bombingCooldown += 1;
			timer -= 1;
			superShipTimer++;
		}



		function noTrespassing() {
			if (player.x >= 400) {
				player.x = 390;
			}
			if (player.x <= 0) {
				player.x = 10;
			}
		}


		pauseSymbol = createSprite(200, 200);
		pauseSymbol.setAnimation("animation_5");
		pauseSymbol.visible = false;



		function superShipTimeWindow() {
			if (superShipTimer >= 100) {
				superShip = myCreateSuperShip("enemyBlack1_1", 10, 15);
				superShipTimer = 0;
			}
		}


		function openingScreen() {
			if (!startButton) {
				createOpeningSprites();
				createButton({
					name: "sample button",
					command: "next-level",
					x: 200,
					y: 200,
					text: "Start Game"
				});
				startButton = true;
			}
			checkWall(ndnOpeningSprites);
			background("black");

			drawSprites();
			drawAndCheckButtons();
			if (openingDone) {
				gameState = STARTING;
			}
		}


		function powerUpMaker() {
			if (powerUpTimer === 0) {
				powerUpTimer = randomNumber(100, 200);
				myCreatePowerUp("doubleShotPowerUp", randomNumber(10, 390), 10, ndnPowerUpTypes[0]);

			}
		}

		function powerDefiner(sprites) {
			for (let i = 0; i < sprites.length; i++) {
				if (!sprites[i].isTouching(player)) {
					continue;
				}
				if (sprites[i].type === "doubleShot") {
					shotsNum = 2;
					setTimeout(function () {
						shotsNum = 1;
					}, 3000);
				}
				else if (sprites[i].type === "shield") {
					shield = true;
					setTimeout(function () {
						sprites[i].type = "doubleShot";
					}, 20000);
				}
			}
		}

		function bonus() {
			if (bouns) {
				playSound("sound://category_collect/retro_game_classic_power_up_4.mp3", false);
				bouns = false;
			}
		}

		function draw() {
			if (gameState === OPENING) {
				return openingScreen();
			}
			if (gameState === STARTING) {
				for (let i = 0; i < ndnOpeningSprites.length; i++) {
					ndnOpeningSprites[i].destroy();
				}
				ndnOpeningSprites = [];
				initLevel();
			}
			if (pauseIndicator) {
				pauseControls();
			}
			else {
				if (gameState === PLAYING) {
					drawGame();
				}
				else if (gameState === FINALLOSE) {
					drawEnd();
				}
				else if (gameState === FINALWIN) {
					drawEnd();
				}
			}
		}
		function drawEnd() {
			if (!endSound) {
				playSound("sound://category_explosion/8bit_explosion.mp3", false);
				endSound = true;
			}
			background("navy");
			fill("blue");
			textSize(20);
			text(endMessage, 80, 200);
			text("because", 60, 230);
			text(endReason, 140, 230);
			drawSprites();
			drawAndCheckButtons();
		}

		// function drawLose() {
		// 	if (!endSound) {
		// 		playSound("sound://category_explosion/8bit_explosion.mp3", false);
		// 		endSound = true;
		// 	}
		// 	background("navy");
		// 	fill("blue");
		// 	textSize(20);
		// 	text(endMessage, 80, 200);
		// 	text("because", 60, 230);
		// 	text(endReason, 140, 230);
		// 	drawSprites();
		// 	drawAndCheckButtons();
		// 	topBar();
		// }
		// function drawWin() {
		// 	if (!endSound) {
		// 		playSound("sound://category_explosion/8bit_explosion.mp3", false);
		// 		endSound = true;
		// 	}
		// 	background("navy");
		// 	fill("blue");
		// 	textSize(20);
		// 	text(endMessage, 80, 200);
		// 	text("because", 60, 230);
		// 	text(endReason, 140, 230);
		// 	drawSprites();
		// 	drawAndCheckButtons();
		// 	topBar();
		// }

		function drawGame() {
			powerUpMaker();
			powerDefiner(ndndActivePowerUps);
			superShipTimeWindow();
			bodyCheker();
			pauseControls();
			timerUpdinator();
			shooter();
			// checkKeyboardCommands(ndnSprites);
			movePlayer(player);
			checkIfRocketGone(ndnRockets);
			floorReceiver(ndnBombs);
			missOperator();
			checkIfSpritesShot(ndnSprites, ndnRockets);
			checkWall(ndnSprites);
			// checkIfSpritesClicked(ndnSprites);
			showScore();
			showTotalScore();
			// shooterRandomizer (sooter);
			showHigh();
			showRockets();
			noTrespassing();
			//  drawControls ();
			showCooldown();
			spaceInvaders(ndnSprites);
			damageControl(ndnBombs);
			Bombing(ndnSprites);
			drawSprites();
			superScore();
			enemyScore();
			drawAndCheckButtons();
			// if (checkIfSpritesShot (ndnSprites,ndnRockets)) {
			//   text("winner winner chicken dinner", 100, 200);

			// }

		}


		function highScorer() {
			let newScore = score;
			if ((high === 0) || (newScore < high)) {
				setKeyValue("highScore2", newScore, function () {
					console.log(newScore + " is bigger than " + high + ". Updated highScore");
				});
			}
		}

		function scoreGet() {
			getKeyValue("highScore2", function (value) {
				high = value || 0;
			});
		}



		function paint(t: ISJSTicker): void {
			try {
				const f = eval("draw");
				if (typeof f === "function") {
					World.preUpdate();
					f();
					World.postUpdate();
				}
			}
			catch (e) {
			}
		}
		const ticker = World.scene.Ticker(paint);
		ticker.run();

	});

/**************** End client code  */


}((window as any).jQuery, "/userimages/nadan"));
