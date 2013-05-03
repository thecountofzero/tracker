can.EJS.Helpers.prototype.tracked_input = function(obs, attr, props) {
    return "<input " + can.view.hook(function(el) {
        el.value = obs.attr(attr);
        el.id = attr;
        el.name = attr;
        can.$(el).data('tracker', new Tracker(can.$(el), {
            linkedObj: obs,
            changeCallback: props && props.changeCallback ? props.changeCallback : can.noop
        }));
    }) + "/>";
};

can.EJS.Helpers.prototype.tracked_select = function(options, obs, attr, props) {
    
    var htmlStr = "<select " + can.view.hook(function(el) {
        el.id = attr;
        el.name = attr;
        if(can.$(el).data('tracker')) {
            can.$(el).data('tracker').destroy();
        }

        can.$(el).data('tracker', new Tracker(can.$(el), {
            linkedObj: obs,
            changeCallback: props && props.changeCallback ? props.changeCallback : can.noop
        }));
    }) + ">";
    for(var i=0; i<options.length; ++i) {
        var opt = options[i];
        htmlStr += "<option value='" + opt.value + "' " + (opt.value===obs.attr(attr)?'selected':'') + ">" + opt.text + "</option>";
    }

    return htmlStr + "</select>";
};