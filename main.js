let twitchClientID = ''; // TO DO LOAD THIS FROM SOMEWHERE ELSE BEFORE RELEASING SOURCE

var channels = ['varixx'];
clientOptions = {
    options: {
            debug: true
        },
    channels: channels
};


let healthBarHTML = '<div class="fighterImage"></div><div class="progress"><div class="progress-bar" role="progressbar" style="width: 75%" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"></div></div>';
let itemBarHTML = '<div class="fighterItem"></div>';

let gameInfo = {gameActive: false,
boss: {active: true, name: 'Goteem man', health: 100, item: false, healCount: 0, minAttack: 2, maxAttack: 10, image: 'goteem.png'},
fighter1: {active: false, alive: false, name: 'nobody', health: 0, item: false, itemTick: 0, image: 'knight-orange.png', animation: undefined},
fighter2: {active: false, alive: false, name: 'nobody', health: 0, item: false, itemTick: 0, image: 'knight-orange.png', animation: undefined},
fighter3: {active: false, alive: false, name: 'nobody', health: 0, item: false, itemTick: 0, image: 'knight-orange.png', animation: undefined},
fighter4: {active: false, alive: false, name: 'nobody', health: 0, item: false, itemTick: 0, image: 'knight-orange.png', animation: undefined}};

let bossHitSound = new Audio('bossHit.wav');
let joinSound = new Audio('join.wav');
let fighterHitSound = new Audio('hit.wav');
let healSound = new Audio('heal.wav');

function sleep(sec) 
{
    return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

function randomNumber(min, max)
{
    let rand = Math.floor((Math.random() * max) + min);
    return rand;
}

function updateFighterImage(fighterID)
{
    let fighterClass = document.getElementsByClassName('fighter'+fighterID)[0];
    let fighterImage = fighterClass.querySelector('.fighterImage');
    fighterImage.style.backgroundImage = `url('${gameInfo['fighter'+fighterID].image}')`;
}

function itemIcon(fighterID, status)
{
    let fighterClass = document.getElementsByClassName('fighter'+fighterID)[0];
    let itemIcon = fighterClass.querySelector('.fighterItem');
    
    if(status)
    {
        itemIcon.style.visibility = 'visible';
    }
    else
    {
        itemIcon.style.visibility = 'hidden';
    }
}

async function fightersTurn(fighterID)
{
    let findFighter = 'fighter' + fighterID;
    if(gameInfo[findFighter].active && gameInfo[findFighter].alive)
    {
        let playerAttack = randomNumber(1, 2);                        
        gameInfo[findFighter].animation.play();
        statusMesssage(`${gameInfo[findFighter].name} attacked for ${playerAttack} damage`);
        fighterHitSound.play();
        await updateHealth(0, (gameInfo.boss.health - playerAttack));
        await sleep(1);
        if(!gameInfo[findFighter].item && gameInfo[findFighter].alive)
        {
            gameInfo[findFighter].itemTick++;
            if(gameInfo[findFighter].itemTick >= 5)
            {
                let itemChance = randomNumber(1,5);
                if(itemChance == 4)
                {
                    gameInfo[findFighter].item = true;
                    gameInfo[findFighter].itemTick = 0;
                    statusMesssage(`${gameInfo[findFighter].name} found an item!`);
                    itemIcon(fighterID, true);
                    await sleep(1);
                }
            }
        }
    }
}

async function bossTurn()
{
    statusMesssage(`${gameInfo.boss.name} attacked!`);
    await sleep(1);
    for(let fid = 1; fid <= 4; fid++)
    {
        if(gameInfo['fighter'+fid].active && gameInfo['fighter'+fid].alive)
        {
            let attackChance = randomNumber(1,10);
            if(attackChance == 5)
            {  
                console.log(`Skipping attack on ${gameInfo['fighter'+fid].name}`);
                continue;
            }
            let bossAttack = randomNumber(gameInfo.boss.minAttack, gameInfo.boss.maxAttack);
            bossAttackAnimation.play();            
            let dodgeChance = randomNumber(1, 20);
            if(dodgeChance == 6)
            {
                await sleep(1);
                statusMesssage(`${gameInfo['fighter'+fid].name} dodged!`);
            }
            else
            {
                statusMesssage(`${gameInfo['fighter'+fid].name} took ${bossAttack} damage`);
                bossHitSound.play();
                await updateHealth(fid, (gameInfo['fighter'+fid].health - bossAttack));
            }
            await sleep(1);
        }
    }
    await sleep(1);
}

async function runTurn()
{
    if(gameInfo.gameActive)
    {
        await bossTurn();
        for(let fid = 1; fid <= 4; fid++)
        {
            await fightersTurn(fid);
        }
    }
    else
    {
        statusMesssage(`${gameInfo.boss.name} appeared! Type !join to join.`);
    }
}

function statusMesssage(msg)
{
    document.getElementsByClassName('statusMessage')[0].innerHTML = msg;
}

function endGame()
{
    clearInterval(gameHandle);
    gameInfo.gameActive = false;
    gameInfo.boss.active = false;
    gameInfo.boss.health = false;
    gameInfo.boss.healCount = 0;
    gameInfo.boss.minAttack = 0;
    gameInfo.boss.maxAttack = 0;
    // updateHealth(0, 100); // do this on restart game instead when the command is created 

    for(let fid = 1; fid <= 4; fid++)
    {
        gameInfo['fighter'+fid].active = false;
        gameInfo['fighter'+fid].alive = false;
        gameInfo['fighter'+fid].name = 'nobody'; 
        gameInfo['fighter'+fid].item = false; 
        gameInfo['fighter'+fid].itemTick = 0;
        gameInfo['fighter'+fid].image = 'knight-orange.png';
        gameInfo['fighter'+fid].animation = undefined;
        console.log(`stats reset for fighter ${fid}`);
    }
}

async function updateHealth(fighterID, health)
{
    let healthBar = null;
    if(fighterID == 0)
    {
        let bossBar = document.getElementsByClassName('bossBox')[0];
        healthBar = bossBar.querySelector('.progress-bar');
        gameInfo.boss.health = health;
        if(gameInfo.boss.health <= 0)
        {
            endGame();
            statusMesssage(`${gameInfo.boss.name} has been defeated!`);
        }
    }
    else if(fighterID >= 1 && fighterID < 5)
    {
        let fighterBar = document.getElementsByClassName('fighter'+fighterID)[0];
        let findFighter = 'fighter' + fighterID;
        healthBar = fighterBar.querySelector('.progress-bar');
        gameInfo[findFighter].health = health;
        if(gameInfo[findFighter].health <= 0)
        {
            statusMesssage(`${gameInfo[findFighter].name} died!`);
            gameInfo[findFighter].alive = false;
            gameInfo[findFighter].itemTick = 0;
            gameInfo[findFighter].item = false;
            itemIcon(fighterID, false);
            await sleep(1);
        }
    }
    // end game if all fighters are dead 
    // TO DO change this to a loop
    if(gameInfo.fighter1.active)
    {
        if(gameInfo.fighter2.active)
        {
            if(gameInfo.fighter3.active)
            {
                if(gameInfo.fighter4.active)
                {
                    endGame();
                    statusMesssage(`${gameInfo.boss.name} wins!`);
                }
            }
        }
        else
        {
            if(gameInfo.fighter1.alive === false)
            {
                endGame();
                statusMesssage(`${gameInfo.boss.name} wins!`);
            }
        }
    }
    if(healthBar != null)
    {
        healthBar.setAttribute("style", `width: ${health}%`);
    }

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
            'Client-ID':  twitchClientID
        }
    });
    try
    {
        let resultImage = await response.json();
        if(resultImage.logo.includes('user-default-pictures'))
        {
            return false;
        }
        else
        {
           return resultImage.logo; 
        }  
    }
    catch(error)
    {
        return false;
    }
}

async function addFighter(fighterID, user)
{
    let findFighter = 'fighter' + fighterID;
    let fighterBar = document.getElementsByClassName(findFighter)[0];
    fighterBar.innerHTML = healthBarHTML + user['display-name'] + itemBarHTML;
    fighterBar.style.visibility = 'visible';
    gameInfo[findFighter].active = true;
    gameInfo[findFighter].alive = true;
    gameInfo[findFighter].name = user['display-name'];
    await updateHealth(fighterID, 100);
    statusMesssage(`${user['display-name']} joined!`);
    joinSound.play();
    let twitchImage = await getTwitchImage(user);
    if(twitchImage)
    {
        gameInfo[findFighter].image = twitchImage;
        updateFighterImage(fighterID);
    }
    else
    {
        console.log(`Invalid twitch image for ${user['display-name']} (ID: ${user['user-id']}), using default image.`);
    }
    gameInfo[findFighter].animation = anime({
        targets: `.fighters .fighter${fighterID} .fighterImage`,
        translateY: -20,
        direction: 'alternate',
        duration: 100,
        autoplay: false,
        easing: 'easeInOutBounce'
    });    
    await sleep(1);
}

async function useItem(user)
{
    let foundFighter = false;
    let foundFighterID = false;
    for(let fid = 1; fid <= 4; fid++)
    {
        let findFighter = 'fighter'+fid;
        if(gameInfo[findFighter].active)
        {
            if(gameInfo[findFighter].name.toLowerCase() == user['display-name'].toLowerCase())
            {
                foundFighter = findFighter;
                foundFighterID = fid;
            }
        }
    }
    if(foundFighter)
    {
        if(gameInfo[foundFighter].item && gameInfo[foundFighter].alive)
        {
            statusMesssage(`${gameInfo[foundFighter].name} used an item!`);
            gameInfo[foundFighter].item = false;
            itemIcon(foundFighterID, false);
            let healChance = randomNumber(1,2);
            if(healChance == 2)
            {
                let backfireChance = randomNumber(1,10);
                if(backfireChance == 2)
                {
                    await updateHealth(0, (gameInfo.boss.health + 10));
                    statusMesssage(`${gameInfo[foundFighter].name} healed the boss 10HP!`);
                }
                else
                {
                    for(let hid = 1; hid <= 4; hid++)                    
                    {
                        if(gameInfo['fighter'+hid].active)
                        {
                            let healedFighterClass = document.getElementsByClassName('fighter'+hid)[0];
                            let healedFighterImage = healedFighterClass.querySelector('.fighterImage');
                            let oldImage = healedFighterImage.innerHTML;
                            healedFighterImage.innerHTML += '<img src="hearts.png">';
                            healSound.play();
                            await updateHealth(hid, (gameInfo['fighter'+hid].health + 10));
                            statusMesssage(`${gameInfo[foundFighter].name} healed everyone 10HP!`);
                            await sleep(2);
                            healedFighterImage.innerHTML = oldImage;
                        }
                    }
                }
            }
            else
            {
                statusMesssage(`${gameInfo[foundFighter].name}'s item damaged ${gameInfo.boss.name} 5 HP!`);
                await updateHealth(0, (gameInfo.boss.health - 5));
            }
            await sleep(1);
        }
        else
        {
            console.log(`${gameInfo[foundFighter].name} tried to use an item but does not have one.`);
        }
    }
}

async function processChat(channel, user, message, self) 
{  
    if(message.toLowerCase() == '!join')
    {
        if(gameInfo.gameActive)
        {
            // check active fighters and assign next available slot
            // TO DO change this to a loop
            if(gameInfo.fighter1.active)
            {
                if(gameInfo.fighter2.active)
                {
                    if(gameInfo.fighter3.active)
                    {
                        if(gameInfo.fighter4.active)
                        {
                            statusMesssage('No active player slots!');
                        }
                        else
                        {
                            await addFighter(4, user);
                        }
                    }
                    else
                    {
                        await addFighter(3, user);
                    }
                }
                else
                {
                    await addFighter(2, user);
                }
            }
        }
        else // move this so fighter 1 can't join after the game has ended. this should go into a start game function that can be used to restart the game. 
        {
            gameInfo.gameActive = true;
            gameInfo.boss.active = true;
            await updateHealth(0, 100); // boss
            await addFighter(1, user);
        }
    }
    if(message.toLowerCase() == '!item')
    {
        await useItem(user);
    }
    // if(message.toLowerCase() == 'a')
    // { 
    //     // test command
    //     gameInfo.fighter1.item = true;
    //     gameInfo.fighter1.itemTick = 0;
    //     statusMesssage(`${gameInfo.fighter1.name} found an !item`);
    //     itemIcon(1, true);
    //     await sleep(1);
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

// var gameHandle = setInterval(runTurn, 5000); 
var gameHandle = setInterval(runTurn, 15000); // 15000 = 15 seconds
statusMesssage(`${gameInfo.boss.name} appeared! Type !join to join.`);

var bossAttackAnimation = anime({
    targets: '.boss',
    translateY: 20,
    direction: 'alternate',
    duration: 100,
    autoplay: false,
    easing: 'easeInOutBounce'
  });

var fighter1AttackAnimation = '';
var fighter2AttackAnimation = '';
var fighter3AttackAnimation = '';
var fighter4AttackAnimation = '';

