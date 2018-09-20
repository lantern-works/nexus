/*
https://github.com/danwild/leaflet-fa-markers
Copyright 2017 Daniel Wild danwild@y7mail.com
http://www.apache.org/licenses/LICENSE-2.0
*/


L.Icon.FontAwesome = L.Icon.extend({

    options: {
        popupAnchor: [0, -50]
    },

    createIcon: function () {

        var div = document.createElement('div');
        var options = this.options;

        if(options.iconClasses) {
            div.appendChild(this._createIcon());
        }

        return div;
    },

    _createIcon: function () {

        var options = this.options;

        // container div
        var iconDiv = L.DomUtil.create('div', 'leaflet-fa-markers');

        // feature icon
        var iconSpan = L.DomUtil.create('span', options.iconClasses + ' feature-icon');
        iconSpan.style.color = options.iconColor;
        iconSpan.style.textAlign = 'center';
        iconSpan.style.backgroundColor = options.markerColor;
        iconSpan.style.borderColor = options.markerStroke;

        // XY position adjustments
        if(options.iconYOffset && options.iconYOffset != 0) iconSpan.style.marginTop = options.iconYOffset + 'px';
        if(options.iconXOffset && options.iconXOffset != 0) iconSpan.style.marginLeft = options.iconXOffset + 'px';

        // marker icon L.DomUtil doesn't seem to like svg, just append out html directly
        var markerSvg = document.createElement('div');
        markerSvg.className = "marker-icon-svg";
        markerSvg.innerHTML = '<svg ' +
            'width="32px" ' +
            'height="52px" ' +
            'viewBox="0 0 32 52" ' +
            'version="1.1" ' +
            'xmlns="http://www.w3.org/2000/svg" ' +
            'xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path fill="' + options.markerColor + '" d="'+options.markerPath+'" "></path>' +
            '</svg>';


        iconDiv.appendChild(markerSvg);
        iconDiv.appendChild(iconSpan);
        return iconDiv;
    }
});

L.icon.fontAwesome = function (options) {
    return new L.Icon.FontAwesome(options);
};

L.Icon.FontAwesome.prototype.options.markerPath = 'M16,1 C7.7146,1 1,7.65636364 1,15.8648485 C1,24.0760606 16,51 16,51 C16,51 31,24.0760606 31,15.8648485 C31,7.65636364 24.2815,1 16,1 L16,1 Z';




L.Icon.FontAwesomeCircle = L.Icon.extend({

    options: {
        popupAnchor: [0, -50]
    },

    createIcon: function () {

        var div = document.createElement('div');
        var options = this.options;

        if(options.iconClasses) {
            div.appendChild(this._createIcon());
        }

        return div;
    },

    _createIcon: function () {

        var options = this.options;

        // container div
        var iconDiv = L.DomUtil.create('div', 'leaflet-fa-markers leaflet-fa-markers-circle');

        // feature icon
        var iconSpan = L.DomUtil.create('span', options.iconClasses + ' feature-icon');
        iconSpan.style.color = options.iconColor;
        iconSpan.style.textAlign = 'center';
        iconSpan.style.backgroundColor = options.markerColor;
        iconSpan.style.borderColor = options.markerStroke;

        // XY position adjustments
        if(options.iconYOffset && options.iconYOffset != 0) iconSpan.style.marginTop = options.iconYOffset + 'px';
        if(options.iconXOffset && options.iconXOffset != 0) iconSpan.style.marginLeft = options.iconXOffset + 'px';

        // marker icon L.DomUtil doesn't seem to like svg, just append out html directly
        var markerSvg = document.createElement('div');
        markerSvg.className = "marker-icon-svg";
        markerSvg.innerHTML = '<svg ' +
            'width="32px" ' +
            'height="52px" ' +
            'viewBox="0 0 32 52" ' +
            'version="1.1" ' +
            'xmlns="http://www.w3.org/2000/svg" ' +
            'xmlns:xlink="http://www.w3.org/1999/xlink">' +
            '<path fill="' + options.markerColor + '" fill-opacity="0.0" d="'+options.markerPath+'" "></path>' +
            '</svg>';


        iconDiv.appendChild(markerSvg);
        iconDiv.appendChild(iconSpan);
        return iconDiv;
    }
});

L.icon.fontAwesomeCircle = function (options) {
    return new L.Icon.FontAwesomeCircle(options);
};

function getPath(cx,cy,r){
  return "M" + cx + "," + cy + "m" + (-r) + ",0a" + r + "," + r + " 0 1,0 " + (r * 2) + ",0a" + r + "," + r + " 0 1,0 " + (-r * 2) + ",0";
}

L.Icon.FontAwesomeCircle.prototype.options.markerPath =  'M16,1 C7.7146,1 1,7.65636364 1,15.8648485 C1,24.0760606 16,51 16,51 C16,51 31,24.0760606 31,15.8648485 C31,7.65636364 24.2815,1 16,1 L16,1 Z';

