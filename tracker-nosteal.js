(function(can, window, undefined) {

	var _getAttr = function(name, attr) {
			return attr ? attr : name;
		},

		// Checks if an object is a can.Observe
		_isObserve = function(o) {
			return o instanceof can.Observe;
		},

		// Checks if an object is an HTMLElement
		_isElement = function(o) {
			return ( typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
				o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
			);
		},

		// Checks if an object is an HTMLElement
		_isHTMLElement = function(e) {
			return e instanceof HTMLElement;
		},

		// Checks if an object is one of the supported form elements
		_isFormElement = function(o) {
			var formElements = ["input", "textarea", "select"];

			if(_isHTMLElement(o.get(0))) {
				return (can.inArray(o.prop("tagName").toLowerCase(), formElements) !== -1);
			}
			else return false;
		},

		// Determines the mode of the plugin
		_getMode = function(o, attr) {
			if(_isObserve(o)) {
				if(attr) {
					return "observe";
				}
				else {
					console.log("Attribute to link to not specified. Either set 'name' attribute on this.element or use 'attr' option");
					return "simple";
				}
			}
			else if(_isFormElement(can.$(o))) {
				return "form";
			}
			else if(o instanceof Object) {
				if(attr) {
					console.log("LinkedObj is a plain object. Only one-way binding will work. Consider converting to can.Observe");
					return "object";
				}
				else {
					console.log("Attribute to link to not specified. Either set 'name' attribute on this.element or use 'attr' option");
					return "simple";
				}
			}
			else {
				console.log("Tracker in simple mode");
				return "simple";
			}
		};

	/**
	 * Tracker is a plugin used to link a form element with a can.Observe
	 * @type {[type]}
	 */
	var Tracker = window.Tracker = can.Control({

		defaults: {
			attr: undefined,
			_attrNameToWatch: "", // This is use internally for templated event bind to the attribute on the linkedObj we are tracking
			initFromLinkedObj: true, // On init, set the this.element's value to the value it's linked to in the linkedObj
			dirtyClass: "dirty", // Class added to this.element when it's value has changed from it's original value
            changeCallback: can.noop, // Function to be executed when the form element's value is changed
            multiSelectAsString: false
		}
	}, {
		/**
		 * Initializes the Tracker plugin
		 *
		 * @param {HTMLElement} [element] the element this instance operates on
		 * @param {Object} [options] option values for the control
		 */
		'init': function(element, options) {
			var self = this,
				el = this.element,
				tagName = el.prop("tagName"),
				inputType,
				linkedObj,
                valueHolder;

			if(!tagName) {
				console.log("Tracker is for form elements");
				this.destroy();
				return;
			}
			
			tagName = tagName.toLowerCase();

			// This plugin is only for inputs, textareas and selects
			// TODO: What about datalist, keygen and output?
			if(!(tagName === "input" || tagName === "textarea" || tagName === "select")) {
				console.log("Tracker is for form elements");
				this.destroy();
				return;
			}

			// Shortcut to linkedObj
			linkedObj = this.options.linkedObj;

			// Store the name associated with this.element
			this._elementName = el.prop("name");

			// Determine the attribute/property name to link to in the linkedObj
			// This can be specified as an option, otherwise the name property of this.element is used
			this._attr = _getAttr(this._elementName, this.options.attr);

			// TODO: Warn if this._attr is empty???

			// Determine the mode for this instance. Valid modes include observe, form and simple
			// The mode is based on the linkedObj
			// observe means the linkedObj is a can.Observe (or can.Model)
			// form means the linkedObj is a form element
			// object means the linkedObj is a plain object
			// simple means there is no linkedObj
			this._mode = _getMode(linkedObj, this._attr);

			// Sets up the appropriate internal values and then rebinds the control's event handlers
			this._setupBindings();

			// Generate a function that will be used for updating the linkedObj when our target changes
			// The definition of this function will differ depending on the type/mode of linkedObj
			this._updateLinkedObjFn = this._getUpdateLinkedObjFn();

			// Generate a function that will be used to update our target (this.element) when the linkedObj changes
			this._updateTargetFn = this._getUpdateTargetFn();

			// What type of input is this.element?
			inputType = el.prop("type").toLowerCase();

			if(inputType === "checkbox") { // Checkboxes

				// If initFromLinkedObj is true, set the target's value based on the mode
				if(this._mode === "observe" && this.options.initFromLinkedObj) {
					el.prop("checked", linkedObj.attr(this._attr));

					// Warn when the value we are setting a checkbox with is not a boolean
					if(typeof linkedObj.attr(this._attr) !== "boolean") {
						console.log("Linked attribure is not a boolean. You may experience strange results");
					}
				}
				else if(this._mode === "object" && this.options.initFromLinkedObj) {
					el.prop("checked", linkedObj[this._attr]);
				}

				// Getter/setter for target (this.element)
				this._val = function(val) {
					if(val === undefined) {
						return el.prop("checked");
					}
					else {
						// Should I only accept true? How about any truthy values?
						// If not true or false, maybe don't change the value?
						// For now, this is how prop works
						el.prop("checked", val).trigger("change");

						//el.prop("checked", val===true || val===1);
						return this;
					}
				};
			}
			else if(inputType === "radio") { // Radio buttons

				if(this._mode === "observe" && this.options.initFromLinkedObj) {
					el.filter("[value='" + linkedObj.attr(this._attr) + "']").prop("checked", true);
				}
				else if(this._mode === "object" && this.options.initFromLinkedObj) {
					el.filter("[value='" + linkedObj[this._attr] + "']").prop("checked", true);
				}

				// Getter/setter
				this._val = function(val) {
					if(val === undefined) {

						// Get the selected radio button
						return el.filter(":checked").val();
					}
					else {

                        // Select the radio button
						el.filter("[value='" + val + "']").prop("checked", true).trigger("change");
						return this;
					}
				};
			}
			else if(tagName === "select" && el.prop('multiple')) { // Select (multiple) dropdowns

				if(this._mode === "observe" && this.options.initFromLinkedObj) {
                    if(self.options.multiSelectAsString) {
                        el.val(linkedObj.attr(this._attr).toString().replace(/\s*,\s*/gm, ',').split(","));
                    }
					else {
                        valueHolder = linkedObj.attr(this._attr);

                        // Check if the value is an array
                        if(!can.isArray(valueHolder)) {
                            console.log("Multi-select expect array input");
                        }

                        el.val(linkedObj.attr(this._attr));
                    }
				}
				else if(this._mode === "object" && this.options.initFromLinkedObj) {
					el.val(linkedObj[this._attr]);
				}

				// Getter/setter
				this._val = function(val) {
					if(val === undefined) {

						// Get the selected option(s)
						return self.options.multiSelectAsString ? el.val().toString() : el.val();
					}
					else {

                        // FIXME: Make sure options actually exist in select
						el.val(self.options.multiSelectAsString ? val.toString().replace(/\s*,\s*/gm, ',').split(",") : val).trigger('change');
						return this;
					}
				};
			}
			else if(inputType === "text" ||
				inputType === "password" ||
				tagName === "textarea" ||
                tagName === "select") { // Textboxes, passwords, selects and textareas

				if(this._mode === "observe" && this.options.initFromLinkedObj) {
					el.val(linkedObj.attr(this._attr));
				}
				else if(this._mode === "object" && this.options.initFromLinkedObj) {
					el.val(linkedObj[this._attr]);
				}

				// Getter/setter
				this._val = function(val) {
					if(val === undefined) {

						// Cannot cache this value because the input can be changed programmatically by some other code using
						// $input.val() and doing so does not trigger a change event so we wouldn't know about the change. Doh!
						return el.val();
					}
					else {

                        // If it's a select dropdown, make sure the new value has an option
                        if(tagName === "select") {
                            if(el.find('option[value="' + val + '"]').length) {
                                el.val(val).trigger('change');
                            }
                            else {
                                console.log("No such option exists in select: " + val);
                            }
                        }
						else el.val(val).trigger('change');

						return this;
					}
				};
			}

			// Keep track of the original/initial value so we reset or know if it's been changed
			this._original = this._val.call(this);
		},

		/**
		 * Sets up internal values and rebinds the control's event handlers
		 * We are using the "_attrNameToWatch" option for templated event binding to bind to the
		 * appropriate attribute of the linkedObj
		 *
		 * When the linkedObj is a can.Observe, we want to bind to a specific attribute of the observe
		 * When the linkedObj is a form element, we want to bind to the "change" event of that form element
		 * When the linkedObj is a plain object, we convert it to a can.Observe for internal use
		 */
		'_setupBindings': function() {
			var linkedObj = this.options.linkedObj;

			if(this._mode === "observe") {

				// So we can listen for changes to this specific attribute of the observe
				this.options._attrNameToWatch = this._attr;
			}
			else if(this._mode === "form") {

				// Wrap linkedObj in a jQuery object (if it exists)
				if(linkedObj) {
					linkedObj = can.$(linkedObj);
				}

				// Make sure we are not trying to link to ourself
				if(this.element.get(0) === linkedObj.get(0)) {
					linkedObj = undefined;

					// Set the _mode to simple
					this._mode = "simple";

					console.log("Cannot track back to yourself (form mode)");
				}
				else {

					// For a form element we want to listen for "change" events
					this.options._attrNameToWatch = "change";
				}
			}
			else if(this._mode === "object") {

				// Save the object in case we need/want it later
				this.saveObject = linkedObj;

				// Convert the object into a can.Observe so we can bind to changes
				this.options.linkedObj = new can.Observe(linkedObj);

				// Listen for changes to this specific attribute of the observe
				this.options._attrNameToWatch = this._attr;
			}

			// Rebind event handlers
			this.on();
		},

		/**
		 * Generate the function that will be used to update the linkedObj when the target is changed
		 * @return {Function}
		 */
		'_getUpdateLinkedObjFn': function() {
			var self = this;

			return (function() {
				if(self._mode === "observe") { // LinkedObj is a can.Observe
					return function(newVal) {

                        // Update the can.Observe
						self.options.linkedObj.attr(self._attr, newVal);
					};
				}
				else if(self._mode === "form") { // LinkedObj is a form element
					return function(newVal) {

                        // FIXME: Need to update this because different form elements are updated differently
						self.options.linkedObj.val(newVal);
					};
				}
				else if(self._mode === "object") { // LinkedObj is a plain object
					return function(newVal) {
						self.saveObject[self._attr] = newVal;
						self.options.linkedObj.attr(self._attr, newVal);
					};
				}
				else {
					return can.noop;
				}
			})();
		},

		/**
		 * Generate the function that will update the target (this.element) when the linkedObj changes
		 * @return {Function}
		 */
		'_getUpdateTargetFn': function() {
			var self = this;

			return (function() {

				if(self._mode === "observe") { // linkedObj is a can.Observe
					return function(o, ev, newVal, oldVal) {

						//if(newVal !== self._val.call(self)) {
                        if(!can.Object.same(newVal, self._val.call(self))) {

							self._val.call(self, newVal);
						}
						self.element[self.changed() ? "addClass" : "removeClass"](self.options.dirtyClass);
					};
				}
				else if(self._mode === "form") { // linkedObj is a form element
					return function(el, ev) {
						var newVal = $(el).val();

						if(newVal !== self._val.call(self)) {
							self._val.call(self, newVal);
						}
						self.element[self.changed() ? "addClass" : "removeClass"](self.options.dirtyClass);
					};
				}
				else if(self._mode === "object") { // linkedObj is a plain object
					return function(o, ev, newVal, oldVal) {
						if(newVal !== self._val.call(self)) {
							self._val.call(self, newVal);
						}
						self.element[self.changed() ? "addClass" : "removeClass"](self.options.dirtyClass);
					};
				}
				else {
					return can.noop;
				}
			})();
		},

		/**
		 * Get or set the value of the target
		 * Getting will get the value from this.element
		 * Setting will set both this.element and linkedObj
		 *
		 * @param {Object} [val] if provided, sets the value
		 * @return {Object} the observable or the attribute property
		 */
		'val': function(val) {
			return this._val.call(this, val);
		},

		'original': function() {
			return this._original;
		},

		/**
		 * Has this.element's value changed since tracker has been employed
		 * @return {Boolean}
		 */
		'changed': function() {
            return !(can.Object.same(this._original, this._val.call(this)));
		},

		/**
		 * Resets this.element to its original value
		 * This is reset linkedObj too
		 * @return {Tracker}
		 */
		'reset': function() {
			this._val.call(this, this._original);
			return this;
		},

		/**
		 * Get the linked object (linkedObj)
		 * @return {Object}
		 */
		'getLinkedObj': function() {
			return this.options.linkedObj;
		},

		/**
		 * Event handler for when this.element changes
		 *
		 * @param {HTMLElement} [el]
		 * @param {[jQuery.Event} [ev]
		 */
		'change': function(el, ev) {
            var newVal = this._val.call(this);

			console.log('The target has been changed: ' + newVal);

            // Add or remove the dirty class depending on if the element is changed
			this.element[this.changed() ? "addClass" : "removeClass"](this.options.dirtyClass);

            // Execute the change callback
            this.options.changeCallback(newVal);

			// Execute the function that will update the linked object
			this._updateLinkedObjFn.apply(this, [newVal]);
		},

		/**
		 * Event handler for when linkedObj changes
		 * "_attrNameToWatch" is set in _setBindings
		 */
		'{linkedObj} {_attrNameToWatch}': function() {

			// Execute the function that will update target object (this.element)
			this._updateTargetFn.apply(this, arguments);
		},

		'destroy': function() {

			// Remove the dirty class
			this.element.removeClass(this.options.dirtyClass);

			// Call the super's destroy
			can.Control.prototype.destroy.call(this);
		}
	});

	return Tracker;

})(can, this);