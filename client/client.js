var canvas = {
    stage: document.getElementById('stage'),
    grid: document.getElementById('grid'),
    ui: document.getElementById('ui')
};
var ctx = {
    stage: canvas.stage.getContext('2d'),
    grid: canvas.grid.getContext('2d'),
    ui: canvas.ui.getContext('2d')
};
var stageBoundingRect;
var gameAnimationFrame;
function resizeCanvas () {
    for (var name in canvas) {
        canvas[name].width = window.innerWidth;
        canvas[name].height = window.innerHeight;
    }
    stageBoundingRect = canvas.stage.getBoundingClientRect();
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

canvas.stage.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    return false;
});

var socket = io();

var players = [
    {id: 0, name: 'Uncontrolled', color: 'white'},
    {id: 1, name: 'Chase', color: 'blue'},
    {id: 2, name: 'Derek', color: 'red' }
];

var attacks = [];
var Attack = function (ships, fromPlanet, toPlanet){
    console.log('started at',new Date());
    this.ships = ships;
    this.player = planets[fromPlanet].controlledBy;
    this.fromPlanet = fromPlanet;
    this.toPlanet = toPlanet;
    this.x=planets[fromPlanet].x;
    this.y=planets[fromPlanet].y;
    this.update = function(timeSinceLastUpdate){
        var speed = 50;
        var dx = planets[this.toPlanet].x - this.x;
        var dy = planets[this.toPlanet].y - this.y;
        var distance = Math.sqrt(dx*dx+dy*dy);
        this.x += (dx / distance) * speed * timeSinceLastUpdate;
        this.y += (dy / distance) * speed * timeSinceLastUpdate;
        if (this.arrived()) {
            this.doBattle();
        }
    };
    this.arrived = function(){
        if(Math.abs(planets[this.toPlanet].x - this.x) <= (planets[this.toPlanet].size*10 + this.size) && Math.abs(planets[this.toPlanet].y - this.y) <= (planets[this.toPlanet].size*10 + this.size)){
            console.log('arrived',new Date());
            return true;
        }
        return false;
    };
    this.doBattle = function(){
        //do we controll the planet?
        if(planets[this.toPlanet].controlledBy === this.player){
            planets[this.toPlanet].ships += this.ships;
        }
        //Nope lets get EM!
        else{
            planets[this.toPlanet].ships -= this.ships;
        }
        //we took over the planet!
        if(planets[this.toPlanet].ships < 0){
            planets[this.toPlanet].controlledBy = this.player;
            planets[this.toPlanet].ships = Math.abs(planets[this.toPlanet].ships);
        }
        //stop the attack
        attacks.splice(attacks.indexOf(this),1);
    };

    this.draw = function(ctx){
        ctx.beginPath();
        ctx.fillStyle = players[this.player].color;
        ctx.arc(this.x, this.y,this.size,0,2*Math.PI,false);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText(this.ships,this.x, this.y);
    };
};

var planet = function(ships, size, x, y, player){
    this.controlledBy = player;
    this.ships = ships;
    this.size= size;
    this.x= x;
    this.y = y;
    this.active = false;
    this.attack = function(planet){
        console.log('Attacking planet '+planet);
        var shipsToSend = Math.floor(this.ships/2);
        var newAttack = new Attack(shipsToSend,planets.indexOf(this),planet);
        this.ships -= shipsToSend;
        attacks.push(newAttack);
        console.log(attacks);
    };
    this.update= function(timeSinceLastUpdate){
        //is this planet controlled by a player? if not dont add ships
        if(this.controlledBy > 0) {
            this.ships += this.size *timeSinceLastUpdate;
        }
    };
    this.draw = function(ctx){
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.size*10,0,2*Math.PI,false);
        ctx.fillStyle = this.controlledBy !== 'undefined'?players[this.controlledBy].color:'white';
        if(this.active){
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'white';
            ctx.stroke()
        }
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.fillText('Ships:', this.x-15, this.y);
        ctx.fillText(this.ships.toFixed(0), this.x-5, this.y+15);
    };
};
var planets = require('./pregenerated_planets')(planet,players);



var UPDATE_INTERVAL = 50;
var LAG_CAP = 1000;
var last = Date.now();
var lag = 0;
var fps = 0;
var fpsFilter = 50;
function gameLoop () {
    gameAnimationFrame = window.requestAnimationFrame(gameLoop);

    var current = Date.now();
    var delta = current - last;
    var frameFPS = 1000 / delta;
    fps += (frameFPS - fps) / fpsFilter;
    last = current;
    lag += delta;

    processInput();

    if (lag > LAG_CAP) {
        // if we're out of focus, rAF doesn't keep ticking, so lag can get
        // very large and take a long time to simulate (during which time
        // everything is locked up from the user's perspective)
        console.log('Shortening lag from', lag, 'to lag cap', LAG_CAP);
        lag = LAG_CAP;
    }
    while (lag >= UPDATE_INTERVAL) {
        game.tick++;
        update(UPDATE_INTERVAL / 1000);
        lag -= UPDATE_INTERVAL;
    }

    render(lag / UPDATE_INTERVAL);
}

var game = {
    id: null,
    tick: 0,
    gridNodeWidth: 10,
    gridNodeHeight: 10,
    mouse: {
        position: [0, 0],
        mouse1: false
    },
    player: {
        blockType: 0,
        isDrawing: false
    },
    activePlanet: null,
    setActivePlanet: function(planet){
        this.activePlanet = planet;
        for(var i=0;i<planets.length;i++){
            if(i !== planet){
                planets[i].active=false;
            }
        }
        planets[planet].active = true;
    },
    unsetActivePlanet: function(){
        this.activePlanet = null;
        for(var i=0;i<planets.length;i++){
            planets[i].active=false;
        }
    }
};

socket.on('connect', function () {
    var username = prompt('Username');
    var password = prompt('Game ID');
    socket.emit('join game', {'gamePassword':password,'username':username});
});
socket.on('game joined',function(gameId){
    console.log('joined game',gameId);
    game.id = gameId;
});
socket.on('start game',function(){
    console.log('starting game');
    gameAnimationFrame = window.requestAnimationFrame(gameLoop);
});


function getMousePos (event) {
    return [event.clientX - stageBoundingRect.left, event.clientY - stageBoundingRect.top];
}
function getClickedPlanet(event){
    for(var i=0;i<planets.length;i++){
        if(Math.sqrt((planets[i].x - event.clientX)*(planets[i].x - event.clientX) + (planets[i].y - event.clientY)*(planets[i].y - event.clientY)) <= planets[i].size*10){
            console.log('you clicked the planet',i);
            return i;
        }
    }
    console.log('we reached the end and didnt find and active planet');
    return false;
}

function checkVictoryConditions()
{
    var curPlayer = false;
    for(var i = 0; i<planets.length;i++){
        if(curPlayer === false){
            curPlayer = planets[i].controlledBy
        }
        else if(curPlayer != planets[i].controlledBy) {
            return false;
        }
    }
    for(var j=0; j<attacks.length; j++){
        if(curPlayer === false){
            curPlayer = attacks[j].player;
        }
        else if(curPlayer != attacks[j].player){
            return false;
        }
    }
    if(curPlayer !== false){
        ctx.ui.clearRect(0, 0, canvas.ui.width, canvas.ui.height);
        ctx.ui.font = 'bold 50pt Arial';
        ctx.ui.fillStyle = players[curPlayer].color;
        var vicortyString = players[curPlayer].name+' is Victorious'
        ctx.ui.fillText(vicortyString,canvas.ui.width/2-vicortyString.length,canvas.ui.height/2-50);
        window.cancelAnimationFrame(gameAnimationFrame);
    }
}

function update (dt) {
    for(var i = 0; i<planets.length;i++){
        planets[i].update(dt);
    }
    for(var j=0; j<attacks.length; j++){
        attacks[j].update(dt);
    }
}

function render (t) {
    ctx.stage.fillStyle = 'black';
    ctx.stage.fillRect(0, 0, canvas.stage.width, canvas.stage.height);
    for(var i = 0; i<planets.length;i++){
        planets[i].draw(ctx.stage);
    }
    for(var j=0; j<attacks.length; j++){
        attacks[j].draw(ctx.stage);
    }
    checkVictoryConditions();


    ctx.ui.clearRect(0, 0, canvas.ui.width, canvas.ui.height);
    ctx.ui.fillStyle = 'white';
    ctx.ui.fillText('FPS: ' + fps.toFixed(2), 15, canvas.ui.height - 15);
    ctx.ui.fillText('Mouse Pos: (' + game.mouse.position[0] + ',' + game.mouse.position[1] + ')', 15, canvas.ui.height - 30);
}


function processInput () {
    if (game.mouse.mouse1) {
        game.player.isDrawing = game.activeTile;
    } else {
        game.player.isDrawing = false;
    }
}
function handleMouseInput (event) {
    if (event.type === 'mousemove') {
        game.mouse.position = getMousePos(event);
    } else if(event.type === 'mousedown') {
        var clickedPlanet = getClickedPlanet(event);
        if(clickedPlanet !== false) {
            if (game.activePlanet === null) {
                if(planets[clickedPlanet].controlledBy === 0){
                    console.log('You cant control that planet, deactivating');
                    game.unsetActivePlanet();
                }
                else {
                    console.log('setting active planet', clickedPlanet);
                    game.setActivePlanet(clickedPlanet);
                }
            }
            else if(game.activePlanet !== clickedPlanet) {
                console.log('starting attack from',game.activePlanet,'to',clickedPlanet);
                planets[game.activePlanet].attack(clickedPlanet);
                game.unsetActivePlanet();
            }
            else{
                console.log('you clicked the same planet, deactivating');
                game.unsetActivePlanet();
            }
        }
        else{
            console.log('clearing active planet');
            game.unsetActivePlanet();
        }
    }

    game.mouse.shift = event.shiftKey;
    game.mouse.meta = event.metaKey;
    game.mouse.ctrl = event.ctrlKey;
    game.mouse.alt = event.altKey;
}

function handleKeyboardInput(event){

}

canvas.stage.addEventListener('mousemove', handleMouseInput);
canvas.stage.addEventListener('mousedown', handleMouseInput);
canvas.stage.addEventListener('mouseup', handleMouseInput);
window.addEventListener('keydown',handleKeyboardInput);