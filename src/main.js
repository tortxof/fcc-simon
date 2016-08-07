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
  var num_flashes = 3;
  for (var i = 0; i < num_flashes; i++) {
    for (var color=0; color<COLORS.length; color++){
      setTimeout(lightOn, (i * 400) + 200, COLORS[color]);
      setTimeout(lightOff, (i * 400) + 400, COLORS[color]);
    }
  }
  // Return time to finish flashes.
  return ((num_flashes - 1) * 400) + 400;
}

function playSeq(seq) {
  console.log('play_seq');
  for (var i = 0; i < seq.length; i++) {
    setTimeout(lightOn, (i * 800) + 400 , COLORS[seq[i]]);
    setTimeout(lightOff, (i * 800) + 800, COLORS[seq[i]]);
  }
  // Return time to finish playback.
  return ((seq.length - 1) * 800) + 800;
}

function genChallengeSeq() {
  console.log('genChallengeSeq');
  game_state.challenge_seq.push(Math.floor(Math.random() * 4));
  var count_display = game_state.challenge_seq.length.toString();
  if (count_display.length < 2) {
    count_display = '0' + count_display;
  }
  $('#count').text(count_display);
}

function checkSequence(input_seq, challenge_seq) {
  console.log('check_sequence');
  return challenge_seq
    .slice(0, input_seq.length)
    .reduce(function(prev, curr, i) {
      return prev && (curr === input_seq[i]);
    }, true);
}

function updateStrictIndicator() {
  if (game_state.strict) {
    $('#strict-indicator').addClass('on');
  } else {
    $('#strict-indicator').removeClass('on');
  }
}

$('#power').click(function() {
  if (game_state.on) {
    console.log('power off');
    $(this).removeClass('on');
    $('#count').text('');
    game_state = new GameState();
    updateStrictIndicator();
  } else {
    console.log('power on');
    $(this).addClass('on');
    game_state = new GameState();
    $('#count').text('--');
    game_state.on = true;
    game_state.waiting_for_input = false;
    updateStrictIndicator();
  }
});

$('#start').click(function() {
  if (game_state.on) {
    game_state.input_seq = [];
    game_state.challenge_seq = [];
    genChallengeSeq();
    playSeq(game_state.challenge_seq);
    game_state.waiting_for_input = true;
  }
});

$('#strict').click(function() {
  if (game_state.on) {
    game_state.strict = !game_state.strict;
  }
  updateStrictIndicator();
});

$('.button').click(function() {
  if (game_state.waiting_for_input) {
    game_state.waiting_for_input = false;
    lightOn($(this).data('color'));
    setTimeout(function(color) {
      lightOff(color);
    }, 300, $(this).data('color'));
    game_state.input_seq.push(COLORS.indexOf($(this).data('color')));
    console.log('game_state.input_seq', game_state.input_seq);
    if (checkSequence(game_state.input_seq, game_state.challenge_seq)) {
      console.log('sequence good');
      if (game_state.input_seq.length >= game_state.challenge_seq.length) {
        game_state.input_seq = [];
        genChallengeSeq();
        var play_seq_time = playSeq(game_state.challenge_seq);
        setTimeout(function() {
          game_state.waiting_for_input = true;
        }, play_seq_time);
      } else {
        game_state.waiting_for_input = true;
      }
    } else {
      console.log('sequence bad');
      setTimeout(function() {
        setTimeout(function() {
          setTimeout(function() {
            game_state.input_seq = [];
            game_state.waiting_for_input = true;
          }, playSeq(game_state.challenge_seq));
        }, flashAll());
      }, 500);
    }
  }
});
