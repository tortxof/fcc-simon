var COLORS = [
  'green',
  'red',
  'yellow',
  'blue'
];

$('.button').on('mousedown', function() {
  $(this).addClass($(this).data('color') + '-light');
});

$('.button').on('mouseup', function() {
  $(this).removeClass($(this).data('color') + '-light');
});

function lightOn(color) {
  $('button.' + color).addClass(color + '-light');
}

function lightOff(color) {
  $('button.' + color).removeClass(color + '-light');
}

function play_seq(seq) {
  for (var i=0; i<seq.length; i++) {
    setTimeout(lightOn, i * 1000, COLORS[seq[i]]);
    setTimeout(lightOff, (i * 1000) + 500, COLORS[seq[i]]);
  }
}
