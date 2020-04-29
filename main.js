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

class Player {
    constructor(name, health, playerId){
        this.name = name;
        this.health = health;
        this.active = true;
        this.alive = true;
        this.item = false;
        this.itemTick = 0;
        this.playerId = playerId;
        this.image = gameSettings.defaultPlayerImage;
    }
}

class Enemy {
    constructor(name, image, health, minAttack, maxAttack){
        this.name = name;
        this.image = image;
        this.health = health;
        this.maxHealth = health;
        this.minAttack = minAttack;
        this.maxAttack = maxAttack;
        this.active = true;
        this.alive = true;
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

async function enemyBox(status)
{
    // let enemyHTML = `<div class="bossBox"><div class='boss'></div><div class="progress"><div class="progress-bar" role="progressbar" style="width: 100%" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div></div><div class="statusMessage"></div>`;
    let enemyBar = document.getElementsByClassName('bossBox')[0];
    if(status){
        enemyBar.style.visibility = 'visible';
    }
    else{
        enemyBar.style.visibility = 'hidden';
    }
}

async function spawnEnemy()
{
    currentEnemy = null;
    let randomEnemy = enemies.regular[randomNumber(0,(enemies.regular.length - 1))];
    if(gameInfo.enemiesKilled >= 5){ 
        let bossChance = randomNumber(1,5);
        if(bossChance >= 4){
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

function startGame()
{
    if(!gameInfo.gameActive){
        if(currentEnemy instanceof Enemy){
            gameInfo.gameActive = true;
            gameInfo.enemiesKilled = 0;
        }
    }
    
    // if(!gameInfo.gameActive){
    // gameInfo.gameActive = true;
    // currentEnemy = new Enemy('Goteem man', 100, 2, 8);
    // currentEnemy.image = 'goteem.png';
    // currentEnemy.animation = anime({
    //         targets: '.boss',
    //         translateY: 20,
    //         direction: 'alternate',
    //         duration: 100,
    //         autoplay: false,
    //         easing: 'easeInOutBounce'
    //       });

    // gameInfo.enemy.active = true;
    // await updateHealth(0, 100); // boss
    // await addFighter(1, user);
    // }
}

function sleep(sec) 
{
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

function randomNumber(min, max)
{
    let rand = Math.floor(Math.random() * (max - min + 1) + min);
    return rand;
}

function updatePlayerImage(updateObj)
{
    // start class rewrite
    let playerClass = document.getElementsByClassName(`player${updateObj.playerId}`)[0];
    let playerImage = playerClass.querySelector('.playerImage');
    let twitchLogo = updateObj.image;
    playerImage.style.backgroundImage = `url('${twitchLogo}')`;    
    // end class rewrite
    // let fighterClass = document.getElementsByClassName('fighter'+fighterID)[0];
    // let fighterImage = fighterClass.querySelector('.fighterImage');
    // fighterImage.style.backgroundImage = `url('${gameInfo['fighter'+fighterID].image}')`;
}

function itemIcon(updateId, status)
{
    // start class rewrite
    let playerClass = document.getElementsByClassName(`player${updateId}`)[0];
    let itemIcon = playerClass.querySelector('.playerItem');
    if(status){
        itemIcon.style.visibility = 'visible';
    }
    else{
        itemIcon.style.visibility = 'hidden';
    }
    // end class rewrite
    // let fighterClass = document.getElementsByClassName('fighter'+fighterID)[0];
    // let itemIcon = fighterClass.querySelector('.fighterItem');
    
    // if(status)
    // {
    //     itemIcon.style.visibility = 'visible';
    // }
    // else
    // {
    //     itemIcon.style.visibility = 'hidden';
    // }
}

// async function fightersTurn(fighterID)
async function playersTurn()
{
    if(currentEnemy !== null){
        if(currentEnemy.alive){              
            // start class rewrite
            for(let x in players){
                if(players[x].alive && players[x].active){
                    let playerAttack = randomNumber(1,3);
                    players[x].animation.play();
                    statusMesssage(`${players[x].name} attacked for ${playerAttack} damage`);
                    playerHitSound.play();
                    await updateHealth(currentEnemy, (currentEnemy.health - playerAttack));
                    await sleep(1);
                    if(!players[x].item && players[x].alive)
                    {
                        players[x].itemTick++;
                        if(players[x].itemTick >= 4)
                        {
                            let itemChance = randomNumber(1,3);
                            if(itemChance == 2)
                            {
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
    // end class rewrite
    // let findFighter = 'fighter' + fighterID;
    // if(gameInfo[findFighter].active && gameInfo[findFighter].alive)
    // {
    //     let playerAttack = randomNumber(1,3);
    //     gameInfo[findFighter].animation.play();
    //     statusMesssage(`${gameInfo[findFighter].name} attacked for ${playerAttack} damage`);
    //     fighterHitSound.play();
    //     await updateHealth(0, (gameInfo.enemy.health - playerAttack));
    //     await sleep(1);
    //     if(!gameInfo[findFighter].item && gameInfo[findFighter].alive)
    //     {
    //         gameInfo[findFighter].itemTick++;
    //         if(gameInfo[findFighter].itemTick >= 5)
    //         {
    //             let itemChance = randomNumber(1,5);
    //             if(itemChance == 4)
    //             {
    //                 gameInfo[findFighter].item = true;
    //                 gameInfo[findFighter].itemTick = 0;
    //                 statusMesssage(`${gameInfo[findFighter].name} found an !item`);
    //                 itemIcon(fighterID, true);
    //                 itemFoundSound.play();
    //                 await sleep(2);
    //             }
    //         }
    //     }
    // }
}

// async function bossTurn()
async function enemyTurn()
{
    if(currentEnemy !== null){
        if(currentEnemy.alive){          
            // start class rewrite
            statusMesssage(`${currentEnemy.name} attacked!`);
            for(let x in players){
                if(players[x].active && players[x].alive){
                    let attackChance = randomNumber(1,10);
                    if(attackChance == 5){  
                        // console.log(`Skipping attack on ${players[x].name}`);
                        statusMesssage(`${currentEnemy.name} missed ${players[x].name}!`);
                        await sleep(1);
                        continue;
                    }
                    let enemyAttack = randomNumber(currentEnemy.minAttack, currentEnemy.maxAttack);
                    currentEnemy.animation.play();            
                    let dodgeChance = randomNumber(1, 20);
                    if(dodgeChance == 6)
                    {
                        statusMesssage(`${players[x].name} dodged!`);
                        await sleep(1);
                    }
                    else
                    {
                        statusMesssage(`${players[x].name} took ${enemyAttack} damage`);
                        enemyHitSound.play();
                        await updateHealth(players[x], (players[x].health - enemyAttack));
                    }
                    await sleep(1);
                }
                // else{
                //     console.log(`${players[x].name} (${players[x].playerId}) is not active and alive`);
                // }
            }
            await sleep(1);
        }
    }
    // end class rewrite
    // statusMesssage(`${gameInfo.enemy.name} attacked!`);
    // await sleep(1);
    // for(let fid = 1; fid <= 4; fid++)
    // {
    //     if(gameInfo['fighter'+fid].active && gameInfo['fighter'+fid].alive)
    //     {
    //         let attackChance = randomNumber(1,10);
    //         if(attackChance == 5)
    //         {  
    //             // console.log(`Skipping attack on ${gameInfo['fighter'+fid].name}`);
    //             statusMesssage(`${gameInfo.enemy.name} missed ${gameInfo['fighter'+fid].name}}!`);
    //             await sleep(1);
    //             continue;
    //         }
    //         let bossAttack = randomNumber(gameInfo.enemy.minAttack, gameInfo.enemy.maxAttack);
    //         bossAttackAnimation.play();            
    //         let dodgeChance = randomNumber(1, 20);
    //         if(dodgeChance == 6)
    //         {
    //             statusMesssage(`${gameInfo['fighter'+fid].name} dodged!`);
    //             await sleep(1);
    //         }
    //         else
    //         {
    //             statusMesssage(`${gameInfo['fighter'+fid].name} took ${bossAttack} damage`);
    //             bossHitSound.play();
    //             await updateHealth(fid, (gameInfo['fighter'+fid].health - bossAttack));
    //         }
    //         await sleep(1);
    //     }
    // }
    // await sleep(1);
}

async function runTurn()
{
    // start class rewrite
    if(gameInfo.gameActive){
        if(currentEnemy !== null){
            await enemyTurn();
            await playersTurn();
        }
        else{
            console.log('Game is active. Enemy is null. Skipping run.');
        }
    }
    else{
        if(currentEnemy !== null){
            console.log('Enemy is not null. Game is not active. Waiting for players...');
        }
        else{
            await spawnEnemy();
            statusMesssage(`${currentEnemy.name} appeared! Type !join to join.`);
        }
    }
    // end class rewrite
    // if(gameInfo.gameActive)
    // {
    //     await bossTurn();
    //     for(let fid = 1; fid <= 4; fid++)
    //     {
    //         await fightersTurn(fid);
    //     }
    // }
    // else
    // {
    //     statusMesssage(`${gameInfo.enemy.name} appeared! Type !join to join.`);
    // }
}

function statusMesssage(msg)
{
    document.getElementsByClassName('statusMessage')[0].innerHTML = msg;
}

function endGame()
{
    // start class rewrite
    clearInterval(gameHandle);
    gameInfo.gameActive = false;
    players = [];
    currentEnemy = null;
    console.log('game ended');
    // end class rewrite
    // clearInterval(gameHandle);
    // gameInfo.gameActive = false;
    // gameInfo.enemy.active = false;
    // gameInfo.enemy.health = false;
    // gameInfo.enemy.healCount = 0;
    // gameInfo.enemy.minAttack = 0;
    // gameInfo.enemy.maxAttack = 0;
    // // updateHealth(0, 100); // do this on restart game instead when the command is created 

    // for(let fid = 1; fid <= 4; fid++)
    // {
    //     gameInfo['fighter'+fid].active = false;
    //     gameInfo['fighter'+fid].alive = false;
    //     gameInfo['fighter'+fid].name = 'nobody'; 
    //     gameInfo['fighter'+fid].item = false; 
    //     gameInfo['fighter'+fid].itemTick = 0;
    //     gameInfo['fighter'+fid].image = gameSettings.defaultPlayerImage;
    //     gameInfo['fighter'+fid].animation = undefined;
    //     console.log(`stats reset for fighter ${fid}`);
    // }
}

// async function updateHealth(fighterID, health)
async function updateHealth(updateObj, newHealth)
{
    // start class rewrite
    let healthBar = null;
    let healthPercent = 0;
    if(updateObj instanceof Player){
        let playerBar = document.getElementsByClassName(`player${updateObj.playerId}`)[0];
        healthBar = playerBar.querySelector('.progress-bar');
        updateObj.health = newHealth;
        healthPercent = updateObj.health;
        if(updateObj.health <= 0){
            let teamAlive = false;
            statusMesssage(`${updateObj.name} died!`);
            updateObj.alive = false;
            updateObj.itemTick = 0;
            updateObj.item = false;
            itemIcon(updateObj.playerId, false);
            for(let x in players){
                if(players[x].alive){
                    teamAlive = true;
                }
            }
            if(!teamAlive){
                statusMesssage(`${currentEnemy.name} wins!`);
                endGame();
            }
        }
    }
    else if(updateObj instanceof Enemy){
        let bossBar = document.getElementsByClassName('bossBox')[0];
        healthBar = bossBar.querySelector('.progress-bar');
        updateObj.health = newHealth;
        healthPercent = (updateObj.health / updateObj.maxHealth) * 100; 
        if(updateObj.health <= 0)
        {
            updateObj.alive = false;
            // endGame();
            statusMesssage(`${updateObj.name} has been defeated!`);
            await sleep(1);
            await enemyBox(false);
            gameInfo.enemiesKilled++;
            spawnEnemy(); // dont wait otherwise you'll have to wait for updateHealth() for new enemy TO DO - move this to runTurn(). spawn an enemy if there isn't one active/alive and the game is active
        }
    }
    if(healthBar != null){
        healthBar.setAttribute("style", `width: ${healthPercent}%`);
    }
    // end class rewrite
    // let healthBar = null;
    // if(fighterID == 0)
    // {
    //     let bossBar = document.getElementsByClassName('bossBox')[0];
    //     healthBar = bossBar.querySelector('.progress-bar');
    //     gameInfo.enemy.health = health;
    //     if(gameInfo.enemy.health <= 0)
    //     {
    //         endGame();
    //         statusMesssage(`${gameInfo.enemy.name} has been defeated!`);
    //     }
    // }
    // else if(fighterID >= 1 && fighterID < 5)
    // {
    //     let fighterBar = document.getElementsByClassName('fighter'+fighterID)[0];
    //     let findFighter = 'fighter' + fighterID;
    //     healthBar = fighterBar.querySelector('.progress-bar');
    //     gameInfo[findFighter].health = health;
    //     if(gameInfo[findFighter].health <= 0)
    //     {
    //         statusMesssage(`${gameInfo[findFighter].name} died!`);
    //         gameInfo[findFighter].alive = false;
    //         gameInfo[findFighter].itemTick = 0;
    //         gameInfo[findFighter].item = false;
    //         itemIcon(fighterID, false);
    //         await sleep(1);
    //     }
    // }
    // end game if all fighters are dead 
    // if(gameInfo.fighter1.active)
    // {
    //     if(gameInfo.fighter2.active)
    //     {
    //         if(gameInfo.fighter3.active)
    //         {
    //             if(gameInfo.fighter4.active)
    //             {
    //                 if(gameInfo.fighter1.alive === false && gameInfo.fighter2.alive === false && gameInfo.fighter3.alive === false && gameInfo.fighter4.alive === false)
    //                 {
    //                     endGame();
    //                     statusMesssage(`${gameInfo.enemy.name} wins!`);
    //                 }
    //             }
    //             else
    //             {
    //                 if(gameInfo.fighter1.alive === false && gameInfo.fighter2.alive === false && gameInfo.fighter3.alive === false)
    //                 {
    //                     endGame();
    //                     statusMesssage(`${gameInfo.enemy.name} wins!`);
    //                 }
    //             }
    //         }
    //         else
    //         {
    //             if(gameInfo.fighter1.alive === false && gameInfo.fighter2.alive === false)
    //             {
    //                 endGame();
    //                 statusMesssage(`${gameInfo.enemy.name} wins!`);
    //             }
    //         }
    //     }
    //     else
    //     {
    //         if(gameInfo.fighter1.alive === false)
    //         {
    //             endGame();
    //             statusMesssage(`${gameInfo.enemy.name} wins!`);
    //         }
    //     }
    // }
    // if(healthBar != null)
    // {
    //     healthBar.setAttribute("style", `width: ${health}%`);
    // }
}

async function getTwitchImage(user)
{
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
    try{
        let resultImage = await response.json();
        if(resultImage.logo.includes('user-default-pictures')){
            return false;
        }
        else{
           return resultImage.logo; 
        }  
    }
    catch(error){
        return false;
    }
}

// async function addFighter(fighterID, user)
async function addPlayer(user)
{
    // start class rewrite   
    if(players.length < 4){
        if(currentEnemy !== null){
            let newPId = players.length;
            players.push(new Player(user['display-name'], 100, newPId));
            let newPlayerBar = document.getElementsByClassName(`player${newPId}`)[0];
            newPlayerBar.innerHTML = healthBarHTML + user['display-name'] + itemBarHTML;
            newPlayerBar.style.visibility = 'visible';        
            let twitchImage = await getTwitchImage(user);
            if(twitchImage){
                players[newPId].image = twitchImage;
                updatePlayerImage(players[newPId]);
            }
            else{
                console.log(`Invalid twitch image for ${user['display-name']} (ID: ${user['user-id']}), using default image.`);
            }
            await updateHealth(players[newPId], 100);
            statusMesssage(`${players[newPId].name} joined!`);
            // console.log(`added ${players[newPId].name} health ${players[newPId].health} id ${players[newPId].playerId} image ${players[newPId].image}`);
            joinSound.play();
            players[newPId].animation = anime({
                targets: `.players .player${newPId} .playerImage`,
                translateY: -20,
                direction: 'alternate',
                duration: 100,
                autoplay: false,
                easing: 'easeInOutBounce'
            });        
            if(!gameInfo.gameActive){
                startGame();
            }        
            await sleep(2);
        }
        else{
            console.log(`${user['display-name']} tried to join without an enemy spawned. Ignoring.`);
        }
    }
    else{
        statusMesssage(`No player slots available!`);
        await sleep(1);
    }
    // end class rewrite
    // let findFighter = 'fighter' + fighterID;
    // let fighterBar = document.getElementsByClassName(findFighter)[0];
    // fighterBar.innerHTML = healthBarHTML + user['display-name'] + itemBarHTML;
    // fighterBar.style.visibility = 'visible';
    // gameInfo[findFighter].active = true;
    // gameInfo[findFighter].alive = true;
    // gameInfo[findFighter].name = user['display-name'];
    // await updateHealth(fighterID, 100);
    // statusMesssage(`${user['display-name']} joined!`);
    // joinSound.play();
    // let twitchImage = await getTwitchImage(user);
    // if(twitchImage)
    // {
    //     gameInfo[findFighter].image = twitchImage;
    //     updateFighterImage(fighterID);
    // }
    // else
    // {
    //     console.log(`Invalid twitch image for ${user['display-name']} (ID: ${user['user-id']}), using default image.`);
    // }
    // gameInfo[findFighter].animation = anime({
    //     targets: `.fighters .fighter${fighterID} .fighterImage`,
    //     translateY: -20,
    //     direction: 'alternate',
    //     duration: 100,
    //     autoplay: false,
    //     easing: 'easeInOutBounce'
    // });    
    // await sleep(1);
}

async function useItem(user)
{
    // start class rewrite
    let foundPlayer = null;
    for(let x in players){
        if(players[x].name.toLowerCase() == user['display-name'].toLowerCase()){
            foundPlayer = players[x];
        }
    }
    if(foundPlayer != null){
        if(foundPlayer.alive && foundPlayer.item){
            statusMesssage(`${foundPlayer.name} used an item!`);
            foundPlayer.item = false;
            itemIcon(foundPlayer.playerId, false);
            let healChance = randomNumber(gameSettings.healChanceMin, gameSettings.healChanceMax);
            if(healChance == 2){
                let backfireChance = randomNumber(gameSettings.healBackfireChanceMin, gameSettings.healBackfireChanceMax);
                if(backfireChance == 2){
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
                else{
                    for(let x in players){
                        if(players[x].active){
                            let healedPlayerClass = document.getElementsByClassName(`player${x}`)[0];
                            let healedPlayerImage = healedPlayerClass.querySelector('.playerImage');
                            let oldImage = healedPlayerImage.innerHTML;
                            healedPlayerImage.innerHTML += '<img src="images/hearts.png">';
                            healSound.play();                            
                            if(!players[x].alive){
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
            else{
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
        else{
            console.log(`${foundPlayer.name} tried to use an item but does not have one.`);
        }
    }
}
    // end class rewrite
    // let foundFighter = false;
    // let foundFighterID = false;
    // for(let fid = 1; fid <= 4; fid++)
    // {
    //     let findFighter = 'fighter'+fid;
    //     if(gameInfo[findFighter].active)
    //     {
    //         if(gameInfo[findFighter].name.toLowerCase() == user['display-name'].toLowerCase())
    //         {
    //             foundFighter = findFighter;
    //             foundFighterID = fid;
    //         }
    //     }
    // }
    // if(foundFighter)
    // {
    //     if(gameInfo[foundFighter].item && gameInfo[foundFighter].alive)
    //     {
    //         statusMesssage(`${gameInfo[foundFighter].name} used an item!`);
    //         gameInfo[foundFighter].item = false;
    //         itemIcon(foundFighterID, false);
    //         let healChance = randomNumber(gameSettings.healChanceMin, gameSettings.healChanceMax);
    //         if(healChance == 2)
    //         {
    //             let backfireChance = randomNumber(gameSettings.healBackfireChanceMin, gameSettings.healBackfireChanceMax);
    //             if(backfireChance == 2)
    //             {
    //                 let healedBossClass = document.getElementsByClassName('bossBox')[0];
    //                 let healedBossImage = healedBossClass.querySelector('.boss');
    //                 let oldImage = healedBossImage.innerHTML;
    //                 healedBossImage.innerHTML += '<img src="hearts.png">';
    //                 healSound.play();
    //                 await updateHealth(0, (gameInfo.enemy.health + 10));
    //                 statusMesssage(`${gameInfo[foundFighter].name} healed the boss 10HP!`);
    //                 await sleep(2);
    //                 healedBossImage.innerHTML = oldImage;
    //             }
    //             else
    //             {
    //                 for(let hid = 1; hid <= 4; hid++)                    
    //                 {
    //                     if(gameInfo['fighter'+hid].active)
    //                     {
    //                         let healedFighterClass = document.getElementsByClassName('fighter'+hid)[0];
    //                         let healedFighterImage = healedFighterClass.querySelector('.fighterImage');
    //                         let oldImage = healedFighterImage.innerHTML;
    //                         healedFighterImage.innerHTML += '<img src="hearts.png">';
    //                         healSound.play();
    //                         if(!gameInfo['fighter'+hid].alive)
    //                         {
    //                             gameInfo['fighter'+hid].alive = true;
    //                             gameInfo['fighter'+hid].health = 0; // reset to 0 in case they're negative health
    //                             statusMesssage(`${gameInfo['fighter'+hid].name} was revived!`);
    //                         }
    //                         await updateHealth(hid, (gameInfo['fighter'+hid].health + 10));
    //                         statusMesssage(`${gameInfo[foundFighter].name} healed ${gameInfo['fighter'+hid].name} 10HP!`);
    //                         await sleep(2);
    //                         healedFighterImage.innerHTML = oldImage;
    //                     }
    //                 }
    //             }
    //         }
    //         else
    //         {
    //             let healedBossClass = document.getElementsByClassName('bossBox')[0];
    //             let healedBossImage = healedBossClass.querySelector('.boss');
    //             let oldImage = healedBossImage.innerHTML;
    //             healedBossImage.innerHTML += '<img src="boom.png">';                
    //             itemAttackSound.play();
    //             let itemAttackDamage = (5 + randomNumber(0,5));
    //             statusMesssage(`${gameInfo[foundFighter].name}'s item did ${itemAttackDamage} damage!`);
    //             await updateHealth(0, (gameInfo.enemy.health - itemAttackDamage));
    //             await sleep(1);
    //             healedBossImage.innerHTML = oldImage;                
    //         }
    //         await sleep(1);
    //     }
    //     else
    //     {
    //         console.log(`${gameInfo[foundFighter].name} tried to use an item but does not have one.`);
    //     }
    // }

async function processChat(channel, user, message, self) 
{  
    if(message.toLowerCase() == '!join'){
        await addPlayer(user);
    }
    if(message.toLowerCase() == '!item'){
        await useItem(user);
    }
    // if(message.toLowerCase() == 'a') // TO DO comment out before commit 
    // { 
    //     if(testCommands)
    //     {
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

// var bossAttackAnimation = anime({
//     targets: '.boss',
//     translateY: 20,
//     direction: 'alternate',
//     duration: 100,
//     autoplay: false,
//     easing: 'easeInOutBounce'
//   });

// var fighter1AttackAnimation = '';
// var fighter2AttackAnimation = '';
// var fighter3AttackAnimation = '';
// var fighter4AttackAnimation = '';

