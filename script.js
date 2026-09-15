// Seven-screen pagination: any button with data-target swaps which .page
// is visible and updates the progress dots. Purely visual, in-memory
// state only — nothing is saved or sent anywhere.
document.addEventListener('DOMContentLoaded', function () {
  var pages = document.querySelectorAll('.page');
  var dots = document.querySelectorAll('.progress-dot');

  function showPage(index) {
    pages.forEach(function (page, i) {
      page.hidden = i !== index;
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('active', i === index);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showPage(parseInt(btn.getAttribute('data-target'), 10));
    });
  });
});

// Diagnosis chips: tap Context / Role / Task / Format to select which
// part is missing, then Check reveals the answer.
document.addEventListener('DOMContentLoaded', function () {
  var LABELS = { context: 'Context', role: 'Role', task: 'Task', format: 'Format' };

  document.querySelectorAll('.diag-row').forEach(function (row) {
    var chips = row.querySelectorAll('.diag-chip');
    var correct = row.getAttribute('data-missing').split(',');
    var checkBtn = row.parentElement.querySelector('.btn-check');
    var feedback = row.parentElement.querySelector('.diag-feedback');

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chip.classList.toggle('selected');
      });
    });

    checkBtn.addEventListener('click', function () {
      var selected = Array.prototype.filter
        .call(chips, function (c) { return c.classList.contains('selected'); })
        .map(function (c) { return c.getAttribute('data-el'); });

      var isMatch = selected.length === correct.length &&
        selected.every(function (el) { return correct.indexOf(el) !== -1; });

      var correctLabels = correct.map(function (el) { return LABELS[el]; }).join(', ');
      feedback.classList.remove('correct', 'incorrect');
      if (isMatch) {
        feedback.classList.add('correct');
        feedback.textContent = 'Correct — ' + correctLabels + ' was missing.';
      } else {
        feedback.classList.add('incorrect');
        feedback.textContent = 'Not quite. The missing part was: ' + correctLabels + '.';
      }
      feedback.hidden = false;
    });
  });
});

// Quick MCQs: tap an option to select it and reveal one line of feedback.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.mcq-group').forEach(function (group) {
    var options = group.querySelectorAll('.mcq-option');
    var feedback = group.querySelector('.mcq-feedback');
    options.forEach(function (option) {
      option.addEventListener('click', function () {
        options.forEach(function (o) { o.classList.remove('selected'); });
        option.classList.add('selected');
        if (feedback) {
          feedback.textContent = option.getAttribute('data-feedback') || '';
          feedback.hidden = false;
        }
      });
    });
  });
});

// Download my answers: compile all 5 exercises into one plain-text file
// the learner can keep as evidence, since nothing here is saved.
document.addEventListener('DOMContentLoaded', function () {
  var downloadBtn = document.getElementById('download-btn');
  if (!downloadBtn) return;

  var WEAK_REQUESTS = [
    'You are a workshop instructor. Write a safety reminder. Format it as 3 points for the noticeboard.',
    'For new trainees, before the practical, write a safety reminder. Format it as 3 points for the noticeboard.',
    "You are the class representative. The group's project is due Friday (practice date). Format it as one short message.",
    'You are a lab assistant. Students have a chemistry practical today. Write a short safety note.',
    'Write about machine maintenance.'
  ];

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }

  function selectedMcq(exNum) {
    var groups = document.querySelectorAll('#page-' + (exNum + 1) + ' .mcq-option.selected');
    return groups.length ? groups[0].textContent.trim() : '(not answered)';
  }

  downloadBtn.addEventListener('click', function () {
    var lines = ['Rewrite Five Weak Requests — my answers', ''];
    for (var i = 1; i <= 5; i++) {
      lines.push('Exercise ' + i);
      lines.push('Weak request: ' + WEAK_REQUESTS[i - 1]);
      lines.push('My rewrite: ' + (val('ex' + i + '-rewrite') || '(not answered)'));
      lines.push('Output from weak request: ' + (val('ex' + i + '-out-weak') || '(not answered)'));
      lines.push('Output from my rewrite: ' + (val('ex' + i + '-out-new') || '(not answered)'));
      lines.push('Better answer: ' + selectedMcq(i));
      lines.push('Why: ' + (val('ex' + i + '-why') || '(not answered)'));
      lines.push('');
    }

    var blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'rewrite-five-weak-requests-answers.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
