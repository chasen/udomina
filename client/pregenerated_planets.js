module.exports = function(planet,players){
    var planets = [];

    planets[0] = new planet(0,5,100,100,players[1].id);
    planets[1] = new planet(0,5,1000,100,players[2].id);
    planets[2] = new planet(100,3,800,300,0);
    planets[3] = new planet(50,2,200,300,0);
    planets[4] = new planet(600,4,500,150,0);

    return planets;
};