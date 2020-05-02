// update settings in settings.js 
let testCommands = false; // TO DO change to false before commit 

var channels = [gameSettings.channel];
clientOptions = {
    options: {
            debug: false
        },
    channels: channels
};

let players = [];

class Character {
    constructor(name, health) {
        this.name = name;
        this.health = health;
        this.active = true;
        this.alive = true;
    }
}

class Player extends Character {
    constructor(name, health, playerId) {
        super(name, health);
        this.item = false;
        this.itemTick = 0;
        this.playerId = playerId;
        this.image = gameSettings.defaultPlayerImage;
    }
}

class Enemy extends Character {
    constructor(name, image, health, minAttack, maxAttack) {
        super(name, health);
        this.image = image;
        this.maxHealth = health;
        this.minAttack = minAttack;
        this.maxAttack = maxAttack;
        this.healCount = 0;
        this.animation = anime({
            targets: '.boss',
            translateY: 20,
            direction: 'alternate',
            duration: 100,
            autoplay: false,
            easing: 'easeInOutBounce'
          });
    }
}

let healthBarHTML = '<div class="playerImage"></div><div class="progress"><div class="progress-bar" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div></div>';
let itemBarHTML = '<div class="playerItem"></div>';

let gameInfo = {gameActive: false, enemiesKilled: true};
let currentEnemy = null;

let enemyHitSound = new Audio('sounds/bossHit.wav');
let joinSound = new Audio('sounds/join.wav');
let playerHitSound = new Audio('sounds/hit.wav');
let healSound = new Audio('sounds/heal.wav');
let itemFoundSound = new Audio('sounds/item.wav');
let itemAttackSound = new Audio('sounds/boom.wav');

async function enemyBox(status) {
    let enemyBar = document.getElementsByClassName('bossBox')[0];
    if(status) {
        enemyBar.style.visibility = 'visible';
    }
    else {
        enemyBar.style.visibility = 'hidden';
    }
}

async function spawnEnemy() {
    currentEnemy = null;
    let randomEnemy = enemies.regular[randomNumber(0,(enemies.regular.length - 1))];
    if(gameInfo.enemiesKilled >= 5) { 
        let bossChance = randomNumber(1,5);
        if(bossChance >= 4) {
            randomEnemy = enemies.bosses[randomNumber(0,(enemies.bosses.length - 1))];
        }
    }
    currentEnemy = new Enemy(randomEnemy.name, randomEnemy.image, randomEnemy.health, randomEnemy.minAttack, randomEnemy.maxAttack);
    currentEnemy.active = true;
    currentEnemy.alive = true;
    currentEnemy.animation = anime({
        targets: '.boss',
        translateY: 20,
        direction: 'alternate',
        duration: 100,
        autoplay: false,
        easing: 'easeInOutBounce'
      });    
    let enemyClass = document.getElementsByClassName('bossBox')[0];
    let enemyImage = enemyClass.querySelector('.boss');
    enemyImage.style.backgroundImage = `url('${currentEnemy.image}')`;    
    await enemyBox(true);
    await updateHealth(currentEnemy, currentEnemy.maxHealth);
    statusMesssage(`${currentEnemy.name} appeared!`);
    await sleep(1);
}

function startGame() {
    if(!gameInfo.gameActive) {
        if(currentEnemy instanceof Enemy) {
            gameInfo.gameActive = true;
            gameInfo.enemiesKilled = 0;
        }
    }
}

function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

function randomNumber(min, max) {
    let rand = Math.floor(Math.random() * (max - min + 1) + min);
    return rand;
}

function updatePlayerImage(updateObj) {
    let playerClass = document.getElementsByClassName(`player${updateObj.playerId}`)[0];
    let playerImage = playerClass.querySelector('.playerImage');
    let twitchLogo = updateObj.image;
    playerImage.style.backgroundImage = `url('${twitchLogo}')`;    
}

function itemIcon(updateId, status) {
    let playerClass = document.getElementsByClassName(`player${updateId}`)[0];
    let itemIcon = playerClass.querySelector('.playerItem');
    if(status) {
        itemIcon.style.visibility = 'visible';
    }
    else {
        itemIcon.style.visibility = 'hidden';
    }
}

async function playersTurn() {
    if(currentEnemy !== null) {
        if(currentEnemy.alive) {              
            for(let x in players) {
                if(players[x].alive && players[x].active) {
                    let playerAttack = randomNumber(1,3); 
                    players[x].animation.play();
                    statusMesssage(`${players[x].name} attacked for ${playerAttack} damage`);
                    playerHitSound.play();
                    await updateHealth(currentEnemy, (currentEnemy.health - playerAttack));
                    await sleep(1);
                    if(!players[x].item && players[x].alive) {
                        players[x].itemTick++;
                        if(players[x].itemTick >= 4) {
                            let itemChance = randomNumber(1,3);
                            if(itemChance == 2) {
                                players[x].item = true;
                                players[x].itemTick = 0;
                                statusMesssage(`${players[x].name} found an !item`);
                                itemIcon(players[x].playerId, true);
                                itemFoundSound.play();
                                await sleep(2);
                            }
                        }
                    }
                }
            }
        }
    }
}

async function enemyTurn() {
    if(currentEnemy !== null) {
        if(currentEnemy.alive) {          
            statusMesssage(`${currentEnemy.name} attacked!`);
            for(let x in players) {
                if(players[x].active && players[x].alive) {
                    let attackChance = randomNumber(1,10);
                    if(attackChance == 5) {  
                        statusMesssage(`${currentEnemy.name} missed ${players[x].name}!`);
                        await sleep(1);
                        continue;
                    }
                    let enemyAttack = randomNumber(currentEnemy.minAttack, currentEnemy.maxAttack);
                    currentEnemy.animation.play();            
                    let dodgeChance = randomNumber(1, 20);
                    if(dodgeChance == 6) {
                        statusMesssage(`${players[x].name} dodged!`);
                        await sleep(1);
                    }
                    else {
                        statusMesssage(`${players[x].name} took ${enemyAttack} damage`);
                        enemyHitSound.play();
                        await updateHealth(players[x], (players[x].health - enemyAttack));
                    }
                    await sleep(1);
                }
            }
            await sleep(1);
        }
    }
}

async function runTurn() {
    if(gameInfo.gameActive) {
        if(currentEnemy !== null) {
            await enemyTurn();
            await playersTurn();
        }
        else {
            console.log('Game is active. Enemy is null. Skipping run.');
        }
    }
    else {
        if(currentEnemy !== null) {
            console.log('Enemy is not null. Game is not active. Waiting for players...');
        }
        else {
            await spawnEnemy();
            statusMesssage(`${currentEnemy.name} appeared! Type !join to join.`);
        }
    }
}

function statusMesssage(msg) {
    document.getElementsByClassName('statusMessage')[0].innerHTML = msg;
}

function endGame() {
    clearInterval(gameHandle);
    gameInfo.gameActive = false;
    players = [];
    currentEnemy = null;
    console.log('game ended');
}

async function updateHealth(updateObj, newHealth) {
    let healthBar = null;
    let healthPercent = 0;
    if(updateObj instanceof Player) {
        let playerBar = document.getElementsByClassName(`player${updateObj.playerId}`)[0];
        healthBar = playerBar.querySelector('.progress-bar');
        updateObj.health = newHealth;
        healthPercent = updateObj.health;
        if(updateObj.health <= 0) {
            let teamAlive = false;
            statusMesssage(`${updateObj.name} died!`);
            updateObj.alive = false;
            updateObj.itemTick = 0;
            updateObj.item = false;
            itemIcon(updateObj.playerId, false);
            for(let x in players) {
                if(players[x].alive) {
                    teamAlive = true;
                }
            }
            if(!teamAlive) {
                statusMesssage(`${currentEnemy.name} wins!`);
                endGame();
            }
        }
    }
    else if(updateObj instanceof Enemy) {
        let bossBar = document.getElementsByClassName('bossBox')[0];
        healthBar = bossBar.querySelector('.progress-bar');
        updateObj.health = newHealth;
        healthPercent = (updateObj.health / updateObj.maxHealth) * 100; 
        if(updateObj.health <= 0) {
            updateObj.alive = false;
            statusMesssage(`${updateObj.name} has been defeated!`);
            await sleep(1);
            await enemyBox(false);
            gameInfo.enemiesKilled++;
            spawnEnemy(); 
            // dont wait otherwise you'll have to wait for updateHealth() for new enemy 
            // TO DO - move this to runTurn() spawn an enemy if there isn't one active/alive and the game is active
        }
    }
    if(healthBar != null) {
        healthBar.setAttribute("style", `width: ${healthPercent}%`);
    }
}

async function getTwitchImage(user) {
    // let twitchUserID = '9502699'; // varixx
    // let twitchUserID = '9558156459'; // invalid
    // let twitchUserID = '95586459'; // default
    let twitchUserID = user['user-id'];
    let twitchURL = `https://api.twitch.tv/kraken/users/${twitchUserID}`;    
    const response = await fetch(twitchURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Client-ID':  gameSettings.clientId
        }
    });
    try {
        let resultImage = await response.json();
        if(resultImage.logo.includes('user-default-pictures')){
            return false;
        }
        else{
           return resultImage.logo; 
        }  
    }
    catch(error) {
        return false;
    }
}

async function addPlayer(user) {
    if(players.length < 4) {
        for(let p in players) {
            if((players[p].name).toLowerCase() === (user['display-name']).toLowerCase()) {
                console.log(`${user['display-name']} tried to join twice`);
                return;
            }
        }
        if(currentEnemy !== null) {
            let newPId = players.length;
            players.push(new Player(user['display-name'], 100, newPId));
            let newPlayerBar = document.getElementsByClassName(`player${newPId}`)[0];
            newPlayerBar.innerHTML = healthBarHTML + user['display-name'] + itemBarHTML;
            newPlayerBar.style.visibility = 'visible';        
            let twitchImage = await getTwitchImage(user);
            if(twitchImage) {
                players[newPId].image = twitchImage;
                updatePlayerImage(players[newPId]);
            }
            else {
                console.log(`Invalid twitch image for ${user['display-name']} (ID: ${user['user-id']}), using default image.`);
            }
            await updateHealth(players[newPId], 100);
            statusMesssage(`${players[newPId].name} joined!`);
            joinSound.play();
            players[newPId].animation = anime({
                targets: `.players .player${newPId} .playerImage`,
                translateY: -20,
                direction: 'alternate',
                duration: 100,
                autoplay: false,
                easing: 'easeInOutBounce'
            });        
            if(!gameInfo.gameActive) {
                startGame();
            }        
            await sleep(2);
        }
        else {
            console.log(`${user['display-name']} tried to join without an enemy spawned. Ignoring.`);
        }
    }
    else {
        statusMesssage(`No player slots available!`);
        await sleep(1);
    }
}

async function useItem(user) {
    let foundPlayer = null;
    for(let x in players) {
        if(players[x].name.toLowerCase() == user['display-name'].toLowerCase()) {
            foundPlayer = players[x];
        }
    }
    if(foundPlayer != null) {
        if(foundPlayer.alive && foundPlayer.item) {
            statusMesssage(`${foundPlayer.name} used an item!`);
            foundPlayer.item = false;
            itemIcon(foundPlayer.playerId, false);
            let healChance = randomNumber(gameSettings.healChanceMin, gameSettings.healChanceMax);
            if(healChance == 2) {
                let backfireChance = randomNumber(gameSettings.healBackfireChanceMin, gameSettings.healBackfireChanceMax);
                if(backfireChance == 2) {
                    let healedEnemyClass = document.getElementsByClassName('bossBox')[0];
                    let healedEnemyImage = healedEnemyClass.querySelector('.boss');
                    let oldImage = healedEnemyImage.innerHTML;
                    healedEnemyImage.innerHTML += '<img src="images/hearts.png">';
                    healSound.play();
                    await updateHealth(currentEnemy, (currentEnemy.health + 10));
                    statusMesssage(`${foundPlayer.name} healed ${currentEnemy.name} 10HP!`);
                    await sleep(2);
                    healedEnemyImage.innerHTML = oldImage;
                }
                else {
                    for(let x in players) {
                        if(players[x].active) {
                            let healedPlayerClass = document.getElementsByClassName(`player${x}`)[0];
                            let healedPlayerImage = healedPlayerClass.querySelector('.playerImage');
                            let oldImage = healedPlayerImage.innerHTML;
                            healedPlayerImage.innerHTML += '<img src="images/hearts.png">';
                            healSound.play();                            
                            if(!players[x].alive) {
                                players[x].alive = true;
                                players[x].health = 0;
                                statusMesssage(`${players[x].name} was revived!`);
                            }
                            await updateHealth(players[x], (players[x].health + 10));
                            statusMesssage(`${foundPlayer.name} healed ${players[x].name} 10HP!`);
                            await sleep(2);
                            healedPlayerImage.innerHTML = oldImage;
                        }
                    }
                }
            }
            else {
                let healedEnemyClass = document.getElementsByClassName('bossBox')[0];
                let healedEnemyImage = healedEnemyClass.querySelector('.boss');
                let oldImage = healedEnemyImage.innerHTML;
                healedEnemyImage.innerHTML += '<img src="images/boom.png">';                
                itemAttackSound.play();
                let itemAttackDamage = (5 + randomNumber(0,5));
                statusMesssage(`${foundPlayer.name}'s item did ${itemAttackDamage} damage!`);
                await updateHealth(currentEnemy, (currentEnemy.health - itemAttackDamage));
                await sleep(1);
                healedEnemyImage.innerHTML = oldImage;                
            }
            await sleep(1);
        }
        else {
            console.log(`${foundPlayer.name} tried to use an item but does not have one.`);
        }
    }
}

async function processChat(channel, user, message, self) {  
    if(message.toLowerCase() == '!join') {
        await addPlayer(user);
    }
    if(message.toLowerCase() == '!item') {
        await useItem(user);
    }
    // if(message.toLowerCase() == '!deez') {
    //     if(testCommands) {
    //         players[0].item = true;
    //         players[0].itemTick = 0;
    //         statusMesssage(`${players[0].name} found an !item`);
    //         itemIcon(players[0].playerId, true);
    //         itemFoundSound.play();
    //         await sleep(2);        
    //     }
    // }
}

var client = new tmi.client(clientOptions);
client.addListener('connecting', function (address, port) {
    console.log('connecting');
});
client.addListener('logon', function () {
    console.log('logon');
});
client.addListener('connectfail', function () {
    console.log('connect fail');
});
client.addListener('connected', function (address, port) {
    console.log('connected');
});
client.addListener('message', processChat);
client.connect();

var gameHandle = setInterval(runTurn, gameSettings.roundTime);
statusMesssage(`Type !join to join.`);

