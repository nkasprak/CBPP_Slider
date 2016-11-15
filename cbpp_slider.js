if (typeof(CBPP)==="undefined") {
    var CBPP = {};
}

if (typeof(CBPP.Slider)==="undefined") {

CBPP.Slider = {};
CBPP.Slider.urlBase = $("script[src*='cbpp_slider.js']")[0].src.replace("cbpp_slider.js","");
CBPP.Slider.ready = false;

(function() {
    "use strict";
    
    var urlBase = CBPP.Slider.urlBase;
    CBPP.Slider.load = function(callback) {
        var jQueryUILoaded = false, jqueryCSSLoaded = false, sliderCSSLoaded = false,
            thisSliderLoaded = false;
        $.getScript(urlBase + "jquery-ui-1.11.4.custom/jquery-ui.min.js", function() {
            jQueryUILoaded = true;
            ready();
        });
        function loadJQueryCSS() {
            jqueryCSSLoaded = true;
            ready();
        }
        function loadSliderCSS() {
            sliderCSSLoaded = true;
            ready();
        }
        
        var l = document.createElement("link");
        l.href = urlBase + "jquery-ui-1.11.4.custom/jquery-ui.min.css";
        l.type = "text/css";
        l.rel = "stylesheet";
        l.onload = loadJQueryCSS;
        
  
        var l2 = document.createElement("link");
        l2.href = urlBase + "cbpp_slider.css";
        l2.type = "text/css";
        l2.rel = "stylesheet";
        l2.onload = loadSliderCSS();
        
        document.getElementsByTagName('head')[0].appendChild(l);
        document.getElementsByTagName('head')[0].appendChild(l2);
        
        function ready() {
            if (jqueryCSSLoaded && sliderCSSLoaded && jQueryUILoaded && !thisSliderLoaded) {
                CBPP.Slider.ready = true;
                thisSliderLoaded = true;
                callback();
            }
        }
        
        /*fallback in case browser doesn't support CSS onload*/
        setTimeout(function() {
            loadJQueryCSS();
            loadSliderCSS();   
        },1000);
    };  
})();

CBPP.Slider.slider = function(selector, options) {
    "use strict";
    
    if (CBPP.Slider.ready === false) {
        console.error("CBPP_Slider library not ready yet");
        return false;
    }
    
    var s = this;
    
    s.selector = selector;
    s.options = options;
    s.changeHandlers = [];
    s.change = function(changeHandler) {
        if (typeof(changeHandler)==="undefined") {
            s.doChangeHandlers();
        } else {
            s.changeHandlers.push(changeHandler);   
        } 
    };
    s.doChangeHandlers = function() {
        for (var i = 0,ii=s.changeHandlers.length;i<ii;i++) {
            if (typeof(s.changeHandlers[i])==="function") {
                s.changeHandlers[i].call(s, [s.snapValue]);
            }
        }  
    };
    s.getValue = function() {
        return s.snapValue;  
    };
    s.setValue = function(v) {
        v = s.getSnapValue(v);
        $(s.selector).slider("value",v);
        s.snapValue = v;
        s.sliderStopFunction(true);
    };
    s.getSnapValue = function(uiValue) {
        var allowed = options.allowedValues,
            fixedValue = uiValue;
        if (typeof(allowed)!=="undefined"){
            fixedValue = allowed[0];
            for (var i = 0,ii=allowed.length;i<ii;i++) {
                if (uiValue >= allowed[i]) {
                    if (i<ii-1) {
                        fixedValue = Math.abs(uiValue - allowed[i]) <= Math.abs(uiValue - allowed[i+1]) ? allowed[i] : allowed[i+1];
                    } else {
                        fixedValue = allowed[i];
                    }
                }        
            }
        }
        return fixedValue;
    };
    s.sliderChangeFunction = function(ui, forceUpdate) {
        if (typeof(forceUpdate)==="undefined") {
            forceUpdate = false;
        }
        var timeoutFunction = function() {
            var uiValue;
            if (typeof(ui)!=="undefined") {
                uiValue = ui.value;
            } else {
                uiValue = $(selector).slider("value");
            }
            var fixedValue = s.getSnapValue(uiValue);
            if (fixedValue !== s.snapValue || forceUpdate) {
                s.snapValue = fixedValue;
                s.doChangeHandlers();
            }
        };
        //clearTimeout(s.slideTimer);
        timeoutFunction();
        //s.slideTimer = setTimeout(timeoutFunction,0);
    };
    
    s.sliderStopFunction = function(doChange) {
        if (typeof(doChange) === "undefined") {
            doChange = true;
        }
        if (doChange !== false) {
            s.sliderChangeFunction();
        }
        if (typeof(s.snapValue) !== "undefined") {
            $(selector).slider("value",s.snapValue);      
        }
    };
    s.makeTicks = function() {
        var toAppend = [], tick, perc;
        for (var i = 0,ii = options.labeledValues.length;i<ii;i++) {
            perc = Math.round((options.labeledValues[i] - options.min)/(options.max - options.min)*1000)/10;
            tick = $("<div class='tick' style='left:" + perc + "%' ><span class='label" + (i===ii-1 ? ' last' : '') + (i===0 ? ' first' : '') + "'>" + options.labeledValues[i] + "</span></div>");
            toAppend.push(tick);
        } 
        return toAppend;   
    };
    s.destroy = function() {
        $(s.selector).slider("destroy");
        $(s.selector).empty();
        $(s.selector).unbind();
        delete(s.selector);
        delete(s.options);
        delete(s.ready);  
    };	
    
    $(s.selector).addClass("cbpp_slider");
    $(s.selector).append("<div class='main-line'></div>");
    if (typeof(s.ready)==="function") {
        s.ready();
    }
    s.options.slide = function(event, ui) {
        s.sliderChangeFunction(ui);
    };
    s.options.stop = function() {
        s.sliderStopFunction();
    };
    s.options.value = s.getSnapValue(s.options.value);
    s.snapValue = s.options.value;
    if (typeof(s.options.labeledValues)==="object") {
        $(s.selector).append(s.makeTicks());
    }
    $(s.selector).slider(s.options);
    $(s.selector).on("touchstart touchmove", function(e) {
        e.preventDefault();
        var left = $(s.selector).offset().left,
            width = $(s.selector).width(),
            touch = e.originalEvent.touches[0],
            percent,
            value;
        if (typeof(touch)!=="undefined") {
            percent = (touch.pageX - left)/(width);
            value = percent*(s.options.max - s.options.min) + s.options.min;
            $(s.selector).slider("value",value);   
        }
        s.sliderChangeFunction();
    });
    $(s.selector).on("touchend", function() {
        s.sliderStopFunction();
    });
    $(s.selector).find(".ui-slider-handle").append("<div class='cbpp-slider-handle'></div>");
    s.sliderStopFunction(false);
};

}