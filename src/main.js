/* eslint no-console: "off" */

var COLORS = [
  'green',
  'red',
  'yellow',
  'blue'
];

function GameState() {
  // Is the game switched on?
  this.on = false;
  // Is strict mode enabled?
  this.strict = false;
  // Are we waiting for player input?
  this.waiting_for_input = false;
  // Computer generated sequence. One element is added each turn.
  this.challenge_seq = [];
  // Player input. This is blanked each turn before player starts entering the sequence.
  this.input_seq = [];
}

var game_state = new GameState();

function lightOn(color) {
  $('path.' + color).addClass(color + '-light');
}

function lightOff(color) {
  $('path.' + color).removeClass(color + '-light');
}

function flashAll() {
  console.log('flashAll');
  for (var i=0; i<3; i++) {
    for (var color=0; color<COLORS.length; color++){
      setTimeout(lightOn, (i * 400) + 200, COLORS[color]);
      setTimeout(lightOff, (i * 400) + 400, COLORS[color]);
    }
  }
}

function play_seq(seq) {
  console.log('play_seq');
  for (var i=0; i<seq.length; i++) {
    setTimeout(lightOn, (i * 800) + 400 , COLORS[seq[i]]);
    setTimeout(lightOff, (i * 800) + 800, COLORS[seq[i]]);
  }
}

function genChallengeSeq() {
  console.log('genChallengeSeq');
  game_state.challenge_seq.push(Math.floor(Math.random() * 4));
}

function check_sequence(input_seq, challenge_seq) {
  if (input_seq.length >= challenge_seq.length) {
    console.log('check_sequence complete');
    return challenge_seq.reduce(function(prev, curr, i) {
      return prev && (curr === input_seq[i]);
    }, true);
  } else {
    console.log('check_sequence incomplete');
    return challenge_seq.slice(0, input_seq.length).reduce(function(prev, curr, i) {
      return prev && (curr === input_seq[i]);
    }, true);
  }
}

$('.button').click(function() {
  if (game_state.waiting_for_input) {
    lightOn($(this).data('color'));
    setTimeout(function(color) {
      lightOff(color);
    }, 300, $(this).data('color'));
    game_state.input_seq.push(COLORS.indexOf($(this).data('color')));
  }
});
