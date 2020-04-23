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
boss: {active: true, name: 'Goteem man', health: 100, item: false, healCount: 0, minAttack: 1, maxAttack: 5, image: 'goteem.png'},
fighter1: {active: false, alive: false, name: 'nobody', health: 0, item: false, itemTick: 0, image: 'knight-orange.png', animation: undefined},
fighter2: {active: false, alive: false, name: 'nobody', health: 0, item: false, itemTick: 0, image: 'knight-orange.png', animation: undefined},
fighter3: {active: false, alive: false, name: 'nobody', health: 0, item: false, itemTick: 0, image: 'knight-orange.png', animation: undefined},
fighter4: {active: false, alive: false, name: 'nobody', health: 0, item: false, itemTick: 0, image: 'knight-orange.png', animation: undefined}};

function sleep(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
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

async function attackBoss(fighterID)
{
    let findFighter = 'fighter' + fighterID;
    if(gameInfo[findFighter].active && gameInfo[findFighter].alive)
    {
        let playerAttack = randomNumber(1, 2);                        
        gameInfo[findFighter].animation.play();
        statusMesssage(`${gameInfo[findFighter].name} attacked for ${playerAttack} damage`);
        updateHealth(0, (gameInfo.boss.health - playerAttack));
        await sleep(1000);
        gameInfo[findFighter].itemTick++;
        if(gameInfo[findFighter].itemTick >= 5 && !gameInfo[findFighter].item && gameInfo[findFighter].alive)
        {
            gameInfo[findFighter].item = true;
            gameInfo[findFighter].itemTick = 0;
            statusMesssage(`${gameInfo[findFighter].name} found an item!`);
            itemIcon(fighterID, true);
            await sleep(500);
        }
    }
}

async function runTurn()
{
    if(gameInfo.gameActive)
    {
        let bossAttack = randomNumber(gameInfo.boss.minAttack, gameInfo.boss.maxAttack);
        statusMesssage(`${gameInfo.boss.name} attacked for ${bossAttack} damage`);
        bossAttackAnimation.play();
        if(gameInfo.fighter1.alive)
        {
            let dodgeChance = randomNumber(1, 20);
            if(dodgeChance == 6)
            {
                statusMesssage(`${gameInfo.fighter1.name} dodged!`);
            }
            else
            {
                updateHealth(1, (gameInfo.fighter1.health - bossAttack));
            }
        }
        if(gameInfo.fighter2.alive)
        {
            let dodgeChance = randomNumber(1, 20);
            if(dodgeChance == 6)
            {
                statusMesssage(`${gameInfo.fighter2.name} dodged!`);
            }
            else
            {
                updateHealth(2, (gameInfo.fighter2.health - bossAttack));            
            }
        }
        if(gameInfo.fighter3.alive)
        {
            let dodgeChance = randomNumber(1, 20);
            if(dodgeChance == 6)
            {
                statusMesssage(`${gameInfo.fighter3.name} dodged!`);
            }
            else
            {
                updateHealth(3, (gameInfo.fighter3.health - bossAttack));            
            }
        }
        if(gameInfo.fighter4.alive)
        {
            let dodgeChance = randomNumber(1, 20);
            if(dodgeChance == 6)
            {
                statusMesssage(`${gameInfo.fighter4.name} dodged!`);
            }
            else
            {            
                updateHealth(4, (gameInfo.fighter4.health - bossAttack));            
            }
        }
        await sleep(1000);
        for(let fid = 1; fid <= 4; fid++)
        {
            await attackBoss(fid);
        }
        await sleep(500);
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

function updateHealth(fighterID, health)
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
    updateHealth(fighterID, 100);
    statusMesssage(`${user['display-name']} joined!`);
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
    await sleep(1000);
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
            let healChance = randomNumber(1,3);
            if(healChance == 2)
            {
                let backfireChance = randomNumber(1,10);
                if(backfireChance == 2)
                {
                    updateHealth(0, (gameInfo.boss.health + 10));
                    statusMesssage(`${gameInfo[foundFighter].name} healed the boss 10HP!`);
                }
                else
                {
                    for(let hid = 1; hid <= 4; hid++)                    
                    {
                        updateHealth(hid, (gameInfo['fighter'+hid].health + 10));
                        statusMesssage(`${gameInfo[foundFighter].name} healed everyone 10HP!`);
                    }
                }
            }
            else
            {
                statusMesssage(`${gameInfo[foundFighter].name}'s item damaged ${gameInfo.boss.name} 10 HP!`);
                updateHealth(0, (gameInfo.boss.health - 10));
                await sleep(1000);                
            }
            await sleep(1000);
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
        else
        {
            gameInfo.gameActive = true;
            gameInfo.boss.active = true;
            updateHealth(0, 100); // boss
            await addFighter(1, user);
        }
    }
    if(message.toLowerCase() == '!item')
    {
        await useItem(user);
    }
    // if(message.toLowerCase() == 'a')
    // { 
    //     // bossAttackAnimation.play();
    //     // gameInfo.fighter1.animation.play();
    //     // test command
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

// setInterval(runTurn, 10000); // 30000 = 30 seconds - see fix timing note below
var gameHandle = setInterval(runTurn, 5000); 
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

/*
TO DO fix timing

runTurn - 30 seconds
sleep after 
            attack - 1 second
            item received - 1 second
            item used - 1 second
            player joins - 2 seconds
            player dies - 1 second
*/
