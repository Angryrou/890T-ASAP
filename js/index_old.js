// system variables

var q_pool; // a list containing all the questions
var sec_size; // default: 4
var sec_index; // sec_id -> [q_id1, q_id2, q_id3, ...]

var current_round_level; // 1, 2 or 3
var current_wrong_count; // default: [x1, x2, x3, x4] xi: the number of wrong ans in sec i
var current_score; // 0-5

var total_score;



// initial state
function initFunc() {
	initVariables();
	initHTML();
}

function initVariables() {
	sys_balance = {"A" : 2500, "B" : 12500, "C" : 25000};
	nt_sys_supply = 100000;
	sys_price = {"A" : 0.25, "B" : 1, "C" : 10};
	weights = {"A" : 0.1, "B" : 0.125, "C" : 0.025};
	fly_amount = {"A" : 100000.0, "B" : 100000.0, "C" : 100000.0, "NT" : 90000};
}

function initHTML() {
	updateSysBalance(sys_balance);
	updateSysPrice(sys_price);
	document.getElementById("nt-supply").innerText = nt_sys_supply.toFixed(4);
	updateIndividualAccount(fly_amount);
	document.getElementById("sel").value = "A";
	coinTypeChange();
}

function updateSysBalance(values) {
	document.getElementById("a-sys-balance").innerText = values["A"].toFixed(4);
	document.getElementById("b-sys-balance").innerText = values["B"].toFixed(4);
	document.getElementById("c-sys-balance").innerText = values["C"].toFixed(4);
}

function updatePrice() {
	sys_price["A"] = sys_balance["A"] / nt_sys_supply / weights["A"];
	sys_price["B"] = sys_balance["B"] / nt_sys_supply / weights["B"];
	sys_price["C"] = sys_balance["C"] / nt_sys_supply / weights["C"];
}

function clearTrade() {
	document.getElementById("buy-from-amount").value = "";
	document.getElementById("buy-to-amount").value = "";
	document.getElementById("sell-from-amount").value = "";
	document.getElementById("sell-to-amount").value = "";
}

function updateSysPrice(values) {

	document.getElementById("a-sys-price").innerText = values["A"].toFixed(4);
	document.getElementById("b-sys-price").innerText = values["B"].toFixed(4);
	document.getElementById("c-sys-price").innerText = values["C"].toFixed(4);

	document.getElementById("nt-per-a").innerText = values["A"].toFixed(4);
	document.getElementById("nt-per-b").innerText = values["B"].toFixed(4);
	document.getElementById("nt-per-c").innerText = values["C"].toFixed(4);
}

function updateIndividualAccount(values) {
	document.getElementById("a-fly-amount").innerText = values["A"].toFixed(4);
	document.getElementById("b-fly-amount").innerText = values["B"].toFixed(4);
	document.getElementById("c-fly-amount").innerText = values["C"].toFixed(4);
	document.getElementById("nt-fly-amount").innerText = values["NT"].toFixed(4);
}

function coinTypeChange() {
	var objS = document.getElementById("sel");
	document.getElementById("what-coin-1").innerText = objS.options[objS.selectedIndex].value;
	document.getElementById("what-coin-2").innerText = objS.options[objS.selectedIndex].value;
	clearTrade();
}

function coin2nt(coinType, amount) {
	var ret = nt_sys_supply * (Math.pow(1 + amount / sys_balance[coinType], weights[coinType]) - 1);
	console.log(`coin2nt returns ${ret}`);
	return ret;
}

function nt2coin(coinType, amount) {
	var ret = - sys_balance[coinType] * (Math.pow(1 - amount / nt_sys_supply, 1 / weights[coinType]) - 1);
	console.log(`nt2coin returns ${ret}`);
	return ret;
}


function buyAmount() {
	var coinType = document.getElementById("what-coin-1").innerText;
	var coinTypeAmount = document.getElementById("buy-from-amount").value;
	if (isNaN(coinTypeAmount)) { // isn't a number
		alert("Invalid Input!!! not a number!");
	} else if (coinTypeAmount < 0){
		alert("Invalid Input!!! The number is out of range!");
	} else {
		document.getElementById("buy-to-amount").value = coin2nt(coinType, coinTypeAmount).toFixed(4);
	}
}

function buyFunc() {
	var coinType = document.getElementById("what-coin-1").innerText;
	var coinTypeAmount = document.getElementById("buy-from-amount").value;
	var ntAmount = coin2nt(coinType, coinTypeAmount);
	if (isNaN(ntAmount) || ntAmount == "") { // isn't a number
		alert("Please check your inputs.");
	} else if (coinTypeAmount > fly_amount[coinType]) {
		alert(`Sorry, your ${coinType} Coin is not enough.`);
	} else {
		// system
		sys_balance[coinType] = (parseFloat(sys_balance[coinType]) + parseFloat(coinTypeAmount));
		nt_sys_supply = (parseFloat(nt_sys_supply) + parseFloat(ntAmount));
		updateSysBalance(sys_balance);
		updatePrice();
		updateSysPrice(sys_price);
		document.getElementById("nt-supply").innerText = nt_sys_supply.toFixed(4);

		// individual 
		fly_amount[coinType] = (parseFloat(fly_amount[coinType]) - parseFloat(coinTypeAmount));
		fly_amount["NT"] = (parseFloat(fly_amount["NT"]) + parseFloat(ntAmount));
		updateIndividualAccount(fly_amount);

		document.getElementById("buy-from-amount").value = "";
		document.getElementById("buy-to-amount").value = "";
	}
}

function buyTyping() {
	document.getElementById("buy-to-amount").value = "";
}

function sellAmount() {
	var coinType = document.getElementById("what-coin-2").innerText;
	var ntAmount = document.getElementById("sell-from-amount").value;
	if (isNaN(ntAmount)){ // isn't a number
		alert("Invalid Input!!! not a number!");
	} else if (ntAmount < 0 || ntAmount > nt_sys_supply) {
		alert("Invalid Input!!! The number is out of range!");
	} else {
		document.getElementById("sell-to-amount").value = nt2coin(coinType, ntAmount).toFixed(4);
	}
}

function sellFunc() {
	var coinType = document.getElementById("what-coin-2").innerText;
	var ntAmount = document.getElementById("sell-from-amount").value;
	var coinTypeAmount = nt2coin(coinType, ntAmount);
	if (isNaN(coinTypeAmount) || coinTypeAmount == "") { // isn't a number
		alert("Please check your inputs.");
	} else if (ntAmount > fly_amount["NT"]) {
		alert("Sorry, your NT coin is not enough.")
	} else {
		// system
		sys_balance[coinType] = (parseFloat(sys_balance[coinType]) - parseFloat(coinTypeAmount));
		nt_sys_supply = (parseFloat(nt_sys_supply) - parseFloat(ntAmount));
		updateSysBalance(sys_balance);
		updatePrice();
		updateSysPrice(sys_price);
		document.getElementById("nt-supply").innerText = nt_sys_supply.toFixed(4);

		// individual
		fly_amount[coinType] = (parseFloat(fly_amount[coinType]) + parseFloat(coinTypeAmount));
		fly_amount["NT"] = (parseFloat(fly_amount["NT"]) - parseFloat(ntAmount));
		updateIndividualAccount(fly_amount);

		document.getElementById("sell-from-amount").value = "";
		document.getElementById("sell-to-amount").value = "";
	}
}

function sellTyping() {
	document.getElementById("sell-to-amount").value = "";
}

a = {};
b = {};

a["1"] = 3;
a["2"] = 3;

for (var k in a) {
	if (!b.hasOwnProperty(a[k])) {
		b[a[k]] = [k]
	} else {
		b[a[k]].push(k)
	}
}

const q_per_round = 4; // each round has 4 questions

var sec_size = 4;

wrong_count_list = [1, 1, 1, 0];

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

for (j = 0; j < sec_size; j ++) {
	print(q_count_list[j])
}
