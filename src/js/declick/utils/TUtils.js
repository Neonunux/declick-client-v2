import $ from 'jquery'

import TEnvironment from '@/env/TEnvironment'

/**
 * Many constants and functions for several purposes.
 * @exports TUtils
 */
var TUtils = function() {
    var QUOTE_DELIMITER = '#';
    var defaultDiacriticsRemovalap = [
        { 'base': 'A', 'letters': 'AⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ' },
        { 'base': 'AA', 'letters': 'Ꜳ' },
        { 'base': 'AE', 'letters': 'ÆǼǢ' },
        { 'base': 'AO', 'letters': 'Ꜵ' },
        { 'base': 'AU', 'letters': 'Ꜷ' },
        { 'base': 'AV', 'letters': 'ꜸꜺ' },
        { 'base': 'AY', 'letters': 'Ꜽ' },
        { 'base': 'B', 'letters': 'BⒷＢḂḄḆɃƂƁ' },
        { 'base': 'C', 'letters': 'CⒸＣĆĈĊČÇḈƇȻꜾ' },
        { 'base': 'D', 'letters': 'DⒹＤḊĎḌḐḒḎĐƋƊƉꝹ' },
        { 'base': 'DZ', 'letters': 'ǱǄ' },
        { 'base': 'Dz', 'letters': 'ǲǅ' },
        { 'base': 'E', 'letters': 'EⒺＥÈÉÊỀẾỄỂẼĒḔḖĔĖËẺĚȄȆẸỆȨḜĘḘḚƐƎ' },
        { 'base': 'F', 'letters': 'FⒻＦḞƑꝻ' },
        { 'base': 'G', 'letters': 'GⒼＧǴĜḠĞĠǦĢǤƓꞠꝽꝾ' },
        { 'base': 'H', 'letters': 'HⒽＨĤḢḦȞḤḨḪĦⱧⱵꞍ' },
        { 'base': 'I', 'letters': 'IⒾＩÌÍÎĨĪĬİÏḮỈǏȈȊỊĮḬƗ' },
        { 'base': 'J', 'letters': 'JⒿＪĴɈ' },
        { 'base': 'K', 'letters': 'KⓀＫḰǨḲĶḴƘⱩꝀꝂꝄꞢ' },
        { 'base': 'L', 'letters': 'LⓁＬĿĹĽḶḸĻḼḺŁȽⱢⱠꝈꝆꞀ' },
        { 'base': 'LJ', 'letters': 'Ǉ' },
        { 'base': 'Lj', 'letters': 'ǈ' },
        { 'base': 'M', 'letters': 'MⓂＭḾṀṂⱮƜ' },
        { 'base': 'N', 'letters': 'NⓃＮǸŃÑṄŇṆŅṊṈȠƝꞐꞤ' },
        { 'base': 'NJ', 'letters': 'Ǌ' },
        { 'base': 'Nj', 'letters': 'ǋ' },
        { 'base': 'O', 'letters': 'OⓄＯÒÓÔỒỐỖỔÕṌȬṎŌṐṒŎȮȰÖȪỎŐǑȌȎƠỜỚỠỞỢỌỘǪǬØǾƆƟꝊꝌ' },
        { 'base': 'OI', 'letters': 'Ƣ' },
        { 'base': 'OO', 'letters': 'Ꝏ' },
        { 'base': 'OU', 'letters': 'Ȣ' },
        { 'base': 'P', 'letters': 'PⓅＰṔṖƤⱣꝐꝒꝔ' },
        { 'base': 'Q', 'letters': 'QⓆＱꝖꝘɊ' },
        { 'base': 'R', 'letters': 'RⓇＲŔṘŘȐȒṚṜŖṞɌⱤꝚꞦꞂ' },
        { 'base': 'S', 'letters': 'SⓈＳẞŚṤŜṠŠṦṢṨȘŞⱾꞨꞄ' },
        { 'base': 'T', 'letters': 'TⓉＴṪŤṬȚŢṰṮŦƬƮȾꞆ' },
        { 'base': 'TZ', 'letters': 'Ꜩ' },
        { 'base': 'U', 'letters': 'UⓊＵÙÚÛŨṸŪṺŬÜǛǗǕǙỦŮŰǓȔȖƯỪỨỮỬỰỤṲŲṶṴɄ' },
        { 'base': 'V', 'letters': 'VⓋＶṼṾƲꝞɅ' },
        { 'base': 'VY', 'letters': 'Ꝡ' },
        { 'base': 'W', 'letters': 'WⓌＷẀẂŴẆẄẈⱲ' },
        { 'base': 'X', 'letters': 'XⓍＸẊẌ' },
        { 'base': 'Y', 'letters': 'YⓎＹỲÝŶỸȲẎŸỶỴƳɎỾ' },
        { 'base': 'Z', 'letters': 'ZⓏＺŹẐŻŽẒẔƵȤⱿⱫꝢ' },
        { 'base': 'a', 'letters': 'aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐ' },
        { 'base': 'aa', 'letters': 'ꜳ' },
        { 'base': 'ae', 'letters': 'æǽǣ' },
        { 'base': 'ao', 'letters': 'ꜵ' },
        { 'base': 'au', 'letters': 'ꜷ' },
        { 'base': 'av', 'letters': 'ꜹꜻ' },
        { 'base': 'ay', 'letters': 'ꜽ' },
        { 'base': 'b', 'letters': 'bⓑｂḃḅḇƀƃɓ' },
        { 'base': 'c', 'letters': 'cⓒｃćĉċčçḉƈȼꜿↄ' },
        { 'base': 'd', 'letters': 'dⓓｄḋďḍḑḓḏđƌɖɗꝺ' },
        { 'base': 'dz', 'letters': 'ǳǆ' },
        { 'base': 'e', 'letters': 'eⓔｅèéêềếễểẽēḕḗĕėëẻěȅȇẹệȩḝęḙḛɇɛǝ' },
        { 'base': 'f', 'letters': 'fⓕｆḟƒꝼ' },
        { 'base': 'g', 'letters': 'gⓖｇǵĝḡğġǧģǥɠꞡᵹꝿ' },
        { 'base': 'h', 'letters': 'hⓗｈĥḣḧȟḥḩḫẖħⱨⱶɥ' },
        { 'base': 'hv', 'letters': 'ƕ' },
        { 'base': 'i', 'letters': 'iⓘｉìíîĩīĭïḯỉǐȉȋịįḭɨı' },
        { 'base': 'j', 'letters': 'jⓙｊĵǰɉ' },
        { 'base': 'k', 'letters': 'kⓚｋḱǩḳķḵƙⱪꝁꝃꝅꞣ' },
        { 'base': 'l', 'letters': 'lⓛｌŀĺľḷḹļḽḻſłƚɫⱡꝉꞁꝇ' },
        { 'base': 'lj', 'letters': 'ǉ' },
        { 'base': 'm', 'letters': 'mⓜｍḿṁṃɱɯ' },
        { 'base': 'n', 'letters': 'nⓝｎǹńñṅňṇņṋṉƞɲŉꞑꞥ' },
        { 'base': 'nj', 'letters': 'ǌ' },
        { 'base': 'o', 'letters': 'oⓞｏòóôồốỗổõṍȭṏōṑṓŏȯȱöȫỏőǒȍȏơờớỡởợọộǫǭøǿɔꝋꝍɵ' },
        { 'base': 'oi', 'letters': 'ƣ' },
        { 'base': 'ou', 'letters': 'ȣ' },
        { 'base': 'oo', 'letters': 'ꝏ' },
        { 'base': 'p', 'letters': 'pⓟｐṕṗƥᵽꝑꝓꝕ' },
        { 'base': 'q', 'letters': 'qⓠｑɋꝗꝙ' },
        { 'base': 'r', 'letters': 'rⓡｒŕṙřȑȓṛṝŗṟɍɽꝛꞧꞃ' },
        { 'base': 's', 'letters': 'sⓢｓßśṥŝṡšṧṣṩșşȿꞩꞅẛ' },
        { 'base': 't', 'letters': 'tⓣｔṫẗťṭțţṱṯŧƭʈⱦꞇ' },
        { 'base': 'tz', 'letters': 'ꜩ' },
        { 'base': 'u', 'letters': 'uⓤｕùúûũṹūṻŭüǜǘǖǚủůűǔȕȗưừứữửựụṳųṷṵʉ' },
        { 'base': 'v', 'letters': 'vⓥｖṽṿʋꝟʌ' },
        { 'base': 'vy', 'letters': 'ꝡ' },
        { 'base': 'w', 'letters': 'wⓦｗẁẃŵẇẅẘẉⱳ' },
        { 'base': 'x', 'letters': 'xⓧｘẋẍ' },
        { 'base': 'y', 'letters': 'yⓨｙỳýŷỹȳẏÿỷẙỵƴɏỿ' },
        { 'base': 'z', 'letters': 'zⓩｚźẑżžẓẕƶȥɀⱬꝣ' }
    ];
    var diacriticsMap = {};
    for (var i = 0; i < defaultDiacriticsRemovalap.length; i++) {
        var letters = defaultDiacriticsRemovalap[i].letters.split("");
        for (var j = 0; j < letters.length; j++) {
            diacriticsMap[letters[j]] = defaultDiacriticsRemovalap[i].base;
        }
    }

    var keyCodes = {
        "backspace": 0,
        "tab": 9,
        "return": 13,
        "shift": 16,
        "ctrl": 17,
        "alt": 18,
        "pausebreak": 19,
        "capslock": 20,
        "escape": 27,
        " ": 32,
        "pageup": 33,
        "pagedown": 34,
        "end": 35,
        "home": 36,
        "left": 37,
        "up": 38,
        "right": 39,
        "down": 40,
        "+": [43, 107],
        "printscreen": 44,
        "insert": 45,
        "delete": 46,
        "0": [48, 96],
        "1": [49, 97],
        "2": [50, 98],
        "3": [51, 99],
        "4": [52, 100],
        "5": [53, 101],
        "6": [54, 102],
        "7": [55, 103],
        "8": [56, 104],
        "9": [57, 105],
        ";": [59, 186],
        "=": [61, 187],
        "a": 65,
        "b": 66,
        "c": 67,
        "d": 68,
        "e": 69,
        "f": 70,
        "g": 71,
        "h": 72,
        "i": 73,
        "j": 74,
        "k": 75,
        "l": 76,
        "m": 77,
        "n": 78,
        "o": 79,
        "p": 80,
        "q": 81,
        "r": 82,
        "s": 83,
        "t": 84,
        "u": 85,
        "v": 86,
        "w": 87,
        "x": 88,
        "y": 89,
        "z": 90,
        "*": 106,
        "-": [109, 189],
        ".": [110, 190],
        "/": [111, 191],
        "f1": 112,
        "f2": 113,
        "f3": 114,
        "f4": 115,
        "f5": 116,
        "f6": 117,
        "f7": 118,
        "f8": 119,
        "f9": 120,
        "f10": 121,
        "f11": 122,
        "f12": 123,
        "numlock": 144,
        "scrolllock": 145,
        ",": 188,
        "`": 192,
        "[": 219,
        "\\": 220,
        "]": 221,
        "'": 222
    };

    var keyNamesList = Object.keys(keyCodes);

    var keyNames = {};
    for (var i = 0; i < keyNamesList.length; i++) {
        var name = keyNamesList[i];
        var codes = keyCodes[name];
        if (!isNaN(codes)) {
            // codes is indeed a code
            keyNames[codes] = name;
        }
        else {
            for (var j = 0; j < codes.length; j++) {
                keyNames[codes[j]] = name;
            }
        }
    }

    var colors = {
        black: [0, 0, 0],
        white: [255, 255, 255],
        red: [255, 0, 0],
        lime: [0, 255, 0],
        blue: [0, 0, 255],
        yellow: [255, 255, 0],
        cyan: [0, 255, 255],
        fuchsia: [255, 0, 255],
        silver: [192, 192, 192],
        gray: [128, 128, 128],
        maroon: [128, 0, 0],
        olive: [128, 128, 0],
        green: [0, 128, 0],
        purple: [128, 0, 128],
        teal: [0, 128, 128],
        navy: [0, 0, 128],

        beige: [245, 245, 220],
        blueviolet: [138, 43, 226],
        darkgreen: [0, 100, 0],
        electricviolet: [143, 0, 255],
        indigo: [75, 0, 130],
        lightgreen: [144, 238, 144],
        orange: [255, 165, 0],
        pink: [255, 192, 203],
        skyblue: [0, 191, 255],
        wheelorange: [255, 127, 0]
    };

    /**
     * Remove all accents in str.
     * @param {type} str
     * @returns {String}    Returns the modified string.
     */
    this.removeAccents = function(str) {
        var letters = str.split("");
        var newStr = "";
        for (var i = 0; i < letters.length; i++) {
            newStr += letters[i] in diacriticsMap ? diacriticsMap[letters[i]] : letters[i];
        }
        return newStr;
    };

    /**
     * Replace all {Number} in text by corresponding string in argument.
     * Ex :</br>
     * format("{0} {1}", "Hello", "World") will return "Hello World".
     * @param {String} text
     * @returns {String}    Returns the modified string.
     */
    this.format = function(text) {
        var args = Array.prototype.slice.call(arguments, 1); // Get an array of arguments w/o the first
        return text.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined' ? args[number] : match;
        });
    };

    /**
     * Check if value is a Boolean.
     * @param {Boolean} value
     * @returns {Boolean}
     */
    this.checkBoolean = function(value) {
        return (typeof value !== 'undefined' && typeof value === 'boolean');
    };

    /**
     * Get value. If it's not a Boolean, throw an error.
     * @param {Boolean} value
     * @returns {Boolean}   Returns value.
     */
    this.getBoolean = function(value) {
        if (!this.checkBoolean(value)) {
            throw new Error(TEnvironment.getMessage("wrong boolean", value));
        }
        return value;
    };

    /**
     * Check if value is a Number.
     * @param {Number} value
     * @returns {Boolean}
     */
    this.checkInteger = function(value) {
        return (typeof value !== 'undefined' && !isNaN(value));
    };

    /**
     * Get value. If it's not a Number, throw an error.
     * @param {Number} value
     * @returns {Number}   Returns value.
     */
    this.getInteger = function(value) {
        if (!this.checkInteger(value)) {
            throw new Error(TEnvironment.getMessage("wrong integer", value));
        }
        return value;
    };

    /**
     * Check if value is a String.
     * @param {String} value
     * @returns {Boolean}
     */
    this.checkString = function(value) {
        return (typeof value !== 'undefined' && (typeof value === 'string' || value instanceof String));
    };

    /**
     * Get value. If it's not a String, throw an error.
     * @param {String} value
     * @returns {String}   Returns value.
     */
    this.getString = function(value) {
        if (!this.checkString(value)) {
            throw new Error(TEnvironment.getMessage("wrong string", value));
        }
        return value;
    };

    /**
     * Check if value is a Function.
     * @param {Function} value
     * @returns {Boolean}
     */
    this.checkFunction = function(value) {
        return (typeof value !== 'undefined' && typeof value === 'object' && typeof value.type !== 'undefined' && value.type === "function");
    };

    /**
     * Get value. If it's not a Function, throw an error.
     * @param {Function} value
     * @returns {Function}   Returns value.
     */
    this.getFunction = function(value) {
        if (!this.checkFunction(value)) {
            throw new Error(TEnvironment.getMessage("wrong function", value));
        }
        return value;
    };

    /**
     * Check if value is an Object.
     * @param {Object} value
     * @returns {Boolean}
     */
    this.checkObject = function(value) {
        return (typeof value === 'object' || this.checkFunction(value));
    };

    /**
     * Get value. If it's not an Object, throw an error.
     * @param {Object} value
     * @returns {Object}   Returns value.
     */
    this.getObject = function(value) {
        if (!this.checkObject(value)) {
            throw new Error(TEnvironment.getMessage("wrong object", value));
        }
        return value;
    };

    /**
     * Check if value is a Command.
     * @param {Command} value
     * @returns {Boolean}
     */
    this.checkCommand = function(value) {
        return this.checkString(value) || this.checkFunction(value);
    };

    /**
     * Get value. If it's not a Command, throw an error.
     * @param {Command} value
     * @returns {Command}   Returns value.
     */
    this.getCommand = function(value) {
        if (!this.checkCommand(value)) {
            throw new Error(TEnvironment.getMessage("wrong command", value));
        }
        return value;
    };

    /**
     * Check if value is an Array.
     * @param {Array} value
     * @returns {Boolean}
     */
    this.checkArray = function(value) {
        return (Array.isArray(value));
    };

    /**
     * Get value. If it's not an Array, throw an error.
     * @param {Array} value
     * @returns {Array}   Returns value.
     */
    this.getArray = function(value) {
        if (!this.checkArray(value)) {
            throw new Error(TEnvironment.getMessage("wrong array", value));
        }
        return value;
    };

    /**
     * Get the keyCode of value.
     * @param {String} value
     * @returns {keyCode|Boolean}   Returns keyCode if existing, else false.
     */
    this.getkeyCode = function(value) {
        if (this.checkString(value)) {
            if (typeof keyCodes[value] !== 'undefined') {
                return keyCodes[value];
            }
        }
        return false;
    };

    this.getkeyName = function(value) {
        if (typeof keyNames[value] !== 'undefined') {
            return keyNames[value];
        }
        return false;
    };

    this.getKeyNames = function() {
        return keyNamesList;
    };

    /**
     * Get a color from a string or from 3 integers.
     * Throw an error if parameters are false.</br>
     * If one of the three integers is greater than 255, lowers it to 255.
     * @param {String|Number} red
     * @param {Number} green
     * @param {Number} blue
     * @returns {Number[]}  Returns the color.
     */
    this.getColor = function(red, green, blue) {
        if (this.checkString(red)) {
            var translated = TEnvironment.getMessage("color-" + red);
            if (typeof colors[translated] !== 'undefined') {
                return colors[translated];
            }
            else {
                throw new Error(TEnvironment.getMessage("wrong color string", red));
            }
        }
        else if (this.checkInteger(red) && this.checkInteger(green) & this.checkInteger(blue)) {
            red = Math.min(Math.abs(red), 255);
            green = Math.min(Math.abs(green), 255);
            blue = Math.min(Math.abs(blue), 255);
            return [red, green, blue];
        }
        throw new Error(TEnvironment.getMessage("wrong color"));
    };

    /**
     * Convert a RGB component color to Hexadecimal component color.
     * @param {Number} color
     * @returns {String}    Component in Hexadecimal
     */
    this.componentToHex = function(color) {
        var hex = color.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    /**
     * Convert RGB color in Hexadecimal color.
     * @param {Number[]} color
     * @returns {String}    Color in Hexadecimal
     */
    this.rgbToHex = function(color) {
        return "#" + this.componentToHex(color[0]) + this.componentToHex(color[1]) + this.componentToHex(color[2]);
    };

    /**
     * Convert Hexadecimal color in RGB color.
     * @param {String} hex
     * @returns {Number[]}    Color in RGB
     */
    this.hexToRgb = function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : null;
    };

    /**
     * Reverse a color.
     * @param {Number[]} color
     * @returns {Number[]}
     */
    this.reverseColor = function(color) {
        var ret = []
        ret[0] = ((color[0] > 64 && color[0] < 192) ? ((color[0] + 128) % 256) : (255 - color[0]));
        ret[1] = ((color[1] > 64 && color[1] < 192) ? ((color[1] + 128) % 256) : (255 - color[1]));
        ret[2] = ((color[2] > 64 && color[2] < 192) ? ((color[2] + 128) % 256) : (255 - color[2]));
        return ret;
    }

    /**
     * Sort an array by ASCII. Consideres an upper case as a lower case.
     * @param {String[]} value
     * @returns {String[]}  Returns the sorted array.
     */
    this.sortArray = function(value) {
        return value.sort(function(a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
    };

    /**
     * Convert a string to Unicode.
     * @param {String} text
     * @returns {String}    Returns the converted String.
     */
    this.toUnicode = function(text) {
        var result = "";
        for (var i = 0; i < text.length; i++) {
            result += "\\u" + ("000" + text.charCodeAt(i).toString(16)).substr(-4);
        }
        return result;
    };

    /**
     * Creates a String of delimiters of a given number.
     * @param {type} level  Number of delimiters to have in the string
     * @param {type} value  Delimiter to add. If value is undefined,
     * '#' will be used.
     * @returns {String}    Returns the created string.
     */
    this.someDelimiters = function(level, value) {
        if (typeof value === "undefined")
            value = QUOTE_DELIMITER;
        var result = "";
        for (var i = 0; i < level; i++)
            result += value;
        return result;
    };

    /**
     * This method replaces quote delimiters (#) by a quotation mark (").
     * It allows to call a string in an another string
     * (this happens quite often in Declick). Ex:</br>
     * In Declick:  object.method("object2.methode(#"...#"))</br>
     * In Java:     object.method("object2.methode(\"...\"))</br>
     * @param {String} string   The String to change
     * @returns {String}    Returns the modified string.
     */
    this.parseQuotes = function(string) {
        var result = "";
        var charactersTab = string.split('');
        var delimiterEncountered = false;
        var escapeEncountered = false;
        var level = 0;
        var character;
        for (var i = 0; i < string.length; i++) {
            character = charactersTab[i];
            switch (character) {
                case QUOTE_DELIMITER:
                    delimiterEncountered = true;
                    level++;
                    break;
                case '\\':
                    escapeEncountered = true;
                    result += character;
                    break;
                case '"':
                    if (delimiterEncountered) {
                        result += this.someDelimiters(level, "\\");
                        result += '"';
                        delimiterEncountered = false;
                        level = 0;
                    }
                    else if (escapeEncountered) {
                        // Since escape character was encountered before quote, this is not a level 0 quote
                        // so we do not switch "removeAccent"
                        result += character;
                        escapeEncountered = false;
                    }
                    else { //We have a quotation mark (") of level 0,
                        //so we stop removing accents, or we restart removing them.
                        result += character;
                    }
                    break;
                default:
                    if (delimiterEncountered) {
                        // false alarm : write the delimiters to result
                        for (var j = 0; j < level; j++)
                            result += QUOTE_DELIMITER;
                        delimiterEncountered = false;
                        level = 0;
                    }
                    escapeEncountered = false;
                    result += character;
                    break;
            }
        }
        return result;
    };

    /**
     * Convert Unicode to ASCII.
     * @param {String} text Text to convert
     * @returns {String}    Returns the converted text.
     */
    this.convertUnicode = function(text) {
        var result = text.replace(/\\u([0-9a-fA-F]{4})/g,
            function(whole, group1) {
                return String.fromCharCode(parseInt(group1, 16));
            }
        );
        return result;
    };

    /**
     * Check if text ends with a '#' or a '\'
     * @param {String} text
     * @returns {Boolean}
     */
    this.isDelimiterEnded = function(text) {
        var regex = new RegExp(".*[#\\\\]$", "m");
        return regex.test(text);
    };

    /**
     * Check if text is a command.
     * @param {String} text
     * @returns {Boolean}
     */
    this.isACommand = function(text) {
        var regex = new RegExp(".*[A-Za-z0-9]+\\s*.\\s*[A-Za-z0-9]+\\s*\\(\\s*$", "m");
        return regex.test(text);
    };

    /**
     * Check if text is a new instance.
     * @param {String} text
     * @returns {Boolean}
     */
    this.isNewInstanceStringed = function(text) {
        var regex = new RegExp(".*[A-Za-z\\d]+\\s*=\\s*new\\s*[A-Za-z\\d]*\\s*\\(\\s*[\"\']$", "m");
        return regex.test(text);
    };

    /**
     * Check if text is a comparison.
     * @param {String} text
     * @returns {Boolean}
     */
    this.isComparison = function(text) {
        var regex = new RegExp(".*[\\=!]?\\=\\s*$", "m");
        return regex.test(text);
    };

    /**
     * Check if text is a String. 
     * @param {type} text
     * @returns {Boolean}
     */
    this.isStringElement = function(text) {
        var regex = new RegExp(".*[\\+\\,]\\s*$", "m");
        return regex.test(text);
    };

    /**
     * Check if a command contains an "else".
     * @param {type} text
     * @returns {Boolean}
     */
    this.isElsePresent = function(text) {
        //var regex = new RegExp("^.*else*$", "m");
        var regex = new RegExp("^.*[^[[:alpha:]]]*else[^[[:alpha:]]]*.*$", "m");
        //var regex  = new RegExp("^.*\\s*[^[[:alpha:]]]else[^[[:alpha:]]]*", "m");
        //^.*[^[[:alpha:]]]*else[^[[:alpha:]]]*.*$
        console.log("Regex : " + regex.toString() + " -- Verif : " + regex.test(text) + " -- Text : " + text);

        return regex.test(text);
    };

    /**
     * Add quote delimiter to quotes.</br>
     * If a quotation mark already have a '#' or '\', do nothing,
     * else add a '#' before.
     * @param {String} text
     * @returns {String}    Returns the modified string.
     */
    this.addQuoteDelimiters = function(text) {
        try {
            var leftPart = "";
            var newPart = "";
            var oldQuoteIndex = 0;
            var newQuoteIndex = text.indexOf('\"', 0);
            var level = 0;

            while (true) //we scan the String until we got sure there are no more quotation marks to find
            {
                //We search from the left the next index of a quotation mark (").
                //We stop if there is no more quotation mark (")
                if (newQuoteIndex === -1) {
                    leftPart += text.substring(oldQuoteIndex, text.length);
                    return leftPart;
                }
                //We add to the left part the text preceding this new quotation mark.
                newPart = text.substring(oldQuoteIndex, newQuoteIndex);
                leftPart += newPart;
                /* Now we have to to add some sharp symbols.
                 * There are three possible cases:
                 * 1.    #" or \"     There is already a delimiter before the quotation mark. In this case, no more delimiters should be added.
                 * 2.   The level increases when encountering the following patterns:
                 * 		object.method("
                 * 		object = new Class("
                 * 		= "	or == " or != "
                 * 		," or +"
                 * 3.	otherwise : the level decreases
                 */
                if (this.isDelimiterEnded(newPart)) {
                    // We ignore the quotation marks that have already some
                    // sharps or backslashes.
                    // do nothing
                    // TODO: checks if level changes for incomplete parsed strings
                }
                else if ((this.isACommand(newPart)) ||
                    (this.isNewInstanceStringed(newPart)) ||
                    (this.isComparison(newPart)) ||
                    (this.isStringElement(newPart))) {
                    leftPart += this.someDelimiters(level, QUOTE_DELIMITER);
                    level++;
                }
                else if (level > 0) {
                    level--;
                    leftPart += this.someDelimiters(level, QUOTE_DELIMITER);
                }
                else // (level == 0 -> abnormal case)
                {
                    leftPart += this.someDelimiters(level, QUOTE_DELIMITER);
                    level++;
                }
                //We set the old index that will let us know from where there is some text to copy.
                oldQuoteIndex = newQuoteIndex;
                newQuoteIndex = text.indexOf('\"', oldQuoteIndex + 1);
            }
        }
        catch (e) {
            TEnvironment.error("addQuoteDelimiters error: " + e);
            return text;
        }
    };

    /**
     * Add escaping slashes.
     * @param {String} string
     * @returns {String}    Returns the modified string.
     */
    this.addslashes = function(string) {
        return string.replace(/\\/g, '\\\\').
        replace(/\u0008/g, '\\b').
        replace(/\t/g, '\\t').
        replace(/\n/g, '\\n').
        replace(/\f/g, '\\f').
        replace(/\r/g, '\\r').
        replace(/'/g, '\\\'').
        replace(/"/g, '\\"');
    };

    /**
     * Get function name.
     * @param {String} object
     * @returns {String}
     */
    this.getFunctionName = function(object) {
        var string = object.toString();
        string = string.substr('function '.length);
        string = string.substr(0, string.indexOf('('));
        return string;
    };

    /**
     * Merge contents of two objects into the first object.
     * @param {Object} dest
     * @param {Object} source
     * @returns {Object}
     */
    this.extend = function(dest, source) {
        // just use jQuery extend
        return $.extend(dest, source);
    };

    /**
     * Checks if two numbers have the same value.
     * @param {Number} x
     * @param {Number} y
     * @returns {Boolean}
     */
    this.equalNumbers = function(x, y) {
        if (Math.abs(x - y) < 0.0000000001) {
            return true;
        }
        return false;
    }
}

var utilInstance = new TUtils()

export default utilInstance
