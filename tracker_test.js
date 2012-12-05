steal("funcunit/qunit", "can/observe", "can/observe/attributes", "can/model", "can/util/fixture", "tracker",
	function(qunit, Observe, attributes, Model, fixture, Tracker) {

	module("tracker", {
		setup: function() {

		}
	});

	var getPath = function(path) {
		if(typeof steal !== 'undefined') {
			return steal.config().root.join(path) + '';
		}
		return path;
	};

	test("Basic Functionality", function() {

		$("#qunit-test-area").html("<ul><li class='tracker'></li></ul>");

		var $li = $("li.tracker"),
			tracker = new Tracker($li);

		ok(!($li.data("controls").length), "There are no controls on the li element");
	});

	test("Textbox - Simple Mode", function() {

		$("#qunit-test-area").html("<input id='name' name='name' value='' />");

		var $name = $("#name"),
			tracker = new Tracker($name);

		equals(tracker._mode, "simple", "Tracker is in simple mode");

		equals($name.val(), "", "Textbox value is empty");
		equals(tracker.val(), "", "Tracker value is empty");

		$name.val("Ryan Braun").trigger("change");

		equals(tracker.val(), "Ryan Braun", "Value is Ryan Braun");

		tracker.val("Troy Tulowitzki");

		equals($name.val(), "Troy Tulowitzki", "Textbox value is Troy Tulowitzki");
		equals(tracker.val(), "Troy Tulowitzki", "Tracker value is Troy Tulowitzki");

		equals(tracker.original(), "", "Original value is empty");
		ok(tracker.changed(), "Textbox value has changed");
		ok($name.hasClass("dirty"), "Textbox has dirty class");

		tracker.reset();

		equals($name.val(), "", "Textbox value is empty");
		equals(tracker.val(), "", "Tracker value is empty");

		ok(!tracker.changed(), "Textbox value has not changed");
		ok(!$name.hasClass("dirty"), "Textbox does not have dirty class");
	});

	test("Textbox - Observe Mode (can.Observe)", function() {

		$("#qunit-test-area").html("<input id='name' name='name' value='' />");

		var $name = $("#name"),
			player = new Observe({
				name: "Felix Hernandez",
				team: "Seattle Mariners",
				position: "SP"
			}),
			tracker = new Tracker($name, {
				linkedObj: player
			});

		equals(tracker._mode, "observe", "Tracker is in observe mode");

		equals($name.val(), "Felix Hernandez", "Textbox value is Felix Hernandez");
		equals(tracker.val(), "Felix Hernandez", "Tracker value is Felix Hernandez");

		$name.val("Ryan Braun").trigger("change");

		equals(tracker.val(), "Ryan Braun", "Value is Ryan Braun");
		equals(player.attr("name"), "Ryan Braun", "player.attr('name') is Ryan Braun");

		tracker.val("Troy Tulowitzki");

		equals($name.val(), "Troy Tulowitzki", "Textbox value is Troy Tulowitzki");
		equals(tracker.val(), "Troy Tulowitzki", "Tracker value is Troy Tulowitzki");
		equals(player.attr("name"), "Troy Tulowitzki", "player.attr('name') is Troy Tulowitzki");

		player.attr("name", "Wil Myers");

		equals($name.val(), "Wil Myers", "Textbox value is Wil Myers");
		equals(tracker.val(), "Wil Myers", "Tracker value is Wil Myers");
		equals(player.attr("name"), "Wil Myers", "player.attr('name') is Wil Myers");

		equals(tracker.original(), "Felix Hernandez", "Original value is Felix Hernandez");
		ok(tracker.changed(), "Textbox value has changed");
		ok($name.hasClass("dirty"), "Textbox has dirty class");

		tracker.reset();

		equals($name.val(), "Felix Hernandez", "Textbox value is Felix Hernandez");
		equals(tracker.val(), "Felix Hernandez", "Tracker value is Felix Hernandez");

		ok(!tracker.changed(), "Textbox value has not changed");
		ok(!$name.hasClass("dirty"), "Textbox does not have dirty class");
	});

	test("Textbox - Observe Mode (can.Observe) - Nested Attribute", function() {

		$("#qunit-test-area").html("<input id='wins' name='stats.wins' value='' />");

		var $wins = $("#wins"),
			player = new Observe({
				name: "Felix Hernandez",
				team: "Seattle Mariners",
				position: "SP",
				stats: {
					wins: 19,
					losses: 6,
					strikeouts: 241
				}
			}),
			tracker = new Tracker($wins, {
				linkedObj: player
			});

		equals(tracker._mode, "observe", "Tracker is in observe mode");

		equals($wins.val(), "19", "Textbox value is 19");
		equals(tracker.val(), "19", "Tracker value is 19");

		$wins.val("20").trigger("change");

		equals(tracker.val(), "20", "Value is 20");
		equals(player.attr("stats.wins"), "20", "player.attr('stats.wins') is 20");

		tracker.val("22");

		equals($wins.val(), "22", "Textbox value is 22");
		equals(tracker.val(), "22", "Tracker value is 22");
		equals(player.attr("stats.wins"), "22", "player.attr('stats.wins') is 22");

		player.attr("stats.wins", "18");

		equals($wins.val(), "18", "Textbox value is 18");
		equals(tracker.val(), "18", "Tracker value is 18");
		equals(player.attr("stats.wins"), "18", "player.attr('stats.wins') is 18");

		equals(tracker.original(), "19", "Original value is 19");
		ok(tracker.changed(), "Textbox value has changed");
		ok($wins.hasClass("dirty"), "Textbox has dirty class");

		tracker.reset();

		equals($wins.val(), "19", "Textbox value is 19");
		equals(tracker.val(), "19", "Tracker value is 19");

		ok(!tracker.changed(), "Textbox value has not changed");
		ok(!$wins.hasClass("dirty"), "Textbox does not have dirty class");
	});

	test("Textbox - Observe Mode (can.Observe) - Specify 'attr' Option", function() {

		$("#qunit-test-area").html("<input id='team' value='' />");

		var $team = $("#team"),
			player = new Observe({
				name: "Felix Hernandez",
				team: "Seattle Mariners",
				position: "SP"
			}),
			tracker = new Tracker($team, {
				linkedObj: player,
				attr: "team"
			});

		equals(tracker._mode, "observe", "Tracker is in observe mode");

		equals($team.val(), "Seattle Mariners", "Textbox value is Seattle Mariners");
		equals(tracker.val(), "Seattle Mariners", "Tracker value is Seattle Mariners");

		$team.val("Hylian Heroes").trigger("change");

		equals(tracker.val(), "Hylian Heroes", "Value is Hylian Heroes");
		equals(player.attr("team"), "Hylian Heroes", "player.attr('team') is Hylian Heroes");

		tracker.val("New York Yankees");

		equals($team.val(), "New York Yankees", "Textbox value is New York Yankees");
		equals(tracker.val(), "New York Yankees", "Tracker value is New York Yankees");
		equals(player.attr("team"), "New York Yankees", "player.attr('team') is New York Yankees");

		player.attr("team", "Los Angeles Dodgers");

		equals($team.val(), "Los Angeles Dodgers", "Textbox value is Los Angeles Dodgers");
		equals(tracker.val(), "Los Angeles Dodgers", "Tracker value is Los Angeles Dodgers");
		equals(player.attr("team"), "Los Angeles Dodgers", "player.attr('team') is Los Angeles Dodgers");

		equals(tracker.original(), "Seattle Mariners", "Original value is Seattle Mariners");
		ok(tracker.changed(), "Textbox value has changed");
		ok($team.hasClass("dirty"), "Textbox has dirty class");

		tracker.reset();

		equals($team.val(), "Seattle Mariners", "Textbox value is Seattle Mariners");
		equals(tracker.val(), "Seattle Mariners", "Tracker value is Seattle Mariners");

		ok(!tracker.changed(), "Textbox value has not changed");
		ok(!$team.hasClass("dirty"), "Textbox does not have dirty class");
	});

	test("Textbox - Observe Mode (can.Observe) - No Name Property and No 'attr' Option", function() {

		$("#qunit-test-area").html("<input id='team' value='' />");

		var $team = $("#team"),
			player = new Observe({
				name: "Felix Hernandez",
				team: "Seattle Mariners",
				position: "SP"
			}),
			tracker = new Tracker($team, {
				linkedObj: player
			});

		equals(tracker._mode, "simple", "Tracker is in simple mode");

		equals($team.val(), "", "Textbox value is empty");
		equals(tracker.val(), "", "Tracker value is empty");

		$team.val("Hylian Heroes").trigger("change");

		equals(tracker.val(), "Hylian Heroes", "Value is Hylian Heroes");
		equals(player.attr("team"), "Seattle Mariners", "player.attr('team') is Seattle Mariners");

		tracker.val("New York Yankees");

		equals($team.val(), "New York Yankees", "Textbox value is New York Yankees");
		equals(tracker.val(), "New York Yankees", "Tracker value is New York Yankees");
		equals(player.attr("team"), "Seattle Mariners", "player.attr('team') is still Seattle Mariners");

		player.attr("team", "Los Angeles Dodgers");

		equals($team.val(), "New York Yankees", "Textbox value is still New York Yankees");
		equals(tracker.val(), "New York Yankees", "Tracker value is still New York Yankees");
		equals(player.attr("team"), "Los Angeles Dodgers", "player.attr('team') is Los Angeles Dodgers");

		equals(tracker.original(), "", "Original value is empty");
		ok(tracker.changed(), "Textbox value has changed");
		ok($team.hasClass("dirty"), "Textbox has dirty class");

		tracker.reset();

		equals($team.val(), "", "Textbox value is empty");
		equals(tracker.val(), "", "Tracker value is empty");

		ok(!tracker.changed(), "Textbox value has not changed");
		ok(!$team.hasClass("dirty"), "Textbox does not have dirty class");
	});

	test("Textbox - Observe Mode (can.Model)", function() {

		$("#qunit-test-area").html("<input id='name' name='name' value='' />");

		if(window.jQuery) {
			can.Model("Player", {
				findOne : function(params, success, error) {
					var self = this;
					return can.ajax({
						url : "/player/5",
						data : params,
						fixture: "//tracker/test/player.json",
						dataType : "json"
					}).pipe(function(data) {
						return self.model(data);
					});
				}
			}, {});
		} else {
			can.Model("Person", {
				findOne : getPath("tracker/test/player.json")
			}, {});
		}
		stop();
		var player = Player.findOne({});
		player.then(function(player){
			start();

			var $name = $("#name"),
				tracker = new Tracker($name, {
				linkedObj: player
			});

			equals(tracker._mode, "observe", "Tracker is in observe mode");

			equals($name.val(), "Felix Hernandez", "Textbox value is Felix Hernandez");
			equals(tracker.val(), "Felix Hernandez", "Tracker value is Felix Hernandez");

			$name.val("Ryan Braun").trigger("change");

			equals(tracker.val(), "Ryan Braun", "Value is Ryan Braun");
			equals(player.attr("name"), "Ryan Braun", "player.attr('name') is Ryan Braun");

			tracker.val("Troy Tulowitzki");

			equals($name.val(), "Troy Tulowitzki", "Textbox value is Troy Tulowitzki");
			equals(tracker.val(), "Troy Tulowitzki", "Tracker value is Troy Tulowitzki");
			equals(player.attr("name"), "Troy Tulowitzki", "player.attr('name') is Troy Tulowitzki");

			player.attr("name", "Wil Myers");

			equals($name.val(), "Wil Myers", "Textbox value is Wil Myers");
			equals(tracker.val(), "Wil Myers", "Tracker value is Wil Myers");
			equals(player.attr("name"), "Wil Myers", "player.attr('name') is Wil Myers");

			equals(tracker.original(), "Felix Hernandez", "Original value is Felix Hernandez");
			ok(tracker.changed(), "Textbox value has changed");
			ok($name.hasClass("dirty"), "Textbox has dirty class");

			tracker.reset();

			equals($name.val(), "Felix Hernandez", "Textbox value is Felix Hernandez");
			equals(tracker.val(), "Felix Hernandez", "Tracker value is Felix Hernandez");

			ok(!tracker.changed(), "Textbox value has not changed");
			ok(!$name.hasClass("dirty"), "Textbox does not have dirty class");
		});
	});

	test("Textbox - Observe Mode (can.Model) - Nested Models (Attributes plugin)", function() {

		$("#qunit-test-area").html("<input id='wins' name='stats.wins' value='' />");

		if(window.jQuery) {
			can.Model("Stats", {
				winPercentage: function() {
					return (this.wins / (this.wins + this.losses)) * 100;
				}
			});
			can.Model("Player", {
				attributes: {
					"stats": "Stats.model"
				},
				findOne : function(params, success, error) {
					var self = this;
					return can.ajax({
						url : "/player/5",
						data : params,
						fixture: "//tracker/test/player.json",
						dataType : "json"
					}).pipe(function(data) {
						return self.model(data);
					});
				}
			}, {});
		} else {
			can.Model("Person", {
				findOne : getPath("tracker/test/player.json")
			}, {});
		}
		stop();
		var player = Player.findOne({});
		player.then(function(player){
			start();

			var $wins = $("#wins"),
				tracker = new Tracker($wins, {
				linkedObj: player
			}),
				stats = player.attr("stats");

			equals(tracker._mode, "observe", "Tracker is in observe mode");

			equals($wins.val(), "19", "Textbox value is 19");
			equals(tracker.val(), "19", "Tracker value is 19");

			stats.attr("wins", 25);

			equals($wins.val(), "25", "Textbox value is 25");
			equals(tracker.val(), "25", "Tracker value is 25");
			equals(player.attr("stats.wins"), "25", "player.attr('stats.wins') is 25");

			equals(tracker.original(), "19", "Original value is 19");
			ok(tracker.changed(), "Textbox value has changed");
			ok($wins.hasClass("dirty"), "Textbox has dirty class");

			tracker.reset();

			equals($wins.val(), "19", "Textbox value is 19");
			equals(tracker.val(), "19", "Tracker value is 19");

			ok(!tracker.changed(), "Textbox value has not changed");
			ok(!$wins.hasClass("dirty"), "Textbox does not have dirty class");
		});
	});

	test("Textbox - Object Mode", function() {

		$("#qunit-test-area").html("<input id='name' name='name' value='' />");

		var $name = $("#name"),
			player = {
				name: "Felix Hernandez",
				team: "Seattle Mariners",
				position: "SP"
			},
			tracker = new Tracker($name, {
				linkedObj: player
			});

		equals(tracker._mode, "object", "Tracker is in observe mode");

		equals($name.val(), "Felix Hernandez", "Textbox value is Felix Hernandez");
		equals(tracker.val(), "Felix Hernandez", "Tracker value is Felix Hernandez");

		$name.val("Ryan Braun").trigger("change");

		equals(tracker.val(), "Ryan Braun", "Value is Ryan Braun");
		equals(player.name, "Ryan Braun", "player.name is Ryan Braun");

		tracker.val("Troy Tulowitzki");

		equals($name.val(), "Troy Tulowitzki", "Textbox value is Troy Tulowitzki");
		equals(tracker.val(), "Troy Tulowitzki", "Tracker value is Troy Tulowitzki");
		equals(player.name, "Troy Tulowitzki", "player.name is Troy Tulowitzki");

		player.name = "Wil Myers";

		equals($name.val(), "Troy Tulowitzki", "Textbox value is still Troy Tulowitzki");
		equals(tracker.val(), "Troy Tulowitzki", "Tracker value is still Troy Tulowitzki");
		equals(player.name, "Wil Myers", "player.name is Wil Myers");

		equals(tracker.original(), "Felix Hernandez", "Original value is Felix Hernandez");
		ok(tracker.changed(), "Textbox value has changed");
		ok($name.hasClass("dirty"), "Textbox has dirty class");

		tracker.reset();

		equals($name.val(), "Felix Hernandez", "Textbox value is Felix Hernandez");
		equals(tracker.val(), "Felix Hernandez", "Tracker value is Felix Hernandez");

		ok(!tracker.changed(), "Textbox value has not changed");
		ok(!$name.hasClass("dirty"), "Textbox does not have dirty class");
	});

})();








