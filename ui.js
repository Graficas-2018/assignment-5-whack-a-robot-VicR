/*
  Three.js Whack Game
  Víctor Rendón Suárez | A01022462
  11/10/2018
*/
function addPoint(points, reset){
  gamePoints = reset?points:gamePoints+points;
  $("#ptsLabel").text(""+gamePoints);
}
