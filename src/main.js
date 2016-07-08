var COLORS = [
  'green',
  'red',
  'yellow',
  'blue'
];

$('.button').on('click', function() {
  lightOn($(this).data('color'));
  setTimeout(function(color) {
    lightOff(color);
  }, 300, $(this).data('color'));
});

function lightOn(color) {
  $('path.' + color).addClass(color + '-light');
}

function lightOff(color) {
  $('path.' + color).removeClass(color + '-light');
}

function play_seq(seq) {
  console.log('play_seq');
  for (var i=0; i<seq.length; i++) {
    setTimeout(lightOn, (i * 1000) + 500 , COLORS[seq[i]]);
    setTimeout(lightOff, (i * 1000) + 1000, COLORS[seq[i]]);
  }
}

function gen_play_sequence() {
  console.log('gen_play_sequence');
  sequence.push(Math.floor(Math.random() * 4));
  play_seq(sequence);
  player_sequence = [];
}

function check_sequence() {
  console.log('check_sequence');
  if (player_sequence.length >= sequence.length) {
    var sequence_good = sequence.reduce(function(prev, curr, i) {
      return prev && (curr === player_sequence[i]);
    }, true);
    if (sequence_good) {
      gen_play_sequence();
    } else {
      sequence = [];
      player_sequence = [];
      game_running = false;
    }
  }
}

var sequence = [];
var player_sequence = [];
var game_running = false;

$('#reset').click(function() {
  sequence = [];
  player_sequence = [];
  game_running = false;
});

$('#start').click(function() {
  console.log('start');
  sequence = [];
  player_sequence = [];
  game_running = true;
  gen_play_sequence();
});

$('.button').click(function() {
  if (game_running) {
    player_sequence.push(COLORS.indexOf($(this).data('color')));
    check_sequence();
  }
});
