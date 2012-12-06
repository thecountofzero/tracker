###CanJS Tracker Control:

Tracker enables two-way binding between a form field (ie. textbox) and an attribute of a can.Observe

If you change the can.Observe and the form field updates to match the new value. While this can already be accomplished using live binding, the following cannot. Update the form field and the can.Observe attribute linked to the form field is updated.

Currently Tracker works on textboxes, passwords, checkboxes, radio buttons, textareas and selects.

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


#####Options: 

"**linkedObj**" (object): The object that Tracker should link the form element to. While the primary use cases are for can.Observes, Tracker also allows you to specify a plain object or even another form element. Change a textbox and have another stay in sync (not sure of any practical uses for this yet).

"**attr**" (string, defaults to undefined): Tells Tracker the name of the attribute on the can.Observe to link to. If unspecified, Tracker uses the "name" property of _this.element_

"**initFromLinkedObj**" (boolean, defaults to true): Whether or not to set this.element's value to the value of the attribute it's linked to on linkedObj during init.

"**dirtyClass**" (string, defaults to 'dirty'): The name of the CSS class to assign to _this.element_ when its value has been changed (differs from its original value determined during initialization of Tracker). This allows you to visually see what has been changed.


#####Methods:

**val** ````Tracker.val( [value] )````

Reads or sets the value of Tracker. The value is the value of the form element (_this.element_). Setting will update both the form element and the linkedObj

**original** ````Tracker.original()````

Retrieves the original value of the form element when Tracker was initialized

**changed** ````Tracker.changed()````

Returns a boolean indicating wheter the value has changed since initialization

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
observe.attr("singer", "Adam Duritz") --> Textbox set to "Adam Duritz"
````

**Notes**

* If the textbox is updated outside of tracker using jQuery's val() function ````$("#singer").val("Michael Jackson")````, Tracker won't know about it. This is because using .val() does not trigger the change event on the textbox. As of now I do not know how to resolve this. It will only work if you do ````$("#singer").val("Michael Jackson").trigger("change")````. This is the case for all form elements.

**Checkbox**

Tracker uses checkboxes to model boolean data. Selecting a checkbox will set the linked attribute of linkedObj to _true_ and unselecting it, to _false_. If the attribute updated to non-boolean value, Tracker will set the checkbox to "checked" for all truthy values.

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
observe.attr("favoriteSong", "Wish") --> Selects "Wish" in dropdown
````

**Notes**

* Tracker does not yet support multi-selects (in progress)
* Setting the linked attribute to a value that does not have an option in the select, does not yet add one (in progress)

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
````

**Notes**

* Setting the linked attribute to a value that does not have a radio button will do nothing (need to think about this)



AppSwitcher's code can be found here: 

https://github.com/thecountofzero/tcoz/blob/master/app_switcher/app_switcher.js

An app using it can be found here:

https://github.com/thecountofzero/canbaseball

