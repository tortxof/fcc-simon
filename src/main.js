/* eslint no-console: "off" */

var COLORS = [
  'green',
  'red',
  'yellow',
  'blue'
];

var NOTES = {
  green: 164.814,
  yellow: 277.183,
  red: 220,
  blue: 329.628
};

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var gainNode = audioCtx.createGain();
gainNode.gain.value = 0.5;
gainNode.connect(audioCtx.destination);

function GameState() {
  // Is the game switched on?
  this.on = false;
  // Is strict mode enabled?
  this.strict = false;
  // Is endless mode enabled?
  this.endless = false;
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

function playNote(color, start, stop) {
  var currentTime = audioCtx.currentTime;
  var oscillator = audioCtx.createOscillator();
  oscillator.type = 'sine';
  oscillator.frequency.value = NOTES[color];
  oscillator.connect(gainNode);
  oscillator.start(currentTime + start);
  oscillator.stop(currentTime + stop);
}

function playChord(start, stop, chord) {
  var currentTime = audioCtx.currentTime;
  chord = chord || [
    330,
    110,
    55
  ];
  var oscillators = chord.map(function(freq) {
    var oscillator = audioCtx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    oscillator.connect(gainNode);
    return oscillator;
  });
  oscillators.forEach(function(oscillator) {
    oscillator.start(currentTime + start);
    oscillator.stop(currentTime + stop);
  });
}

function flashAll() {
  console.log('flashAll');
  var num_flashes = 3;
  var period = 150;
  for (var i = 0; i < num_flashes; i++) {
    var start = (i * period) + (period / 2);
    var stop = (i * period) + period;
    playChord(start / 1000, stop / 1000);
    for (var color=0; color<COLORS.length; color++){
      setTimeout(lightOn, start, COLORS[color]);
      setTimeout(lightOff, stop, COLORS[color]);
    }
  }
  // Return time to finish flashes.
  return ((num_flashes - 1) * period) + period;
}

function playWin() {
  console.log('playWin');
  var period = 150;
  COLORS.forEach(function(color, i) {
    var startTime = i * period;
    var stopTime = i * period + Math.floor(period * 0.8);
    setTimeout(lightOn, startTime, color);
    setTimeout(lightOff, stopTime, color);
    playNote(color, startTime / 1000, stopTime / 1000);
  });
  var startTime = period * (COLORS.length + 1);
  var stopTime = startTime + (period / 2);
  COLORS.forEach(function(color) {
    setTimeout(lightOn, startTime, color);
    setTimeout(lightOff, stopTime, color);
    setTimeout(lightOn, startTime + period, color);
    setTimeout(lightOff, stopTime + period, color);
  });
  var chord = [220, 277.183];
  playChord(startTime / 1000, stopTime / 1000, chord);
  playChord((startTime + period) / 1000, (stopTime + period) / 1000, chord);
  return period * 7;
}

function playSeq(seq) {
  console.log('play_seq');
  var period = -25 * seq.length + 800;
  for (var i = 0; i < seq.length; i++) {
    var color = COLORS[seq[i]];
    var startTime = (i * period) + (period / 2);
    var stopTime = (i * period) + period;
    setTimeout(lightOn, startTime, color);
    setTimeout(lightOff, stopTime, color);
    playNote(
      color,
      startTime / 1000,
      stopTime / 1000
    );
  }
  // Return time to finish playback.
  return ((seq.length - 1) * period) + period;
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

function updateEndlessIndicator() {
  if (game_state.endless) {
    $('#endless-indicator').addClass('on');
  } else {
    $('#endless-indicator').removeClass('on');
  }
}

$('#power').click(function() {
  if (game_state.on) {
    console.log('power off');
    $(this).removeClass('on');
    $('#count').text('');
    game_state = new GameState();
    updateStrictIndicator();
    updateEndlessIndicator();
  } else {
    console.log('power on');
    $(this).addClass('on');
    game_state = new GameState();
    $('#count').text('--');
    game_state.on = true;
    game_state.waiting_for_input = false;
    updateStrictIndicator();
    updateEndlessIndicator();
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

$('#endless').click(function() {
  if (game_state.on) {
    game_state.endless = !game_state.endless;
  }
  updateEndlessIndicator();
});

$('.button').click(function() {
  if (game_state.waiting_for_input) {
    game_state.waiting_for_input = false;
    lightOn($(this).data('color'));
    setTimeout(function(color) {
      lightOff(color);
    }, 300, $(this).data('color'));
    playNote($(this).data('color'), 0, 0.3);
    game_state.input_seq.push(COLORS.indexOf($(this).data('color')));
    console.log('game_state.input_seq', game_state.input_seq);
    if (checkSequence(game_state.input_seq, game_state.challenge_seq)) {
      console.log('sequence good');
      if (game_state.input_seq.length >= game_state.challenge_seq.length) {
        game_state.input_seq = [];
        if (game_state.challenge_seq.length >= 20 && !game_state.endless) {
          console.log('win');
          setTimeout(function() {
            setTimeout(function() {
              game_state.challenge_seq = [];
              genChallengeSeq();
              setTimeout(function() {
                game_state.waiting_for_input = true;
              }, playSeq(game_state.challenge_seq));
            }, playWin());
          }, 500);
        } else {
          genChallengeSeq();
          setTimeout(function() {
            setTimeout(function() {
              game_state.waiting_for_input = true;
            }, playSeq(game_state.challenge_seq));
          }, 300);
        }
      } else {
        game_state.waiting_for_input = true;
      }
    } else {
      console.log('sequence bad');
      setTimeout(function() {
        setTimeout(function() {
          if (game_state.strict) {
            game_state.input_seq = [];
            game_state.challenge_seq = [];
            genChallengeSeq();
            setTimeout(function() {
              game_state.waiting_for_input = true;
            }, playSeq(game_state.challenge_seq));
          } else {
            setTimeout(function() {
              game_state.input_seq = [];
              game_state.waiting_for_input = true;
            }, playSeq(game_state.challenge_seq));
          }
        }, flashAll());
      }, 500);
    }
  }
});
