/*globals CBPP*/
(function() {
    "use strict";
    if (typeof(CBPP.Slider)!=="undefined") {
        return;
    }

    CBPP.Slider = {};
    CBPP.Slider.ready = false;
    var urlBase;

    CBPP.Slider.load = function(callback) {
        var CBPP_URL_ROOT = CBPP.Slider.urlBase = CBPP.urlBase + "CBPP_Slider/v" + CBPP.Slider.version + "/";
        urlBase = CBPP.Slider.urlBase;
        var jQueryUILoaded = false, jqueryCSSLoaded = false, sliderCSSLoaded = false,
            thisSliderLoaded = false;
        var touchPunchLoad = function() {
            ready();
            jQueryUILoaded = true;
        };
        CBPP.JS(CBPP_URL_ROOT + "jquery-ui-1.11.4.custom/jquery-ui.min.js", jQueryUILoadFunction);
        function jQueryUILoadFunction() {
            CBPP.JS(CBPP_URL_ROOT + "jquery.ui.touch-punch.min.js", touchPunchLoad);
        }
        function loadJQueryCSS() {
            jqueryCSSLoaded = true;
            ready();
        }
        function loadSliderCSS() {
            sliderCSSLoaded = true;
            ready();
        }
        
        CBPP.CSS(CBPP_URL_ROOT + "jquery-ui-1.11.4.custom/jquery-ui.min.css", loadJQueryCSS);
        CBPP.CSS(CBPP_URL_ROOT + "cbpp_slider.css", loadSliderCSS);

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


    CBPP.Slider.Slider = function(selector, options) {
       
        if (typeof(options)==="undefined") {
            options = {};
        }
        
        if (CBPP.Slider.ready === false) {
            console.error("CBPP_Slider library not ready yet");
            return false;
        }
        
        var s = this;

        s.options = {
            min:0,
            max:100,
            labeledValues: [],
            labelFormatter: function(n) {
                return n;
            }
        };
        
        s.selector = selector;
        $.extend(true,s.options,options);

        s.change = function(handler) {
            $(s.selector).slider({
                slide: function(e, v) {
                    var doChange = true;
                    if (typeof(s.options.allowedValues)!=="undefined") {
                        doChange = false;
                        e.preventDefault();
                        var startValue = $(selector).slider("values");
                        if (startValue.length === 0) {
                            startValue = $(selector).slider("value");
                        }
                        var value;
                        if (typeof(v.value)!=="undefined") {
                            value = [v.value];
                        }
                        if (typeof(v.values)!=="undefined") {
                            value = v.values;
                        }
                        for (var j = 0, jj = value.length; j<jj; j++) {
                            for (var i = 0, ii = s.options.allowedValues.length - 1; i<ii; i++) {
                                if (value[j] <= s.options.allowedValues[i]) {
                                    if (value[j] - s.options.allowedValues[i] < s.options.allowedValues[i+1] - value[j]) {
                                        value[j] = s.options.allowedValues[i];
                                    } else {
                                        value[j] = s.options.allowedValues[i+1];
                                    }
                                    break;
                                }
                            }
                        }
                        if (value.length === 1) {
                            v.value = value[0];
                            $(s.selector).slider("value", v.value);
                            doChange = v.value !== startValue;
                            delete(v.values);
                        } else {
                            v.values = value;
                            $(s.selector).slider("values", v.values);
                            doChange = (v.values[0] !== startValue[0] || v.values[1] !== startValue[1]);
                            delete(v.value);
                        }
                    }
                    if (doChange) {
                        handler.call(this, e, v);
                    }
                }
            });
            /*$(s.selector).slider({
                slide: handler
            });*/
        };

        s.makeTicks = function() {
            var toAppend = [], tick, perc;
            for (var i = 0,ii = s.options.labeledValues.length;i<ii;i++) {
                perc = Math.round((s.options.labeledValues[i] - s.options.min)/(s.options.max - s.options.min)*1000)/10;
                tick = $("<div class='tick' style='left:" + perc + "%' ><span class='label" + (i===ii-1 ? ' last' : '') + (i===0 ? ' first' : '') + "'>" + s.options.labelFormatter(s.options.labeledValues[i]) + "</span></div>");
                toAppend.push(tick);
            } 
            return toAppend;   
        };
        s.destroy = function() {
            //console.log($(s.selector));
           // $(s.selector).slider("destroy");
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
        
        if (typeof(s.options.labeledValues)==="object") {
            $(s.selector).append(s.makeTicks());
        }
        $(s.selector).slider(s.options);
        $(s.selector).find(".ui-slider-handle").append("<div class='cbpp-slider-handle'></div>");

       
    };
})();