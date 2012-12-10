###CanJS Tracker Control:

Tracker enables two-way binding between a form field and an attribute of a can.Observe

If you change the can.Observe, the form field updates to match the new value. While this can already be accomplished using live binding, the following cannot. Update the form field and the can.Observe attribute linked to the form field is updated.

This used to be possible with the Tie plugin, but I think Tie has been "untied" (deprecated).

Currently Tracker works on textboxes, passwords, checkboxes, radio buttons, textareas, selects and multi-selects.

#####Basic Usage:

````
var observe = new can.Observe({
		"singer": "Trent Reznor",
		"band": "Nine Inch Nails"
	}),
	tracker = new Tracker( can.$("ID_OF_FORM_ELEMENT"), {
		linkedObj: observe
	});
````

The element passed to Tracker must be an input, textarea or select form element.

By default, Tracker will use the "name" property of the form element as the name of the attribute of the can.Observe it should link to. This can be overridden or ignored by specifying the "attr" option when instantiating Tracker.

#####How Does Tracker Work:

Tracker works by listening to changes on the form field. When a change occurs, it updates the linked attribute on the can.Observe with the new value. Tracker also listens for changes to the linked attribute of the can.Observe, and when a change occurs, it updates the form element. Pretty simple.


#####Options: 

**linkedObj** (object): The object that Tracker should link the form element to. While the primary use cases are for can.Observes, Tracker also allows you to specify a plain object (one-way binding) or even another form element. Change a textbox and have another stay in sync (not sure of any practical uses for this yet, but I was bored). If you do not specify a linkedObj, Tracker will act as a proxy of sorts for getting and setting values on the associated form element (simple mode).

**attr** (string, defaults to undefined): Tells Tracker the name of the attribute on the can.Observe to link to. If unspecified, Tracker uses the "name" property of _this.element_. If neither exists, then Tracker will enter simple mode and act as a proxy for the form element.

**changeCallback** (function, defaults to can.noop): A callback that will be executed when the form element's value changes. This function will be passed the new value.

**initFromLinkedObj** (boolean, defaults to true): Whether or not to initialize the form element's value to the value of the attribute it's linked to on linkedObj during init.

**dirtyClass** (string, defaults to 'dirty'): The name of the CSS class to assign to the form element when its value has been changed (differs from its original value determined during initialization of Tracker). This allows you to apply styles to visually see what has been changed.


#####Methods:

**val** ````Tracker.val( [value] )````

Reads or sets the value of Tracker. The value is the value of the form element. Setting will update both the form element and the linkedObj

**original** ````Tracker.original()````

Retrieves the original value of the form element when Tracker was initialized. If "initFromLinkedObj" is set, this will be the value set from the linkedObj

**changed** ````Tracker.changed()````

Returns a boolean indicating whether the value has changed since initialization

**reset** ````Tracker.reset()````

Resets the value to the original value if it has been changed


#####Usage Examples:

**Textboxes, Passwords and Textareas**

All three of these input types work the same with Tracker.

````
<input id="singer" name="singer" value="" />
````

````
var observe = new can.Observe({
		"singer": "Trent Reznor"
	}),
	tracker = new Tracker( can.$("#singer"), {
		linkedObj: observe
	});
	
tracker.val() --> "Trent Reznor"
tracker.val("Eddie Vedder") --> Textbox shows "Eddie Vedder" and sets observe.singer to "Eddie Vedder"
// Enter "Greg Allman" in textbox --> observe.singer is set to "Greg Allman"
observe.attr("singer", "Adam Duritz") --> Textbox set to "Adam Duritz"
````

**Notes**

* If the textbox is updated outside of tracker using jQuery's val() function ````$("#singer").val("Michael Jackson")````, Tracker won't know about it. This is because using .val() does not trigger the change event on the textbox. As of now I do not know how to resolve this. It will only work if you do ````$("#singer").val("Michael Jackson").trigger("change")````. This is the case for all types of form elements supported by Tracker.

**Checkbox**

Tracker uses checkboxes to model boolean data. Selecting a checkbox will set the linked attribute of linkedObj to _true_ and unselecting it, to _false_. If the attribute is updated to a non-boolean value, Tracker will set the checkbox to "checked" for all truthy values.

````
<input type="checkbox" id="isAwesome" name="isAwesome" />
````

````
var observe = new can.Observe({
		"singer": "Trent Reznor",
		"band": "Nine Inch Nails",
		"isAwesome": true
	}),
	tracker = new Tracker( can.$("#isAwesome"), {
		linkedObj: observe
	});
	
tracker.val() --> true
tracker.val(false) --> Unchecks checkbox and sets observe.isAwesome to false
observe.attr("isAwesome", true) --> Checks checkbox
// Uncheck the checkbox --> Sets observe.isAwesome to false
observe.attr("isAwesome", "He is awesome") --> Checks checkbox since "He is awesome" is truthy
````

**Select Dropdowns**

````
<select id="favoriteSong" name="favoriteSong" />
	<option value="Hurt">Hurt</option>
	<option value="Burn">Burn</option>
	<option value="Wish">Wish</option>
</select>
````

````
var observe = new can.Observe({
		"singer": "Trent Reznor",
		"band": "Nine Inch Nails",
		"isAwesome": true,
		"favoriteSong": "Burn"
	}),
	tracker = new Tracker( can.$("#favoriteSong"), {
		linkedObj: observe
	});
	
tracker.val() --> "Burn"
tracker.val("Hurt") --> Selects "Hurt" and sets observe.favoriteSong to "Hurt"
// Select "Burn" from dropdown --> Sets observe.favoriteSong to "Burn"
observe.attr("favoriteSong", "Wish") --> Selects "Wish" in dropdown
observe.attr("favoriteSong", "Head Like A Hole") --> Select does not change
````

**Notes**

* Setting the linked attribute to a value that does not have an option in the select leaves the select as is. Considering adding an option for the new value when this occurs.


**Multiple Select Dropdowns**

Multi-selects return an array when calling .val() and expect an array when setting, although a string will work if you're only selecting one option. By default, this is how Tracker functions as well. If you link a can.Observe attribute to a multi-select and select options, that attribute will be updated with an array.

````
<select id="favoriteSong" name="favoriteSong" mutliple />
	<option value="Hurt">Hurt</option>
	<option value="Burn">Burn</option>
	<option value="Wish">Wish</option>
	<option value="Closer">Closer</option>
</select>
````

````
var observe = new can.Observe({
		"singer": "Trent Reznor",
		"band": "Nine Inch Nails",
		"isAwesome": true,
		"favoriteSong": ["Closer"]
	}),
	tracker = new Tracker( can.$("#favoriteSong"), {
		linkedObj: observe
	});
	
tracker.val() --> ["Closer"]
tracker.val(["Hurt"]) --> Selects "Hurt" and sets observe.favoriteSong to ["Hurt"]
tracker.val("Closer") --> Selects "Closer" and sets observe.favoriteSong to "Closer"
// Select "Burn and Wish" from dropdown --> Sets observe.favoriteSong to ["Burn", "Wish"]
observe.attr("favoriteSong", "Wish") --> Selects "Wish" in dropdown
observe.attr("favoriteSong", ["Hurt", "Burn"]) --> Selects "Hurt" and "Wish" in the multi-select
````

Tracker does allow you to use strings for getting and setting multi-selects. To do this you must set the **multiSelectAsString** option to "true". This will allow you to pass a comma-delimited string to .val("A, B, C") and get one back when calling .val()

````
tracker.val() --> "Hurt,Burn"
tracker.val("Wish, Closer") --> Selects "Wish" and "Closer"" and sets observe.favoriteSong to "Wish, Closer"
````

**To Dos**

* Need to make sure the selected options exist before setting. This is currently a bug

**Radio Buttons**

When attaching Tracker to radio buttons, you need to make sure each radio button has the "name" property so we can construct a selector that will target all of the radio buttons.

````
<input type="radio" name="favoriteColor" value="black" /> Black
<input type="radio" name="favoriteColor" value="gray" /> Gray
<input type="radio" name="favoriteColor" value="purple" /> Purple
````

````
var observe = new can.Observe({
		"singer": "Trent Reznor",
		"band": "Nine Inch Nails",
		"isAwesome": true,
		"favoriteSong": "Burn",
		"favoriteColor": "black"		
	}),
	tracker = new Tracker( can.$("input[name=favoriteColor]"), {
		linkedObj: observe
	});
	
tracker.val() --> "black"
tracker.val("gray") --> Selects "gray" radio button and sets observe.favoriteColor to "gray"
observe.attr("favoriteColor", "black") --> Selects "black" radio button
// Select "purple" --> Sets observe.favoriteColor to "purple"
````

**Notes**

* Setting the linked attribute to a value that does not have a radio button will do nothing (need to think about this)


**Demo**


Fiddle Demonstrating Tracker:

http://jsfiddle.net/thecountofzero/qYdwR/596/

