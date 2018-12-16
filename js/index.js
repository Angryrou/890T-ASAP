// system variables

const q_per_round = 4; // each round has 4 questions
const sec_size = 4; // default: 4
const debug = true;
const q_response = ["Cong! You are right :)", "Sorry, you are wrong :("];

var q_pool; // a json array containing all the questions
var sec_index; // sec_id -> [q_id1, q_id2, q_id3, ...]

var current_round_level; // 1, 2 or 3
var current_q_pos; // 0, 1, 2, 3
var current_score; // 0-4
var current_choice; // A/B/C/D/X

var current_wrong_count_list; // default: [x1, x2, x3, x4] xi: the number of wrong ans in sec i at current round
var current_q_ids; // an array of question ids for the current round

var total_score;
var total_wrong_count_list; // default: [x1, x2, x3, x4] xi: the number of wrong ans in sec i as a whole

// initial state
function init() {
	q_pool = JSON.parse(test_pool);
	sec_index = buildIndexOn('sec');
	initVariables();
	initHTML();
	updateQuestion();
}

// init the variables when the page is loaded
function initVariables() {
	if (!debug && sec_size != q.length) {
		window.alert("sec_size and json cannot match");
	}
	current_round_level = 1;
	initCurrent();
	q_ids_generate(current_wrong_count_list);
	total_score = 0;
	total_wrong_count_list = new Array(sec_size).fill(0);
}

// update the showed questions
function updateQuestion() {
	var q_id = current_q_ids[current_q_pos];
	var q = q_pool[q_id];
	console.log(q_id);
	console.log(q);
	document.getElementById("question_content").innerText = q["question"];
	document.getElementById("A_content").innerText = q["choices"]["A"];
	document.getElementById("B_content").innerText = q["choices"]["B"];
	document.getElementById("C_content").innerText = q["choices"]["C"];
	document.getElementById("D_content").innerText = q["choices"]["D"];
}

// update the answer and scores 
function updateAnswerAndScore() {
	var q_id = current_q_ids[current_q_pos];
	var q = q_pool[q_id];
	var current_sec = q["sec"];
	document.getElementById("right_key").innerText = q["key"];
	document.getElementById("current_choice").innerText = current_choice;
	if (q["key"] == current_choice) {
		document.getElementById("result_sen").innerText = q_response[0];
		current_score += 1;
		total_score += 1;
	} else {
		document.getElementById("result_sen").innerText = q_response[1];	
		current_wrong_count_list[current_sec - 1] += 1;
		total_wrong_count_list[current_sec - 1] += 1;
	}
	document.getElementById("explain_content").innerText = q["explain"];
	document.getElementById("current_score").innerText = current_score;
	document.getElementById("total_score").innerText = total_score;
	console.log("current_wrong_count_list: " + current_wrong_count_list);
	console.log("total_wrong_count_list: " + total_wrong_count_list);
}

// init the HTML elements to present a question
function initHTML() {
	// title part
	document.getElementById("round_id").innerText = current_round_level;
	document.getElementById("current_round_level").innerText = current_round_level;
	document.getElementById("current_score").innerText = current_score;
	document.getElementById("total_score").innerText = total_score;
	// hide the answer part
	document.getElementById("answer_section").style.display = "none";
}

// build index on a key. The value of key is adaptively chosen in different rounds.
function buildIndexOn(key) {
	// build index on a certain key. 
	// Here we do sec first. We can build Index for difficulty as the future work
	idx = {};
	for (var i in q_pool) {
		sec = q_pool[i]["sec"];
		if (!idx.hasOwnProperty(sec)) {
			idx[sec] = [i];		
		} else {
			idx[sec].push(i);
		}
	}
	return idx;
}

// init the states when a new round begins
function initCurrent() {
	current_q_pos = 0;
	current_score = 0;
	current_choice = "X";
	current_wrong_count_list = new Array(sec_size).fill(0);
}

// actions happens when click ok botton
function click_ok() {
	// choose ok to confirm the answer, then give the result and explanation.

	if (document.getElementById('r1').checked) {
		current_choice = document.getElementById('r1').value;
	}
	if (document.getElementById('r2').checked) {
		current_choice = document.getElementById('r2').value;
	}
	if (document.getElementById('r3').checked) {
		current_choice = document.getElementById('r3').value;
	}
	if (document.getElementById('r4').checked) {
		current_choice = document.getElementById('r4').value;
	}
	console.log("current_choice is " + current_choice);
	if (current_choice != "X") {
		updateAnswerAndScore();
		document.getElementById("ok_btn").disabled = true;
		document.getElementById('r1').disabled = true;
		document.getElementById('r2').disabled = true;
		document.getElementById('r3').disabled = true;
		document.getElementById('r4').disabled = true;
		document.getElementById("answer_section").style.display = "block";
	} else {
		window.alert("pls have a choice :)")
	}

}

// actions happens when click next botton
function click_next() {
	current_q_pos += 1;

	if (current_q_pos > 3) {
		current_round_level += 1;
		if (current_round_level > 3) {
			window.alert("Finished! Click ok to restart!");
			init();
			document.getElementById("answer_section").style.display = "none";
			document.getElementById("ok_btn").disabled = false;
			document.getElementById('r1').disabled = false;
			document.getElementById('r2').disabled = false;
			document.getElementById('r3').disabled = false;
			document.getElementById('r4').disabled = false;
			document.getElementById('r1').checked = false;
			document.getElementById('r2').checked = false;
			document.getElementById('r3').checked = false;
			document.getElementById('r4').checked = false;
			return;
		}
		q_ids_generate(current_wrong_count_list);
		initCurrent();
		initHTML();
	}
	document.getElementById("current_q_pos").innerText = current_q_pos+1;
	updateQuestion();
	document.getElementById("answer_section").style.display = "none";
	document.getElementById("ok_btn").disabled = false;
	document.getElementById('r1').disabled = false;
	document.getElementById('r2').disabled = false;
	document.getElementById('r3').disabled = false;
	document.getElementById('r4').disabled = false;
	document.getElementById('r1').checked = false;
	document.getElementById('r2').checked = false;
	document.getElementById('r3').checked = false;
	document.getElementById('r4').checked = false;
	current_choice = "X";
}

// the function to generate question ids for a new round of questions
function q_ids_generate(wrong_count_list) {
	// generate question ids from the wrong count list
	// step1: compute the count chosen from each section
	var wrong_count = wrong_count_list.reduce((a, b) => a + b, 0);
	var q_count_list = [1, 1, 1, 1]
	if (wrong_count != 0) {
		for (j = 0; j < sec_size; j ++) {
			q_count_list[j] = Math.floor(q_per_round * wrong_count_list[j] / wrong_count);
		}
		for (j = 0; q_count_list.reduce((a, b) => a + b, 0) != q_per_round; j ++) {
			q_count_list[j] += 1
		}
	}

	current_q_ids = new Array(q_per_round).fill(-1);
	var add_idx = 0
	
	// step2 choose some count of questios from each section
	for (var j = 0; j < sec_size; j ++) {
		var q_list = sec_index[j+1] // question list for one section
		var choose_num = q_count_list[j] // default: 1
		var total_num = q_list.length // default: 4	
		while (choose_num > 0) {
			var id = randomChoose(total_num);
			var q_id = q_list[id];
			if (!current_q_ids.includes(q_id)) {
				current_q_ids[add_idx] = q_id;
				add_idx += 1;
				choose_num -= 1;
			}
		}
	}
	current_q_pos = 0;
	console.log(q_count_list)
	console.log(current_q_ids)
}

// a helper function for q_ids_generate
function randomChoose(t) {
	// chooce c number from 0, 1, ..., t-1
	return Math.floor(Math.random() * t);
}